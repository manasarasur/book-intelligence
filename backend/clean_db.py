import os
import django
import re

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import Book

def clean_database():
    print("Cleaning database metadata...")
    for book in Book.objects.all():
        # Clean bad genre data (like "65 MILLION[39]")
        if "MILLION" in str(book.genre).upper() or "[" in str(book.genre):
            book.genre = "Fantasy & Adventure" if "Harry Potter" in book.title or "Hobbit" in book.title or "Alice" in book.title else "Classic Fiction"
        
        # Clean author if missing
        if not book.author or book.author == "Unknown":
            book.author = "Classic Author"
            
        book.save()
    print("Database perfectly cleaned!")

if __name__ == "__main__":
    clean_database()
