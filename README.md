# GhostTunn

GhostTunn is a privacy-first communication platform with a dark-first frontend and a FastAPI backend.

## Features

- Public and private identity generation
- Anonymous profile creation
- GhostTime feed for text-only posts
- One-to-one chat interface
- ID list and notifications screens
- FastAPI backend with API routes
- Docker and Docker Compose support

## Local development

1. Create a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the app:

```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

4. Open the frontend at `http://localhost:8000`

## Docker

Copy the example environment file and customize it for production:

```bash
cp .env.example .env
```

Start the full stack with:

```bash
docker compose up --build
```

## Project layout

- `frontend/` — static frontend assets
- `backend/` — FastAPI application, database models, API routes
- `Dockerfile` — container image for the backend
- `docker-compose.yml` — PostgreSQL and Redis services
- `requirements.txt` — Python dependencies
