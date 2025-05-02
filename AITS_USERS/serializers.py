from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, Department, Issue, College, Programme, IssueUpdate, Course, Notification, School

User = get_user_model()

# Serializer for the Department model
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


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


# Serializer for the main User model
from rest_framework import serializers
from .models import User, Department, College, Programme
from .serializers import DepartmentSerializer, CollegeSerializer, ProgrammeSerializer

class UserSerializer(serializers.ModelSerializer):
    # nested, read‑only
    department = DepartmentSerializer(read_only=True)
    college    = CollegeSerializer(read_only=True)
    programme  = ProgrammeSerializer(read_only=True)

    # write‑only PK inputs
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        source='department'
    )
    college_id = serializers.PrimaryKeyRelatedField(
        queryset=College.objects.all(),
        write_only=True,
        source='college'
    )
    programme_id = serializers.PrimaryKeyRelatedField(
        queryset=Programme.objects.all(),
        write_only=True,
        source='programme'
    )

    # never return password
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id','username','email','password',
            'first_name','last_name',
            'role','role_id',
            'college','college_id',
            'department','department_id',
            'programme','programme_id',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email':    {'required': True},
            'username': {'required': True},
        }

    def create(self, validated_data):
        return User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = validated_data.get('first_name',''),
            last_name  = validated_data.get('last_name',''),
            role       = validated_data.get('role','student'),
            role_id    = validated_data.get('role_id'),
            college    = validated_data.get('college'),
            department = validated_data.get('department'),
            programme  = validated_data.get('programme'),
        )

    def update(self, instance, validated_data):
        # hash password if being updated
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)    


# Serializer for updates made to an issue
class IssueUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueUpdate
        fields = ['id', 'issue', 'user', 'comment', 'created_at']
        read_only_fields = ['created_at']  # Prevent modification of created_at field


# Serializer for academic courses
class CourseSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    class Meta:
        model = Course 
        fields = ['id', 'code', 'name', 'department']  

# Serializer for issues reported by users
# serializers.py

from rest_framework import serializers
from .models import Issue, Course, User
from .serializers import UserSerializer, IssueUpdateSerializer  # adjust imports

class IssueSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    updates = IssueUpdateSerializer(many=True, read_only=True, source='updated')
    
    # write‑only PK for create/update
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        write_only=True
    )
    # nested read‑only for display
    course_details = CourseSerializer(source='course', read_only=True)
    
    year_of_study = serializers.CharField()
    semester     = serializers.IntegerField()
    
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['lecturer','academic registrar']),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Issue
        fields = [
            'id',
            'year_of_study',
            'semester',
            'category',
            'description',
            'status',
            'student',
            'course',          # now write‑only PK
            'course_details',  # nested read
            'assigned_to',
            'created_at',
            'updated_at',
            'updates'
        ]
        read_only_fields = ['created_at','updated_at']

    def create(self, validated_data):
        # the view is doing serializer.save(student=request.user), so:
        return Issue.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'assigned_to' in validated_data:
            instance.assigned_to = validated_data['assigned_to']
            instance.status = 'in_progress'
            instance.save()
        return instance



# Serializer for notifications sent to users
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'issue', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']


# Custom serializer for handling user registration

class UserRegistrationSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    # accept IDs instead of slug‑names
    college_id    = serializers.PrimaryKeyRelatedField(
        queryset=College.objects.all(),
        write_only=True,
        source='college',
        required=False,
        allow_null=True
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        source='department',
        required=False,
        allow_null=True
    )
    programme_id  = serializers.PrimaryKeyRelatedField(
        queryset=Programme.objects.all(),
        write_only=True,
        source='programme',
        required=False,
        allow_null=True
    )

    class Meta:
        model  = User
        fields = [
            'username', 'email',
            'password', 'confirm_password',
            'first_name','last_name',
            'role','role_id',
            'college_id','department_id','programme_id',
        ]
        extra_kwargs = {
            'email':    {'required': True},
            'username': {'required': True},
        }

    def validate(self, data):
        # password confirmation
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords must match."})

        role = data.get('role')
        # student must have college & programme
        if role == 'student':
            if not data.get('college'):
                raise serializers.ValidationError({"college_id": "College is required for students."})
            if not data.get('programme'):
                raise serializers.ValidationError({"programme_id": "Programme is required for students."})
        # lecturer must have department
        if role == 'lecturer' and not data.get('department'):
            raise serializers.ValidationError({"department_id": "Department is required for lecturers."})
        # registrar must have college
        if role == 'academic registrar' and not data.get('college'):
            raise serializers.ValidationError({"college_id": "College is required for registrars."})

        return data

    def create(self, validated_data):
        # now validated_data has keys:
        # 'username','email','password','first_name','last_name','role','role_id',
        # plus possibly 'college', 'department', 'programme'
        return User.objects.create_user(**validated_data)