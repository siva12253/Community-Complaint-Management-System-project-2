<<<<<<< HEAD
# Neighborly — Community Complaint Management System

A full-stack community issue reporting and tracking application. The frontend and backend are separate projects, communicate through a JSON REST API, and can be run independently during development.

## Project structure

```text
frontend/                 React 18 + Vite application
  src/api/                Axios client and API error handling
  src/components/         Shared navigation, guards, and status components
  src/context/            JWT-backed authentication state
  src/pages/               Dashboard, reports, profile, notifications, admin
backend/                  Django REST Framework API
  config/                 Django settings, URL routing, ASGI/WSGI
  complaints/             Models, serializers, permissions, API, admin
```

## Features

- Account registration, JWT sign-in/refresh, profile updates, and role-aware routes.
- Submit complaints with categories, location, description, and an optional photo.
- Search/filter reports, view complaint history, and exchange comments.
- Private resident report lists; administrator report search and status management.
- Status changes and staff comments create resident notifications.
- Django admin for managing users and categories.
- Responsive React interface with loading, empty, validation, and API error states.

## Requirements

- Node.js 20 or later with npm.
- Python 3.10 or later.

## Run the backend

In a terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate --run-syncdb
python manage.py seed_categories
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`; the Django admin is at `http://127.0.0.1:8000/admin/`. The development database is SQLite. For a production deployment, set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` in the environment, use a production database, and serve uploaded media using an appropriate storage service.

To promote a user to administrator, first register the user, then assign the `admin` role in Django admin. The application intentionally does not allow public registration to select an administrator role.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The default API URL is `http://127.0.0.1:8000/api`. To use another API origin, create `frontend/.env` from `.env.example` and set `VITE_API_URL`. Create `backend/.env` from `.env.example` to override backend development settings; environment variables must be loaded by your shell or deployment environment.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/` | Create a community member |
| POST | `/api/auth/token/` | Obtain JWT access and refresh tokens |
| POST | `/api/auth/token/refresh/` | Refresh an access token |
| GET, PATCH | `/api/auth/profile/` | Read or update the signed-in profile |
| GET | `/api/categories/` | List active complaint categories |
| GET, POST | `/api/complaints/` | List the current resident's reports or submit a report |
| GET, PATCH, DELETE | `/api/complaints/{id}/` | Read or manage an accessible report |
| POST | `/api/complaints/{id}/comments/` | Add a comment/update |
| GET | `/api/admin/complaints/` | Administrator complaint queue |
| PATCH | `/api/admin/complaints/{id}/` | Administrator status update |
| GET, PATCH | `/api/notifications/` | List or update the signed-in resident's notifications |
| POST | `/api/notifications/mark-all-read/` | Mark all notifications as read |

Complaint and admin lists support `search`, `status`, and (for resident complaints) `category` query parameters. Lists use page-number pagination with a default page size of 20.

## Development checks

```powershell
# In backend/
python manage.py check

# In frontend/
npm run build
```
=======
# Community-Complaint-Management-System-project-2
>>>>>>> 9d7e57698a062f125523069e308f6f972fd52872
