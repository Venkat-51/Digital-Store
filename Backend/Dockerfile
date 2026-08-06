# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV PORT=8000

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# Expose port
EXPOSE 8000

# Run migrations and start gunicorn WSGI server
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn lexicon_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]

