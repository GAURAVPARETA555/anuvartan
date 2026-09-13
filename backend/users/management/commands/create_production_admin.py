import os

from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = "Create the production superuser if it does not exist"

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "Superuser environment variables are not configured."
                )
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{username}' already exists."
                )
            )
            return

        user = User.objects.create_superuser(
            username=username,
            email=email or "",
            password=password,
            role="PATIENT",
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Superuser '{user.username}' created successfully."
            )
        )