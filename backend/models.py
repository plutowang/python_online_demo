from django.db import models

# Create your models here.


class Code(models.Model):
    name = models.CharField(max_length=20, blank=True)
    code = models.TextField()
    created_time = models.DateTimeField(auto_now_add=True)
    changed_time = models.DateTimeField(auto_now=True)
