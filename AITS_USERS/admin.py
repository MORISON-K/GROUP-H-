from django.contrib import admin

# Register your models here.
from .models import User, Issue, Department, College, School, Programme, Course

admin.site.register(User)
# admin.site.register(Issue)
admin.site.register(College)
admin.site.register(School)
admin.site.register(Department)
admin.site.register(Programme)

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    # Display the new fields in the admin list view
    list_display = (
        'id', 
        'student', 
        'course', 
        'year_of_study',  
        'semester',        
        'status', 
        'created_at'
    )
    
    
    fieldsets = (
        ('Issue Details', {
            'fields': (
                'student', 
                'course', 
                'year_of_study',  
                'semester',       
                'category', 
                'description'
            )
        }),
        ('Status', {
            'fields': ('status', 'assigned_to')
        }),
    )
    
    
    list_filter = ('year_of_study', 'semester', 'status')
    
    # Optional: Add search for relevant fields
    search_fields = ('student__username', 'course__name', 'description')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department')
    search_fields = ('code', 'name')
    list_filter = ('department',)