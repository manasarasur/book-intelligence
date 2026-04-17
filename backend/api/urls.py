from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'books', views.BookViewSet, basename='book')

urlpatterns = [
    path('books/upload/', views.upload_book, name='upload_book'),
    path('books/<int:pk>/analyze/', views.analyze_book, name='analyze_book'),
    path('books/ask/', views.ask_question, name='ask_question'),
    path('books/recommend/<int:pk>/', views.recommend_books, name='recommend_books'),
    path('', include(router.urls)),
]
