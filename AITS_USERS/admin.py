from django.contrib import admin

# Register your models here.
from .models import User, Issue, Department, College, School, Programme

admin.site.register(User)
admin.site.register(Issue)
admin.site.register(College)
admin.site.register(School)
admin.site.register(Department)
admin.site.register(Programme)




