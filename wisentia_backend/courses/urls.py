from django.urls import path
from . import api

urlpatterns = [
    path('categories/', api.category_list, name='category-list'),
    path('', api.course_list, name='course-list'),
    path('<int:course_id>/', api.course_detail, name='course-detail'),
    path('<int:course_id>/contents/', api.course_contents, name='course-contents'),
    path('<int:course_id>/progress/', api.user_course_progress, name='user-course-progress'),
]