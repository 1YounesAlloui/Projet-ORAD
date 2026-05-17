#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Seeding the superuser automatically using custom python code to avoid failures if already exists
python -c "
import os, django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@gmail.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password, role='ADMIN')
    print('Superuser created successfully!')
else:
    print('Superuser already exists.')
"

