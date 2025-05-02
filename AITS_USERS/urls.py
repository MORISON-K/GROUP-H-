from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
#from .views import SendEmailView, IssueWorkflowViewSet

from .views import (
    IssueWorkflowViewSet,
    IssueViewSet,
    LecturerByDepartmentView,
    RegistrarIssueHistoryView,
    LecturerIssueListView,
    SendEmailView, RegisterView, CustomTokenObtainPairView,
    LogoutView, UserDetailView, YearOptionsView, SemesterOptionsView,
    CourseListView, DepartmentListView, ProgrammeListView,
    IssueCategoryOptionsView, StudentIssueListView
)


# Create a router for automatic URL routing for viewsets (like CollegeViewSet, etc.
router = DefaultRouter()
router.register(r'colleges', views.CollegeViewSet)  # /colleges/
router.register(r'departments', views.DepartmentViewSet) # /departments/
router.register(r'programmes', views.ProgrammeViewSet) # /programmes/
router.register(r'issues/workflow', IssueWorkflowViewSet, basename='issue-workflow')# /issues/workflow/
router.register(r'issues', IssueViewSet, basename='issues')


# Main URL patterns for the app
urlpatterns = [
     # User authentication routes
    path('auth/register/', views.RegisterView.as_view(), name='register'), # Register new user
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='login'),  # Login (JWT token)
    path('auth/logout/', views.LogoutView.as_view(), name='logout'), # Logout (blacklist token)
    path('auth/user/', views.UserDetailView.as_view(), name='user_details'), # Get or update current user 

    # path(
    #   'issues/workflow/<int:pk>/mark_in_progress/',
    #   IssueWorkflowViewSet.as_view({'post': 'mark_in_progress'}),
    #   name='issue-mark-in-progress'
    # ),
    # path(
    #   'issues/workflow/<int:pk>/resolve/',
    #   IssueWorkflowViewSet.as_view({'post': 'resolve'}),
    #   name='issue-resolve'
    # ),

    path('issues/assigned/', LecturerIssueListView.as_view(), name='assigned-issues'),
    path('issues/history/', RegistrarIssueHistoryView.as_view(), name='issues-history'),

    # path('issues/assigned/', LecturerIssueListView.as_view(), name='assigned-issues'),
    # path('issues/history/', RegistrarIssueHistoryView.as_view(), name='issues-history'),
    # Include automatically generated URLs for viewsets (colleges, departments, programmes)
    path('', include(router.urls)),

    # Send welcome email after registration
    path('send-email/', SendEmailView.as_view(), name='send-email'),   # POST email to trigger sending
    path('send-email/', SendEmailView.as_view(), name='send-email'),
    path('years/', views.YearOptionsView.as_view(), name='year-options'),
    path('semesters/', views.SemesterOptionsView.as_view(), name='semester-options'),  
    path('courses/', views.CourseListView.as_view(), name='courses-list'),  
    path('departments/filtered/', views.DepartmentListView.as_view(), name='department-filtered'),
    path('programmes/filtered/', views.ProgrammeListView.as_view(), name='programme-filtered'),
    path('issue-categories/', views.IssueCategoryOptionsView.as_view(), name='issue-categories'),
    path('issues/', views.IssueView.as_view(), name='issues'),
    path('my-issues/', views.StudentIssueListView.as_view(), name='my-issues'),
    path('lecturers/', LecturerByDepartmentView.as_view(), name='lecturers-list'),
   
]

