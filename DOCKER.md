# Docker Deployment Guide

This document provides comprehensive instructions for running Mockery in Docker containers.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start the service
npm run docker:compose:up

# View logs
npm run docker:compose:logs

# Stop the service
npm run docker:compose:down
```

The service will be available at `http://localhost:3000`.

### Using Docker CLI

```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run

# Or manually:
docker build -t mockery:latest .
docker run -p 3000:3000 \
  --env-file .env \
  -v "$(pwd)/test-mocks:/mocks:ro" \
  mockery:latest
```

## Docker Image Details

### Base Image
- **Image**: `node:20-alpine`
- **Size**: ~150MB (optimized with multi-stage build)
- **Security**: Runs as non-root user (`nodejs:nodejs`)

### Multi-Stage Build

The Dockerfile uses a two-stage build process:

1. **Builder Stage**: Installs all dependencies and compiles TypeScript
2. **Production Stage**: Contains only production dependencies and compiled code

This approach minimizes the final image size and reduces attack surface.

### Health Check

The container includes a built-in health check that:
- Runs every 30 seconds
- Checks the `/health` endpoint
- Allows 5 seconds startup time before first check
- Retries 3 times before marking unhealthy

## Configuration

### Environment Variables

Configure the container using environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP server port |
| `MOCK_REPO_PATH` | **Yes** | - | Path to mock repository inside container |
| `NODE_ENV` | No | production | Environment mode |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

### Volume Mounts

Mount your mock repository as a read-only volume:

```bash
-v /path/to/your/mocks:/mocks:ro
```

The `:ro` flag ensures the container cannot modify mock files.

## Docker Compose Configuration

### Default Configuration

The provided `docker-compose.yml` includes:

```yaml
services:
  mockery:
    ports:
      - "3000:3000"
    volumes:
      - ./test-mocks:/mocks:ro
    environment:
      - MOCK_REPO_PATH=/mocks
      - NODE_ENV=production
```

### Custom Mock Repository

To use a different mock repository, edit `docker-compose.yml`:

```yaml
volumes:
  - /path/to/your/mocks:/mocks:ro
```

Or create a `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  mockery:
    volumes:
      - /custom/path/to/mocks:/mocks:ro
    environment:
      - LOG_LEVEL=debug
```

## Production Deployment

### Kubernetes

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mockery
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mockery
  template:
    metadata:
      labels:
        app: mockery
    spec:
      containers:
      - name: mockery
        image: mockery:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: MOCK_REPO_PATH
          value: "/mocks"
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        volumeMounts:
        - name: mock-data
          mountPath: /mocks
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
      volumes:
      - name: mock-data
        hostPath:
          path: /path/to/mocks
          type: Directory
---
apiVersion: v1
kind: Service
metadata:
  name: mockery
spec:
  selector:
    app: mockery
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Docker Swarm

```bash
docker stack deploy -c docker-compose.yml mockery
```

### AWS ECS/Fargate

Example task definition:

```json
{
  "family": "mockery",
  "containerDefinitions": [
    {
      "name": "mockery",
      "image": "mockery:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "MOCK_REPO_PATH",
          "value": "/mocks"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "mock-data",
          "containerPath": "/mocks",
          "readOnly": true
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))\""
        ],
        "interval": 30,
        "timeout": 3,
        "retries": 3,
        "startPeriod": 5
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mockery",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "volumes": [
    {
      "name": "mock-data",
      "host": {
        "sourcePath": "/mnt/mocks"
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512"
}
```

## Building for Different Architectures

Build multi-platform images for ARM and x86:

```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t mockery:latest \
  --push \
  .
```

## Security Best Practices

### Container Security

1. **Non-root User**: Container runs as `nodejs` user (UID 1001)
2. **Read-only Mocks**: Mount mock repository as read-only (`:ro`)
3. **Minimal Base**: Alpine Linux for smaller attack surface
4. **No Dev Dependencies**: Production image excludes development dependencies
5. **Signal Handling**: Uses `dumb-init` for proper process management

### Network Security

```bash
# Run on custom network
docker network create mockery-net
docker run --network mockery-net mockery:latest

# Restrict to localhost only
docker run -p 127.0.0.1:3000:3000 mockery:latest
```

### Secrets Management

Never include `.env` in the image. Use:

**Docker CLI:**
```bash
docker run --env-file .env mockery:latest
```

**Docker Compose:**
```yaml
env_file:
  - .env
```

**Kubernetes:**
```yaml
envFrom:
- secretRef:
    name: mockery-secrets
```

## Monitoring and Logging

### Health Check

```bash
# Check container health
docker ps --filter "name=mockery" --format "{{.Status}}"

# Manual health check
curl http://localhost:3000/health
```

### Logs

```bash
# Docker CLI
docker logs -f mockery

# Docker Compose
docker-compose logs -f

# Filter logs
docker logs mockery 2>&1 | grep ERROR
```

### Structured Logging

Mockery uses Pino for JSON-formatted logs. Parse with `jq`:

```bash
docker logs mockery 2>&1 | jq 'select(.level >= 50)'
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs mockery

# Common issues:
# - MOCK_REPO_PATH not set
# - Mock repository not mounted
# - Port 3000 already in use
```

### Health Check Failing

```bash
# Exec into container
docker exec -it mockery sh

# Test health endpoint
wget -O- http://localhost:3000/health

# Check if server is running
ps aux | grep node
```

### Mock Files Not Found

```bash
# Verify volume mount
docker inspect mockery | jq '.[0].Mounts'

# Check files in container
docker exec -it mockery ls -la /mocks
```

### Performance Issues

```bash
# Monitor resource usage
docker stats mockery

# Increase memory limit
docker run -m 512m mockery:latest
```

## Development Workflow

### Local Development with Hot Reload

For development, use the native Node.js process instead of Docker:

```bash
npm run dev
```

### Testing the Docker Build

```bash
# Build and test locally
npm run docker:build
npm run docker:run

# Test health endpoint
curl http://localhost:3000/health

# Test mock retrieval
curl -H "X-Mock-ID: 1234" http://localhost:3000/api/mock
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Performance Optimization

### Image Size

Current image size: ~150MB

To reduce further:
- Use distroless images (requires more setup)
- Remove unnecessary files in build stage
- Use `.dockerignore` effectively

### Startup Time

Typical startup time: < 2 seconds

Optimization tips:
- Precompile TypeScript
- Minimize dependencies
- Use health check `start-period` appropriately

### Runtime Performance

- No caching: Each request reads from disk
- Consider adding volume mount options for better I/O:
  ```yaml
  volumes:
    - ./test-mocks:/mocks:ro,cached
  ```

## Additional Resources

- [Official Docker Documentation](https://docs.docker.com/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Alpine Linux Security](https://alpinelinux.org/about/)

## Support

For issues related to:
- Docker setup: Check this documentation
- Mockery functionality: See main README.md
- Architecture questions: See ARCHITECTURE.md
