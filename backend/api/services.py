import os
from dotenv import load_dotenv

load_dotenv()
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .models import Book

# Initialize Embeddings. HuggingFace is free and runs locally.
try:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
except Exception as e:
    embeddings = None
    print(f"Failed to load embeddings: {e}")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    LM_STUDIO_URL = os.getenv("LLM_URL") # Will be None unless explicitly set for a proxy
else:
    OPENAI_API_KEY = "lm-studio"
    LM_STUDIO_URL = os.getenv("LLM_URL", "http://localhost:1234/v1")

# Initialize ChromaDB
persist_directory = os.path.join(os.path.dirname(__file__), '..', 'chroma_db')
if not os.path.exists(persist_directory):
    os.makedirs(persist_directory)

try:
    vector_store = Chroma(
        collection_name="books",
        embedding_function=embeddings,
        persist_directory=persist_directory
    )
except Exception:
    vector_store = None

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def ingest_book_to_rag(book: Book):
    if not vector_store or not embeddings:
        return
        
    text = f"Title: {book.title}\nAuthor: {book.author}\nGenre: {book.genre or 'Unknown'}\nDescription: {book.description}"
    chunks = text_splitter.split_text(text)
    
    metadatas = [{"book_id": book.id, "title": book.title, "author": book.author} for _ in chunks]
    vector_store.add_texts(texts=chunks, metadatas=metadatas)

def query_rag(query: str):
    if not vector_store:
        return {"answer": "Vector store not initialized.", "sources": []}
        
    # Using ChatOpenAI pointed at LM Studio (or real OpenAI if key is set)
    llm = ChatOpenAI(
        base_url=LM_STUDIO_URL,
        api_key=OPENAI_API_KEY,
        temperature=0.7,
        model="gpt-3.5-turbo",
        max_retries=1,
        timeout=120, # Increase timeout to 120s for slower local LLMs
    )
    
    retriever = vector_store.as_retriever(search_kwargs={"k": 4})
    
    # Simple explicit string formatting for local LLM stability
    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    prompt = f"""You are a brilliant and knowledgeable AI librarian. Respond thoughtfully to the user's question or book request.
    
    Context from our library:
    {context}

    Instructions:
    1. Answer the user's question accurately.
    2. If they ask for recommendations, suggest books fitting their needs.
    3. If the Context is not helpful, use your own general knowledge to answer.
    4. Keep your formatting clean and do not output any internal logic.

    User Question: {query}
    """
    
    try:
        response = llm.invoke(prompt)
        answer = response.content
    except Exception as e:
        if context.strip():
            answer = "The AI service is currently unavailable. However, here is the relevant information I found in the library:\n\n" + context
        else:
            answer = "The AI service is currently unavailable, and I couldn't find any specific information in the library matching your query."
        
    sources = [{"title": doc.metadata.get("title", ""), "book_id": doc.metadata.get("book_id")} for doc in docs]
    # Remove duplicate sources
    unique_sources = []
    seen = set()
    for s in sources:
        if s["book_id"] not in seen:
            unique_sources.append(s)
            seen.add(s["book_id"])
            
    return {
        "answer": answer,
        "sources": unique_sources
    }

def generate_insights(description: str):
    """Generates AI insights (Summary, Genre, Recommendations)"""
    llm = ChatOpenAI(
        base_url=LM_STUDIO_URL,
        api_key=OPENAI_API_KEY,
        temperature=0.3,
        model="gpt-3.5-turbo",
        max_retries=1,
        timeout=120,
    )
    
    prompt = f"""Analyze the book description below.
    Output ONLY a valid JSON object with absolutely no surround text or markdown.
    
    Format:
    {{"summary": "A brief 2 sentence summary.", "genre": "Predicted genre", "sentiment": "Tone of the book"}}

    Description: {description}
    """
    try:
        response = llm.invoke(prompt)
        import json, re
        try:
            content = response.content
            # Extremely robust JSON extraction using regex for weak LLMs
            match = re.search(r'\{[^{}]*\}', content)
            if match:
                json_str = match.group(0)
                insights = json.loads(json_str)
                return insights
            else:
                raise ValueError("No JSON brackets found in output")
        except Exception as json_err:
            return {"summary": "Failed to parse JSON. Model output was invalid.", "raw": response.content, "error": str(json_err)}
    except Exception as e:
         return {"error": str(e), "summary": "AI service is currently unavailable. Ensure the AI backend is running to generate insights."}
