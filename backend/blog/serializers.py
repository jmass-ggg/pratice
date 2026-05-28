from rest_framework import serializers
from .models import Blog
class BlogCreateSerialziers(serializers.ModelSerializer):
    class Meta:
        model=Blog
        fields=["id","title","blog","date","created_at"]
        read_only_fields = ["id", "created_at"]
