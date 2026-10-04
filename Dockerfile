FROM oven/bun:1-alpine

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --production

# Copy application code
COPY tsconfig.json ./
COPY src/ ./src/
COPY index.ts ./

# Create storage directory inside container
RUN mkdir -p /app/storage

# Environment defaults
ENV PORT=3000
ENV HOST=0.0.0.0
ENV STORAGE_DIR=/app/storage
ENV TITLE="Debian File Repository"

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
