from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Category, Complaint, ComplaintComment, ComplaintHistory, Notification

User = get_user_model()


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "full_name", "address")

    full_name = serializers.CharField(source="first_name", required=True, max_length=150)

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="first_name", required=False, allow_blank=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "full_name", "address", "role", "date_joined")
        read_only_fields = ("id", "username", "role", "date_joined")

    def get_role(self, obj):
        return "admin" if obj.is_staff or obj.is_superuser else obj.role


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description", "icon")


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintComment
        fields = ("id", "author", "author_name", "body", "created_at")
        read_only_fields = ("id", "author", "author_name", "created_at")

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


class HistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintHistory
        fields = ("id", "status", "note", "created_at")


class ComplaintSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    history = HistorySerializer(many=True, read_only=True)
    reporter_name = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = (
            "id", "title", "description", "category", "category_detail", "location",
            "image", "status", "reporter", "reporter_name", "created_at", "updated_at",
            "comments", "history",
        )
        read_only_fields = ("id", "status", "reporter", "reporter_name", "created_at", "updated_at", "comments", "history")

    def get_reporter_name(self, obj):
        return obj.reporter.get_full_name() or obj.reporter.username

    def validate_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError("This category is not currently available.")
        return value

    def validate_image(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image size must be 5 MB or less.")
        return value


class ComplaintStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ("status",)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "complaint", "title", "message", "is_read", "created_at")
