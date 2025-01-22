#!/usr/bin/env python3

import argparse
import datetime
from typing import List, Set
from bs4 import BeautifulSoup
import requests
import sys
import time
import os
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from database import SessionLocal
from models.order import Order
from langchain_community.document_loaders import WebBaseLoader
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def extract_article_links(soup: BeautifulSoup) -> List[tuple[str, str]]:
    """Extract article permalinks and titles from the HTML content."""
    # Find all article links - they are typically in h2 tags within post elements
    articles = soup.select('.post')
    items = []
    
    for article in articles:
        # Find the heading that contains the link
        heading = article.find('h2')
        if heading:
            link = heading.find('a')
            if link and link.get('href'):
                # Get the title from the wp-block-post-title class
                title_elem = article.find(class_='wp-block-post-title')
                title = title_elem.get_text(strip=True) if title_elem else ""
                items.append((link['href'], title))
    
    return items

def get_pagination_links(soup: BeautifulSoup, base_url: str) -> List[str]:
    """Extract pagination links from the page."""
    pagination = soup.select('.page-numbers')
    links = []
    
    for page_link in pagination:
        href = page_link.get('href')
        if href and href != '#' and href != base_url:
            links.append(href)
    
    return list(set(links))  # Remove duplicates

def get_content_summary(content: str) -> tuple[str, str, str]:
    """Get a 500-word summary, tweet-length excerpt, and 500 word explanation of the content using OpenAI."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    prompt = f"""Please provide two things:
1. A 500-word summary of the following executive order or presidential action
2. A compelling tweet-length excerpt (max 280 characters) that captures the key point. Be factual and concise. Don't take any liberties with the content or take sides.  Always end with '#USA #POTUS #Trump'.
3. A 500 word explanation of the executive order or presidential action. Be as factual as possible. Explain the context of the action and the impact it will have on the country. Explain as if the reader is a high school student.
Executive Order:
{content}

Format your response exactly like this:
SUMMARY:
[500 word summary]

TWEET:
[tweet-length excerpt]
    
EXPLANATION:
[500 word explanation of the executive order or presidential action]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that summarizes presidential actions and executive orders. For context, President Donald J. Trump is now the 47th President of the United States. All these executive orders and presidential actions are from his presidency. JD Vance is the Vice-President of the United States."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1600,
        temperature=0.7
    )
    
    response_text = response.choices[0].message.content
    
    # Split the response into summary and tweet
    explanation = response_text.split("EXPLANATION:")[1].strip()
    excerpt = response_text.split("TWEET:")[1].split("EXPLANATION:")[0].strip()
    summary = response_text.split("SUMMARY:")[1].split("TWEET:")[0].strip()

    return summary, excerpt, explanation

def scrape_article_content(url: str) -> tuple[str, str]:
    """Scrape the content and publication date of an article using WebBaseLoader.
    
    Returns:
        tuple: (content, published_date)
    """
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract the entry-content
    content_div = soup.find('div', class_='entry-content')
    content = content_div.get_text(strip=False) if content_div else ""

    # Replace all <p> and <br> tags with newlines
    content = content.replace('<p>', '\r\n')
    content = content.replace('</p>', '\r\n')
    content = content.replace('<br>', '\r\n')

    # Extract the publication date
    date_div = soup.find('div', class_='wp-block-post-date')
    published_at = None
    if date_div:
        time_tag = date_div.find('time')
        if time_tag and time_tag.get('datetime'):
            published_at = time_tag['datetime']
    
    return content, published_at

def scrape_wh_actions(url: str = "https://www.whitehouse.gov/presidential-actions/") -> List[str]:
    """
    Scrape presidential actions from the White House website and store in database.
    
    Args:
        url: The URL of the White House presidential actions page
        
    Returns:
        List of article permalinks
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    
    all_article_links = []
    scraped_pages = set()  # Keep track of pages we've already scraped
    pages_to_scrape = [url]  # Initialize with the first page
    
    db = SessionLocal()
    try:
        while pages_to_scrape:
            current_url = pages_to_scrape.pop(0)
            
            if current_url in scraped_pages:
                continue
                
            print(f"Scraping page: {current_url}", file=sys.stderr)
            
            # Make the request
            response = requests.get(current_url, headers=headers)
            response.raise_for_status()
            
            # Parse the HTML content
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract article links and titles from current page
            items = extract_article_links(soup)
            all_article_links.extend([link for link, _ in items])
            
            # Mark this page as scraped
            scraped_pages.add(current_url)
            
            # Get pagination links
            pagination_links = get_pagination_links(soup, url)
            
            # Add new pages to scrape
            for page_link in pagination_links:
                if page_link not in scraped_pages:
                    pages_to_scrape.append(page_link)
            
            # Store links and titles in database
            for link, title in items:
                # Check if URL already exists
                existing_order = db.query(Order).filter(Order.url == link).first()
                if not existing_order:
                    order = Order(url=link, title=title)
                    order.created_at = datetime.datetime.now()
                    db.add(order)
            
            db.commit()

            time.sleep(1)
        
        # Filter out links that already exist in the database
        existing_urls = set(url[0] for url in db.query(Order.url).where(Order.content.isnot(None)))
        filtered_links = [link for link in set(all_article_links) if link not in existing_urls]
        
        # Process each filtered link
        for link in filtered_links:
            print(f"Scraping content from: {link}", file=sys.stderr)
            content, published_at = scrape_article_content(link)
            
            if content:
                print(f"Getting summary for: {link}", file=sys.stderr)
                summary, excerpt, explanation = get_content_summary(content)
                
                # Update the database with the content, summary and tweet
                order = db.query(Order).filter(Order.url == link).first()
                if order:
                    order.content = content
                    order.summary = summary
                    order.excerpt = excerpt
                    order.explanation = explanation
                    order.published_at = published_at
                    db.commit()

            # Be nice to the servers
            time.sleep(2)
        
        return filtered_links
        
    except requests.RequestException as e:
        db.rollback()
        print(f"Error fetching content: {str(e)}", file=sys.stderr)
        return all_article_links  # Return what we have so far
    except Exception as e:
        db.rollback()
        print(f"Error scraping content: {str(e)}", file=sys.stderr)
        return all_article_links  # Return what we have so far
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description='Scrape White House presidential actions.')
    parser.add_argument('--url', 
                       default="https://www.whitehouse.gov/presidential-actions/",
                       help='URL to scrape (default: White House presidential actions page)')
    
    args = parser.parse_args()
    
    # Scrape the links
    links = scrape_wh_actions(args.url)
    
    # Print each link on a new line
    if links:
        for link in links:
            print(link)
    else:
        print("No links found", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
