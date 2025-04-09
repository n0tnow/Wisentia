from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.list_posts, name='list-posts'),
    path('posts/<int:post_id>/', views.post_detail, name='post-detail'),
    path('posts/create/', views.create_post, name='create-post'),
    path('posts/<int:post_id>/comment/', views.create_comment, name='create-comment'),
    path('posts/<int:post_id>/like/', views.like_post, name='like-post'),
    path('comments/<int:comment_id>/like/', views.like_comment, name='like-comment'),
    path('categories/', views.get_categories, name='get-categories'),
]