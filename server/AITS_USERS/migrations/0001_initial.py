# Generated by Django 5.1.6 on 2025-02-15 10:04

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Departments',
            fields=[
                ('ID', models.AutoField(primary_key=True, serialize=False)),
                ('Name', models.CharField(max_length=100)),
                ('Faculty', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Issues',
            fields=[
                ('Issue_ID', models.AutoField(primary_key=True, serialize=False)),
                ('Category', models.CharField(max_length=100)),
                ('Description', models.TextField()),
                ('Status', models.CharField(max_length=100)),
                ('Assigned_To', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('Student_ID', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('role', models.CharField(max_length=100)),
            ],
        ),
    ]
