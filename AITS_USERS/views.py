from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserSerializer, DepartmentSerializer,ProgrammeSerializer,CollegeSerializer, IssueSerializer, IssueUpdateSerializer, CourseSerializer, NotificationSerializer, SchoolSerializer
from .models import User, Department, Issue, College, Programme, IssueUpdate, Course, Notification, School
from django.core.mail import send_mail
from django.conf import settings


class SendEmailView(APIView):
    """
    Handles sending welcome emails to users after registration.
    """
    def post(self, request):
        subject = "Welcome to AITS"
        message = "Hello, thank you for registering on our platform. We're glad to have you!"
        recipient_email = request.data.get("email")  # Get recipient email from request

        if not recipient_email:
            return Response({"error": "Email address is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,  # Sender from settings.py
                [recipient_email],  # Recipient list
                fail_silently=False,
            )
            return Response({"message": "Email sent successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


User = get_user_model()# Get the custom user model


class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    """
    Custom serializer for token authentication that allows login with either email or username.
    """
    def validate(self, attrs):
        credentials = {'password': attrs.get("password")}

        # Allow login with username or email
        try:
            validate_email(attrs.get("username"))
            credentials['email'] = attrs.get("username")
        except ValidationError:
            credentials['username'] = attrs.get("username")

        user = authenticate(**credentials) # Authenticate user
        if not user:
            raise AuthenticationFailed("Invalid login credentials")

        self.user = user  #  Assign user

         # Generate JWT tokens
        data = {}
        refresh = self.get_token(self.user)
        data['access'] = str(refresh.access_token)
        data['refresh'] = str(refresh)
        data['role'] = self.user.role  # Add custom user data (like role)
        return data



class CustomTokenObtainPairView(TokenObtainPairView):
    """
    This view authenticates the user and returns a pair of access and refresh JWT tokens.
    You can customize the serializer if you need to add extra data in the token response.
    """
    
    serializer_class = CustomTokenObtainSerializer

class RegisterView(generics.CreateAPIView):
    """
    Registers a new user.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to access this view (even unauthenticated)
    
    def perform_create(self, serializer):
        """
        Ensures the password is hashed before saving the user.
        """
        user = serializer.save()
        user.set_password(serializer.validated_data['password'])  # Securely hash the password
        user.save()



class LogoutView(APIView):
    """
    Logs out the user by blacklisting their refresh token.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            # Validate refresh token exists
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist() # Invalidate the refresh token
            return Response(
                {"message": "Successfully logged out."}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_400_BAD_REQUEST
            )
class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieves or updates the authenticated user's details.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
         # Return the currently logged-in user
        return self.request.user


# ViewSet for listing, creating, updating, deleting colleges
class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [permissions.AllowAny]

# ViewSet for departments
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

# ViewSet for programmes
class ProgrammeViewSet(viewsets.ModelViewSet):
    queryset = Programme.objects.all()
    serializer_class = ProgrammeSerializer
    permission_classes = [permissions.AllowAny]



class IssueView(APIView):
    """
    API view for authenticated users to create issues.
    """
    permission_classes = [permissions.IsAuthenticated]  

    def post(self, request):
        serializer = IssueSerializer(data=request.data)
        if serializer.is_valid():
            # Save the issue with the authenticated user as the student
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class YearOptionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        years = ["Year One", "Year Two", "Year Three", "Year Four", "Year Five"]
        return Response(years)

class SemesterOptionsView(APIView):
    
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        semesters = [1, 2]
        return Response(semesters)
    

   

# In your views.py file

import logging
logger = logging.getLogger(__name__)

class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Try reading query parameters if provided.
        department_id = self.request.query_params.get('department')
        programme_id = self.request.query_params.get('programme')
        logger.debug("CourseListView: department_id=%s, programme_id=%s", department_id, programme_id)
        
        # If a programme query parameter is provided, filter courses by that programme's department.
        if programme_id:
            try:
                programme = Programme.objects.get(id=programme_id)
                logger.debug("Found programme: %s with department: %s", programme, programme.department)
                qs = Course.objects.filter(department=programme.department)
                if qs.exists():
                    return qs
                else:
                    logger.debug("No courses found for programme's department.")
            except Programme.DoesNotExist:
                logger.debug("Programme with id %s does not exist", programme_id)
        
        # If a department query parameter is provided, filter courses by that department.
        if department_id:
            qs = Course.objects.filter(department__id=department_id)
            logger.debug("Filtering courses by department id %s; found %s courses", department_id, qs.count())
            if qs.exists():
                return qs

        # Fallback: Use details from the authenticated user.
        user = self.request.user
        if user and user.is_authenticated:
            # If the user has a programme, try using its department.
            if hasattr(user, 'programme') and user.programme:
                qs = Course.objects.filter(department=user.programme.department)
                logger.debug("Using user's programme (id %s) with department %s; found %s courses", 
                             user.programme.id, user.programme.department, qs.count())
                if qs.exists():
                    return qs
                else:
                    logger.debug("No courses found for user's programme department.")
            # If the user has a department set directly.
            if hasattr(user, 'department') and user.department:
                qs = Course.objects.filter(department=user.department)
                logger.debug("Using user's department (id %s); found %s courses", 
                             user.department.id, qs.count())
                if qs.exists():
                    return qs
                else:
                    logger.debug("No courses found for user's department.")
            else:
                logger.debug("User does not have a programme or department set.")
        else:
            logger.debug("No authenticated user found.")

        # For debugging/testing: return all courses if no courses were found via filtering.
        qs = Course.objects.all()
        logger.debug("Fallback: returning all courses; count=%s", qs.count())
        return qs


class DepartmentListView(generics.ListAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get departments based on user's college
        user = self.request.user
        if user.college:
            return Department.objects.filter(school__college=user.college)
        return Department.objects.none()

class ProgrammeListView(generics.ListAPIView):
    serializer_class = ProgrammeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter programmes by department from query params
        department_id = self.request.query_params.get('department')
        if department_id:
            return Programme.objects.filter(department__id=department_id)
        return Programme.objects.none()

class IssueCategoryOptionsView(APIView):
    """
    API view to return the available issue categories.
    This reads directly from the Issue model's choices.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Issue.ISSUE_CATEGORIES
        data = [{'value': value, 'display': display} for value, display in categories]
        return Response(data)    