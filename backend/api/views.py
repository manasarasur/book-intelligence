from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Book
from .serializers import BookSerializer
from .services import ingest_book_to_rag, query_rag, generate_insights

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer

@api_view(['POST'])
def upload_book(request):
    """
    POST API: Uploading and processing books and details
    Expects: title, author, description, url, rating...
    """
    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        book = serializer.save()
        
        # Generate insights using AI
        if book.description:
            insights = generate_insights(book.description)
            book.insights = insights
            if "genre" in insights:
                book.genre = insights["genre"]
            book.save()
            
        # Ingest into RAG pipeline
        ingest_book_to_rag(book)
        
        return Response(BookSerializer(book).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def ask_question(request):
    """
    POST API: Asking questions about books (RAG query endpoint)
    Expects: {"query": "What are some books about magic?"}
    """
    query = request.data.get('query')
    if not query:
        return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    result = query_rag(query)
    return Response(result)

@api_view(['GET'])
def recommend_books(request, pk):
    """
    GET API: Recommends related books
    """
    book = get_object_or_404(Book, pk=pk)
    # Simple semantic similarity using vector DB, or a fake prompt recommendation.
    # For now, let's just query the vector DB using the description to find similar books
    if not book.description:
        return Response({"recommendations": []})
        
    # We can utilize RAG pipeline or create a specific function for it
    # We will do a generic query asking for similar books
    query = f"Books similar to: {book.title} by {book.author}. Description: {book.description}"
    result = query_rag(query)
    
    return Response({
        "book": book.title,
        "recommendation_reasoning": result['answer'],
        "sources": result['sources']
    })

@api_view(['POST'])
def analyze_book(request, pk):
    """
    POST API: Force regenerate AI insights for a specific book.
    """
    book = get_object_or_404(Book, pk=pk)
    if not book.description:
        return Response({"error": "No description to analyze"}, status=status.HTTP_400_BAD_REQUEST)
        
    insights = generate_insights(book.description)
    book.insights = insights
    if "genre" in insights:
        book.genre = insights["genre"]
    book.save()
    
    return Response(BookSerializer(book).data)
