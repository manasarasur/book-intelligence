import os
import django

# Setup Django Environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import Book
from api.services import generate_insights

def regenerate_failed_insights():
    books = Book.objects.all()
    for book in books:
        if not book.insights or "Could not connect" in book.insights.get("summary", ""):
            print(f"Regenerating insights for: {book.title}")
            try:
                insights = generate_insights(book.description)
                book.insights = insights
                if "genre" in insights:
                    book.genre = insights["genre"]
                book.save()
                print("Success.")
            except Exception as e:
                print(f"Failed. Error: {e}")

if __name__ == "__main__":
    regenerate_failed_insights()
