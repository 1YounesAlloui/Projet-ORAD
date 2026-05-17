# Medical Appointment Booking System

## Overview
A full-stack web application for booking and managing medical appointments.

### Tech Stack
- **Backend:** Django, Django REST Framework, SimpleJWT, SQLite3
- **Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios

## Features
- Role-based authentication and routing (Patient, Doctor, Admin)
- **Role-Specific Dashboards**:
  - Patients can find doctors and manage bookings.
  - Doctors get a practice overview and schedule management.
  - Admins get a system overview with charts (Recharts) and stats.
- **Smart Booking**: Automatic appointment conflict detection to prevent double-booking.
- **Search & Filtering**: Search doctors by name/specialty, filter appointments by status.
- **Modern UI**: Fully responsive, clean medical aesthetic with `react-hot-toast` for global notifications.
- **Performance Optimized**: Backend prevents N+1 queries using `select_related` and `prefetch_related`.

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the project root.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
   ```
4. Run migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```
5. Run the development server:
   ```bash
   python manage.py runserver
   ```
   The backend API will run at `http://localhost:8000/api/`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser (usually `http://localhost:5173`).

## Default Roles
When registering a new user, you can choose to be a **Patient** or a **Doctor**.
Doctors can then be selected by patients to book an appointment based on the doctor's availability.

## API Documentation
- `POST /api/register/`: Register a new user
- `POST /api/login/`: Obtain JWT tokens
- `POST /api/logout/`: Blacklist refresh token
- `GET /api/me/`: Get current logged-in user profile
- `GET /api/doctors/`: List all doctors (Public)
- `GET /api/doctors/<id>/`: Get specific doctor details
- `GET/POST /api/availabilities/`: Manage doctor availability (Doctor only)
- `GET/POST/PATCH /api/appointments/`: Manage appointments
