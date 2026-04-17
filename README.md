# Document Intelligence Platform

A full-stack web application with AI integration that processes book data and enables intelligent querying using RAG (Retrieval-Augmented Generation).

## Features
- **Backend**: Django REST Framework + SQLite + ChromaDB (Vector DB)
- **Frontend**: Vite + React + Tailwind CSS
- **Automation**: Selenium scraper to collect book metadata
- **AI Integration**: LangChain + Local HuggingFace Embeddings + OpenAI/LMStudio for LLM interactions (Insights, RAG)

## Setup Instructions

### 1. Backend Setup
1. Open a terminal in the `backend` directory.
2. Ensure you have a virtual environment. If not, create and activate one: `python -m venv venv` and `.\venv\Scripts\activate`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Add environment variables if you want to use OpenAI or Anthropic, otherwise, we default to local LM Studio endpoint at `http://localhost:1234/v1`. Create a `.env` file in the backend root:
   ```env
   OPENAI_API_KEY=your_key_here
   # Or for LM studio, keep it as 'lm-studio' and make sure LM studio is running a local server
   LLM_URL=http://localhost:1234/v1
   ```
5. Run migrations: `python manage.py migrate`.
6. Start the backend: `python manage.py runserver`.

### 2. Frontend Setup
1. Open a terminal in the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

### 3. Run Automation (Scraper)
1. Ensure the backend is running.
2. Open a terminal in the project root.
3. Run the Selenium scraper: `python scraper/scrape.py`.
4. This will navigate to a sample bookstore, extract details, and post them to the backend API, triggering vector database ingestion and AI Insight generation.

## API Documentation

### GET /api/books/
Returns a list of all ingested books along with their generated AI insights.

### POST /api/books/upload/
Expects a JSON payload:
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book Description...",
  "url": "https://...",
  "rating": 4.5
}
```
**Side effects**: Automatically generates a 2-3 sentence summary, genre, and sentiment analysis via the LLM. Also chunks the text and embeds it into ChromaDB.

### POST /api/books/ask/
Expects a JSON payload:
```json
{
  "query": "Are there any books about artificial intelligence?"
}
```
**Response**:
```json
{
  "answer": "Yes, based on the corpus, there is a book...",
  "sources": [{"title": "Book Title", "book_id": 1}]
}
```

## Sample Questions & Answers
* **Q**: What are some science fiction books?
* **A**: Based on the context, "Light in the Dark" is a science fiction book...
* **Q**: Tell me about a book with a dark tone.
* **A**: The book "The Midnight Shadow" has a dark and thrilling tone...

## Screenshots
[Include screenshots of the UI here - Dashboard, Q&A Interface, Details page]
