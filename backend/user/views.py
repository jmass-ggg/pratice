from rest_framework import viewsets,status
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import User
from rest_framework.decorators import action
from .serializers import RegitserSreializer,LoginSeriializer
from rest_framework.response import Response

class AuthView(viewsets.ViewSet):
    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="register"
    )
    def register(self,request):
        serializer=RegitserSreializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=serializer.save()
        return Response(
            {
                "username": user.username,
              
            },status=status.HTTP_201_CREATED
        )
    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="login"
    )
    def login(self,request):
        serializer=LoginSeriializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = serializer.validated_data["refresh"]
        access = serializer.validated_data["access"]
        user = serializer.validated_data["user"]
        response=Response(
            {
                "access": access,
                "user": user,
            },
            status=status.HTTP_200_OK
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60
        )
        return response