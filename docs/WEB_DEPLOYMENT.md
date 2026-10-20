# Vaultwise — Web Application Deployment Guide

## 1. System Requirements & Architecture

The Vaultwise Web Application comprises two production components:
1. **Frontend**: Static single-page application (React + Vite) distributed via CDN or Nginx.
2. **Backend**: Asynchronous REST API service (FastAPI + Python 3.14 + Uvicorn) connected to PostgreSQL 18.

---

## 2. Environment Configuration

1. Create a dedicated `.env` file in `services/api/`:
   ```ini
   ENVIRONMENT=production
   DEBUG=False
   HOST=127.0.0.1
   PORT=8000
   API_PREFIX=/api/v1
   CORS_ORIGINS=https://app.vaultwise.local,https://vaultwise.com

   DATABASE_URL=postgresql+asyncpg://vault_user:StrongPassword123@localhost:5432/vaultwise_prod
   DATABASE_URL_SYNC=postgresql://vault_user:StrongPassword123@localhost:5432/vaultwise_prod

   JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7
   BCRYPT_ROUNDS=12
   ```

2. Generate a secure cryptographic secret:
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

---

## 3. Database Initialization & Alembic Migrations

1. Ensure PostgreSQL 18 is running and database exists:
   ```sql
   CREATE DATABASE vaultwise_prod;
   CREATE USER vault_user WITH ENCRYPTED PASSWORD 'StrongPassword123';
   GRANT ALL PRIVILEGES ON DATABASE vaultwise_prod TO vault_user;
   ```

2. Run schema migrations from `services/api/`:
   ```powershell
   alembic upgrade head
   ```

---

## 4. Frontend Production Build

From `apps/web/`:
```powershell
npm install
npm run build
```
Static production output will be located in `apps/web/dist/`.

---

## 5. Reverse Proxy & HTTPS Configuration (Nginx Example)

```nginx
server {
    listen 443 ssl http2;
    server_name vaultwise.example.com;

    ssl_certificate /etc/letsencrypt/live/vaultwise.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vaultwise.example.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';" always;

    # Frontend Static Files
    location / {
        root /var/www/vaultwise/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Database Backup Strategy

Execute scheduled daily backups using `pg_dump`:
```powershell
pg_dump -U vault_user -d vaultwise_prod -F c -b -v -f "vaultwise_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
```
Encrypt backup dumps at rest using GPG or Windows BitLocker.
