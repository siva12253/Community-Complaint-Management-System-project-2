from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Category, Complaint, ComplaintComment, ComplaintHistory, Notification, User


@admin.register(User)
class CommunityUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Community profile", {"fields": ("role", "address")}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Community profile", {"fields": ("role", "address")}),)
    list_display = ("username", "email", "role", "is_staff")


admin.site.register(Category)
admin.site.register(Complaint)
admin.site.register(ComplaintComment)
admin.site.register(ComplaintHistory)
admin.site.register(Notification)
