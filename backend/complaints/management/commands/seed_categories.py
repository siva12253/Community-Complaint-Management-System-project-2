from django.core.management.base import BaseCommand

from complaints.models import Category


class Command(BaseCommand):
    help = "Create or update the starter complaint categories."

    def handle(self, *args, **options):
        categories = [
            ("Roads & sidewalks", "Potholes, sidewalks, and road safety", "🛣️"),
            ("Parks & recreation", "Parks, playgrounds, and public spaces", "🌳"),
            ("Waste & sanitation", "Litter, recycling, and missed collection", "♻️"),
            ("Street lighting", "Streetlights and public safety lighting", "💡"),
            ("Water & drainage", "Water supply, leaks, and drainage", "💧"),
            ("Noise & public safety", "Noise concerns and community safety", "🔔"),
            ("Other", "Other community concerns", "📍"),
        ]
        for name, description, icon in categories:
            Category.objects.update_or_create(name=name, defaults={"description": description, "icon": icon, "is_active": True})
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(categories)} complaint categories."))
