from rest_framework import serializers
from .models import User
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username"
        ]
class RegitserSreializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)
    
    def validate_username(self,value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with thisusername exists")
        return value
    @transaction.atomic
    def create(self, validated_data):
        user=User.objects.create(
            username=validated_data["username"],
            
            
        )
        
        user.set_password(validated_data["password"])
        user.save()
        return user
    
class LoginSeriializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username=attrs.get("username")
        password=attrs.get("password")
        user=authenticate(
            username=username,
            password=password
        )
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        refresh=RefreshToken.for_user(user)
        return {
            "refresh":str(refresh),
             "access": str(refresh.access_token),
             "user":UserSerializer(user).data
        }