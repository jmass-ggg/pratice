from django.db import models
import uuid
class Blog(models.Model):
    id =models.UUIDField(primary_key=True,editable=False,default=uuid.uuid4)
    title=models.CharField(max_length=150)
    blog=models.TextField()
    date=models.DateField()
    created_at=models.DateTimeField(auto_now_add=True)
    
    