# ── PetSentinel FastAPI Backend — Production Dockerfile ──────────────────────
FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (layer-cached)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt gunicorn

# Copy source
COPY . .

# Pre-train ML model so cold starts are instant
RUN python -m ml.train_model || echo "Model training skipped (no dataset)"

# Runtime config
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Gunicorn with UvicornWorker (4 workers for concurrent triage requests)
CMD gunicorn main:app \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:${PORT}" \
    --timeout 120 \
    --keepalive 5 \
    --worker-tmp-dir /dev/shm \
    --access-logfile - \
    --error-logfile -
