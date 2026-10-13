from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Category, Complaint, Notification

User = get_user_model()


class ComplaintApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Roads", icon="🛣️")
        self.member = User.objects.create_user(
            username="neighbor",
            password="SafePassword!234",
            email="neighbor@example.com",
        )
        self.other_member = User.objects.create_user(
            username="other",
            password="SafePassword!234",
            email="other@example.com",
        )
        self.admin = User.objects.create_user(
            username="moderator",
            password="SafePassword!234",
            role=User.Role.ADMIN,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_registration_creates_member_and_never_accepts_role(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "new-neighbor",
                "email": "new@example.com",
                "full_name": "New Neighbor",
                "password": "AnotherSafe!234",
                "role": "admin",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        created_user = User.objects.get(username="new-neighbor")
        self.assertEqual(created_user.role, User.Role.MEMBER)
        self.assertEqual(created_user.first_name, "New Neighbor")

    def test_member_can_only_list_their_own_complaints(self):
        Complaint.objects.create(
            reporter=self.member,
            category=self.category,
            title="My pothole",
            description="A large pothole by the crossing.",
            location="Oak Avenue",
        )
        Complaint.objects.create(
            reporter=self.other_member,
            category=self.category,
            title="Private report",
            description="A separate resident report.",
            location="Pine Street",
        )
        self.authenticate(self.member)
        response = self.client.get("/api/complaints/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "My pothole")

    def test_admin_status_change_creates_history_and_notification(self):
        complaint = Complaint.objects.create(
            reporter=self.member,
            category=self.category,
            title="Broken light",
            description="The streetlight has been out all week.",
            location="Cedar Lane",
        )
        self.authenticate(self.admin)
        response = self.client.patch(
            f"/api/admin/complaints/{complaint.id}/",
            {"status": Complaint.Status.IN_PROGRESS},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, Complaint.Status.IN_PROGRESS)
        self.assertEqual(complaint.history.count(), 1)
        self.assertEqual(Notification.objects.filter(recipient=self.member, complaint=complaint).count(), 1)

    def test_non_admin_cannot_access_admin_queue(self):
        self.authenticate(self.member)
        response = self.client.get("/api/admin/complaints/")
        self.assertEqual(response.status_code, 403)

    def test_staff_user_is_recognized_as_administrator(self):
        staff_user = User.objects.create_user(
            username="staff",
            password="SafePassword!234",
            is_staff=True,
        )
        self.authenticate(staff_user)
        queue_response = self.client.get("/api/admin/complaints/")
        profile_response = self.client.get("/api/auth/profile/")
        self.assertEqual(queue_response.status_code, 200)
        self.assertEqual(profile_response.data["role"], "admin")
