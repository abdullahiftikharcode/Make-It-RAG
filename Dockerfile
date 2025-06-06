FROM python:3.9-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY python_server/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY python_server/ .

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=10000
ENV RELOAD=False

# Expose the port
EXPOSE 10000

# Command to run the application
CMD ["python", "-m", "main"] 