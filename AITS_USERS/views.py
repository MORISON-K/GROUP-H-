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
                settings.EMAIL_HOST_USER,  # Sender
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

        user = authenticate(**credentials) 
        if not user:
            raise AuthenticationFailed("Invalid login credentials")

        self.user = user  #  Assign user

        data = {}
        refresh = self.get_token(self.user)
        data['access'] = str(refresh.access_token)
        data['refresh'] = str(refresh)
        data['role'] = self.user.role
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
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        """
        Ensures the password is hashed before saving the user.
        """
        user = serializer.save()
        user.set_password(serializer.validated_data['password'])
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
            token.blacklist()
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
        return self.request.user


class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [permissions.AllowAny]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

class ProgrammeViewSet(viewsets.ModelViewSet):
    queryset = Programme.objects.all()
    serializer_class = ProgrammeSerializer
    permission_classes = [permissions.AllowAny]



class IssueView(APIView):
    """
    API view for authenticated users to create issues.
    """
    permission_classes = [permissions.IsAuthenticated]  # Ensure only authenticated users can access this view

    def post(self, request):
        serializer = IssueSerializer(data=request.data)
        if serializer.is_valid():
            # Save the issue with the authenticated user as the student
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


