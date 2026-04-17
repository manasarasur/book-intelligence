import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os

try:
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-gpu')
    
    driver = webdriver.Chrome(options=options)
    
    base_url = "http://localhost:5173"
    
    # Ensure assets dir exists
    screenshots_dir = os.path.join(os.path.dirname(__file__), 'assets')
    os.makedirs(screenshots_dir, exist_ok=True)
    
    print("Taking UI screenshots...")
    
    # 1. Dashboard
    driver.get(base_url)
    time.sleep(3) # Wait for load and animation
    driver.save_screenshot(os.path.join(screenshots_dir, 'dashboard.png'))
    print("Dashboard screenshot saved.")
    
    # 2. Q&A
    driver.get(f"{base_url}/") # App doesn't have React Router, uses activeTab state
    time.sleep(2)
    # Click QA tab - find by text
    qa_btn = driver.find_element("xpath", "//button[contains(text(), 'Q&A Ask AI')]")
    if qa_btn:
        qa_btn.click()
        time.sleep(1)
        driver.save_screenshot(os.path.join(screenshots_dir, 'qa_tab.png'))
        print("Q&A screenshot saved.")
        
        # 3. Enter a query to get a state
        input_box = driver.find_element("css selector", "input[type='text']")
        if input_box:
            input_box.send_keys("What books are good for sci-fi?")
            
            submit_btn = driver.find_element("xpath", "//button[contains(., 'Submit')]")
            if submit_btn:
                submit_btn.click()
                time.sleep(3) # wait for mock or real loading/fetch
                driver.save_screenshot(os.path.join(screenshots_dir, 'qa_answering.png'))
                print("Q&A Answering screenshot saved.")
    
    driver.quit()
    print("Done")
except Exception as e:
    print(f"Error taking screenshots: {e}")
