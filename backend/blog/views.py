from rest_framework import viewsets
from .models import Blog
from .serializers import BlogCreateSerialziers
from rest_framework.permissions import IsAuthenticated

class BlogView(viewsets.ModelViewSet):
    queryset=Blog.objects.all()
    serializer_class=BlogCreateSerialziers
    permission_classes=[IsAuthenticated]