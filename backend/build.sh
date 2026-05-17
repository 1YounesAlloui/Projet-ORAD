#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Set the Django settings module explicitly
export DJANGO_SETTINGS_MODULE=core.settings

# Create superuser safely using Django's built-in command
if [[ $CREATE_SUPERUSER ]]; then
    python manage.py createsuperuser --no-input
else
    # Fallback: create using environment variables without requiring CREATE_SUPERUSER flag
    python manage.py shell <<EOF
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@gmail.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print('Superuser created successfully!')
else:
    print('Superuser already exists.')
EOF
fi
