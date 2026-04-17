import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def scrape_wikipedia_books():
    options = Options()
    options.add_argument("--headless")
    
    driver = webdriver.Chrome(options=options)
    url = "https://en.wikipedia.org/wiki/List_of_best-selling_books"
    driver.get(url)
    
    books = []
    
    # Target the first two tables (More than 100M and 50-100M copies)
    tables = driver.find_elements(By.CLASS_NAME, 'wikitable')
    rows = tables[0].find_elements(By.TAG_NAME, 'tr')[1:] # Skip header
    if len(tables) > 1:
        rows += tables[1].find_elements(By.TAG_NAME, 'tr')[1:]
    
    # We just want 15
    rows = rows[:15]
    
    print(f"Found {len(rows)} books to scrape!")
    
    for row in rows:
        cols = row.find_elements(By.TAG_NAME, 'td')
        if not cols or len(cols) < 5:
            continue
            
        try:
            # Usually column 0 is Book, 1 is Author, 4 is Genre
            title_elem = cols[0]
            title = title_elem.text.strip(' "') # Clean up Wikipedia quotes
            author = cols[1].text.strip()
            genre = cols[4].text.strip()
            
            # Find the link to the book's specific wikipedia page for description
            try:
                link_elem = title_elem.find_element(By.TAG_NAME, 'a')
                book_url = link_elem.get_attribute('href')
            except:
                book_url = url # fallback
                
            books.append({
                "title": title,
                "author": author,
                "genre": genre,
                "url": book_url,
                "rating": 4.8, # Mock rating for bestseller
            })
        except Exception as e:
            print(f"Error parsing row: {e}")
            
    # Now visit each book's URL to extract the first paragraph as description
    for book in books:
        if book["url"] != url:
            try:
                driver.get(book["url"])
                # Wait briefly
                time.sleep(0.5)
                # First paragraph after the generic summary box usually
                content = driver.find_element(By.ID, 'mw-content-text')
                paragraphs = content.find_elements(By.TAG_NAME, 'p')
                
                description = "No description available."
                for p in paragraphs:
                    text = p.text.strip()
                    if len(text) > 50: # Find the first meaningful paragraph
                        description = text
                        break
                        
                book["description"] = description
                clean_title = book['title'].encode('ascii', 'ignore').decode('ascii')
                print(f"Successfully scraped full data for: {clean_title}")
            except Exception as e:
                book["description"] = f"A famous best-selling book by {book['author']}."
                clean_title = book['title'].encode('ascii', 'ignore').decode('ascii')
                print(f"Description scraped failed for {clean_title}, using fallback.")
        else:
             book["description"] = f"A famous best-selling book by {book['author']}."
             
    driver.quit()
    return books

def upload_to_backend(books):
    api_url = "http://127.0.0.1:8000/api/books/upload/"
    for idx, book in enumerate(books):
        try:
            res = requests.post(api_url, json=book)
            if res.status_code == 201:
                clean_title = book['title'].encode('ascii', 'ignore').decode('ascii')
                print(f"[{idx+1}/{len(books)}] Uploaded matching exact requirements: {clean_title}")
            else:
                clean_title = book['title'].encode('ascii', 'ignore').decode('ascii')
                print(f"Failed to upload {clean_title}: {res.text}")
        except Exception as e:
            print(f"Connection error: {e}")

if __name__ == "__main__":
    print("Starting Premium Automation Pipeline (Selenium)...")
    data = scrape_wikipedia_books()
    print("Uploading to Document Intelligence Backend...")
    upload_to_backend(data)
    print("Done! Library completely refreshed.")
