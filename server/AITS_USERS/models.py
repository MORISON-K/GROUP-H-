from django.contrib.auth.models import AbstractUser # type: ignore
from django.db import models # type: ignore

# Custom User Model to support multiple roles
class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Administrator'),
    ]

      
      
      
    ISSUE_CATEGORIES = [
        ('missing_marks', 'Missing_marks'),
        ('incorrect_grades', 'Incorrect_grades'),
        ('remarking', 'Remarking'),
        ('test_alert', 'Test_alert')
        ('other', 'Other'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    groups = models.ManyToManyField('auth.Group', related_name='ait_users_groups', blank=True)
    user_permissions = models.ManyToManyField('auth.Permission', related_name='ait_users_permissions', blank=True)

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    faculty = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Issue(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    
    category = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submitted_issues", limit_choices_to={'role': 'student'})
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_issues", limit_choices_to={'role__in': ['lecturer', 'admin']})
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Issue {self.id}: {self.category} - {self.status}"
