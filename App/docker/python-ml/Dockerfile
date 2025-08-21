# docker/python-ml/Dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gfortran && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Copy pinned requirements
COPY requirements.txt /opt/app/requirements.txt

# Install (use -U and no-cache)
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt

# default CMD is provided by API (we run `python -` inside container)
