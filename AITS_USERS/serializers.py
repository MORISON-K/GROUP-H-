from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, Department, Issue, College, Programme, IssueUpdate, Course, Notification, School



# Serializer for the main User model
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) #Ensure password is write-only for security
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'role', 'role_id', 'college', 'department', 'programme']
        extra_kwargs = {
            'password': {'write_only': True} # Another way to ensure password is not returned in responses
        }
    
    # Custom method to create a user with required fields
    def create(self, validated_data):
         # Custom user creation method with required fields
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data.get('username', validated_data['email']),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student'),
            role_id=validated_data.get('role_id'),
            college=validated_data.get('college'),
            department=validated_data.get('department'),
            programme=validated_data.get('programme')
        )
        return user

# Serializer for the Department model
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

# Serializer for updates made to an issue
class IssueUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueUpdate
        fields = ['id', 'issue', 'user', 'comment', 'created_at']
        read_only_fields = ['created_at']  # Prevent modification of created_at field

# Serializer for issues reported by users
class IssueSerializer(serializers.ModelSerializer):
    updates = IssueUpdateSerializer(many=True, read_only=True, source='updated')
    year_of_study = serializers.CharField()
    semester = serializers.IntegerField()
    
    class Meta:
        model = Issue
        fields = ['id', 'year_of_study', 'semester', 'category', 'description', 'status', 'student', 
                  'course', 'assigned_to', 'created_at', 'updated_at', 'updates']
        read_only_fields = ['created_at', 'updated_at']  # Prevent modification of timestamps


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name'] 

# Serializer for schools (which belong to colleges)
class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School              
        fields = ['id', 'name', 'college'] 

# Serializer for academic programmes
class ProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = ['id', 'code', 'name', 'department']  


# Serializer for academic courses
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course 
        fields = ['id', 'code', 'name', 'department']  


# Serializer for notifications sent to users
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'issue', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']


# Custom serializer for handling user registration
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Hide password in response
    confirm_password = serializers.CharField(write_only=True)  # Ensure password confirmation
    college = serializers.SlugRelatedField(
        slug_field='name',
        queryset=College.objects.all(),
        required=False,
        allow_null=True
    )
    department = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )
    programme = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Programme.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 
                  'role', 'role_id', 'college', 'department', 'programme']
    
    # Validate data before creating user
    def validate(self, data):
          # Ensure password and confirm_password match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        role = data.get('role')
        

        # Additional validation for specific roles
        if role == 'student':
            if not data.get('college'):
                raise serializers.ValidationError({"college": "College is required for students."})
            if not data.get('programme'):
                raise serializers.ValidationError({"programme": "Programme is required for students."})
        
        if role == 'lecturer' and not data.get('department'):
            raise serializers.ValidationError({"department": "Department is required for lecturers."})
        
        return data
    
    # Create user after validation
    def create(self, validated_data):
        validated_data.pop('confirm_password') # Remove confirm_password before saving
        return User.objects.create_user(**validated_data)  # Create user using Django's create_user method

       