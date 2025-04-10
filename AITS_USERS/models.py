
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password

# Custom manager for the custom user model
class CustomUserManager(BaseUserManager):
 # Method to create a regular user
    def create_user(self, username, email, password, **extra_fields):
        # Ensure username, email, and password are provided
        if not username:
            raise ValueError("The Username field must be set")
        if not email:
            raise ValueError("The Email field must be set")
        if not password:
            raise ValueError("The Password field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

        # Method to create a superuser
    def create_superuser(self, username, email, password, **extra_fields):
        # Default values for superuser
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'academic registrar')  # Default role for superusers

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)



# College model (top-level entity)
class College(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name


# School model (each school belongs to a college)
class School(models.Model):
    name = models.CharField(max_length=100, unique=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='schools')   
    
    def __str__(self):
        return self.name


# Department model (each department now belongs to a school)
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='departments')

    def __str__(self):
        return self.name


# Programme model
class Programme(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    # Link Programme to a Department via a related name 'programmes'
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programmes')  

    def __str__(self):
        return self.name 


# Course model (using 'courses' as the related name)
class Course(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.name


# Custom User model to support multiple roles
class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('academic registrar', 'Academic Registrar'),
    ]
  
    role = models.CharField(
        max_length=100,
        choices=ROLE_CHOICES,
        default='student',
        verbose_name="User Role"
    )
    role_id = models.CharField(max_length=20, unique=True, null=True)
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    
    programme = models.ForeignKey(Programme, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    # Permissions and groups
    groups = models.ManyToManyField('auth.Group', related_name='ait_users_groups', blank=True)
    user_permissions = models.ManyToManyField('auth.Permission', related_name='ait_users_permissions', blank=True)
    
    objects = CustomUserManager()  # Attach the custom manager

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# CourseAllocation model
class CourseAllocation(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='allocations')
    lecturer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teaching_courses',
        limit_choices_to={'role': 'lecturer'}
    )
    academic_year = models.CharField(max_length=9)  # e.g., "2024/2025"
    semester = models.IntegerField(choices=[(1, 'First'), (2, 'Second')])
    
    class Meta:
        unique_together = ['course', 'lecturer', 'academic_year', 'semester']
    
    def __str__(self):
        return f"{self.course.code} - {self.lecturer.username} ({self.academic_year}, Sem {self.semester})"


# Issue model
class Issue(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    ISSUE_CATEGORIES = [
        ('missing_marks', 'Missing marks'),
        ('incorrect_grades', 'Incorrect grades'),
        ('remarking', 'Remarking'),
        ('other', 'Other'),
    ]
    year_of_study = models.CharField(max_length=20, null=True, blank=True)
    semester = models.IntegerField(choices=[(1, 'First'), (2, 'Second')], null=True, blank=True)
    category = models.CharField(max_length=100, choices=ISSUE_CATEGORIES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="submitted_issues",
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='issues')
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_issues",
        limit_choices_to={'role__in': ('lecturer', 'academic registrar')}
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Issue {self.id}: {self.category} - {self.status}" 


# IssueUpdate model
class IssueUpdate(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='updated')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issue_updates')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update on Issue #{self.issue.id} by {self.user.username}"
    

# Notification model
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}..."
