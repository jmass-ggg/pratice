from django.contrib.auth.models import AbstractUser
import uuid
from django.db import models


class User(AbstractUser):
    id =models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    username=models.CharField(max_length=30,unique=True)
    USERNAME_FIELD = "username"
    
    def __str__(self):
        return self.username