# Deploying Golden Agro ERP — from zero to live

This stack (MySQL + .NET AuthService + Spring Boot business-api + React frontend,
all behind one nginx reverse proxy) is now fully Dockerized and config-driven. Nothing
runs directly against your machine — everything runs in containers, and the only
thing that differs between your laptop and production is the `.env` file and the
domain in `nginx/nginx.conf`.

I can't run these commands for you (no network/server access from here), but every
command below is copy-pasteable.

## 0. What you need before starting
- A server: any $6–12/mo VPS works (DigitalOcean Droplet, Hetzner, AWS Lightsail/EC2,
  Azure VM, Oracle Cloud free tier). 2GB RAM minimum — this stack runs 5 containers.
- A domain name pointed at the server's IP (an A record). You can deploy without one
  using the server's raw IP, but you won't get HTTPS without a domain.
- SSH access to that server.

## 1. Rotate your database password now

Your original MySQL root password was hardcoded in two config files in the zip you
uploaded, which means it's now sitting in this chat and on disk here. **Change your
MySQL root password before deploying anywhere**, even if this is currently just a
local dev DB. The new password only needs to live in your `.env` file from now on.

## 2. Server setup (one time)

```bash
ssh you@your-server-ip

# Install Docker + Compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

sudo apt-get install -y docker-compose-plugin certbot
```

## 3. Get the code onto the server

Push this project to a private GitHub/GitLab repo (the `.gitignore` already excludes
`.env` and the real `appsettings.json`/`application.yml`), then:

```bash
git clone <your-repo-url> golden-agro-erp
cd golden-agro-erp
```

(No git remote yet? `scp -r` the folder to the server instead — same result.)

## 4. Configure secrets

```bash
cp .env.example .env
nano .env
```

Fill in:
- `MYSQL_ROOT_PASSWORD` — a new strong password (not the leaked one)
- `JWT_SECRET` — generate with `openssl rand -base64 48`, must be identical for both APIs (it is, they share this one var)
- `FRONTEND_ORIGIN`, `VITE_AUTH_API_URL`, `VITE_BUSINESS_API_URL` — set to `https://yourdomain.com`, `https://yourdomain.com/auth-api`, `https://yourdomain.com/api` respectively

Also copy the config templates so local IDE builds still work without real secrets in git:
```bash
cp AuthService/appsettings.example.json AuthService/appsettings.json
cp business-api/src/main/resources/application.example.yml business-api/src/main/resources/application.yml
```
(These two files are git-ignored — Compose doesn't actually need them since it injects
env vars directly, but the Java/`.NET` tooling expects the files to exist locally.)

## 5. Point nginx at your real domain

```bash
sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN/g' nginx/nginx.conf
```

## 6. First boot (HTTP only, to get a cert)

```bash
docker compose up -d --build
```

Wait ~1–2 minutes for MySQL and the two APIs to come up (`docker compose logs -f` to watch).
Visit `http://yourdomain.com` — the site should load over plain HTTP at this point.

## 7. Get a free HTTPS certificate

```bash
sudo certbot certonly --webroot -w ./nginx/certbot/www -d yourdomain.com
```

Then edit `nginx/nginx.conf`:
- Uncomment the `return 301 https://...` redirect line in the HTTP server block
- Uncomment the entire `server { listen 443 ssl; ... }` block at the bottom

```bash
docker compose restart reverse-proxy
```

Visit `https://yourdomain.com` — you should now have a padlock.

Certbot certs expire every 90 days. Add a cron job:
```bash
echo "0 3 * * * certbot renew --webroot -w /path/to/golden-agro-erp/nginx/certbot/www --quiet && docker compose -f /path/to/golden-agro-erp/docker-compose.yml restart reverse-proxy" | sudo tee -a /etc/crontab
```

## 8. Verify it's actually working

```bash
docker compose ps                     # all 5 services should show "running"/"healthy"
curl -I https://yourdomain.com        # frontend
curl -I https://yourdomain.com/api/dashboard      # business-api (should 401, not 502/504)
curl -I https://yourdomain.com/auth-api/auth/login # auth-service (should 405/400, not 502)
```

A `502`/`504` here means a backend container isn't up — check `docker compose logs auth-service` or `business-api`.

## 9. Day-2 operations

```bash
docker compose logs -f business-api   # tail logs for one service
docker compose down                   # stop everything (data persists in the mysql-data volume)
docker compose up -d --build          # rebuild + redeploy after a code change
docker compose exec mysql mysqldump -u root -p goldenagro_business > backup.sql   # manual DB backup
```

## What's deliberately out of scope for this first go-live

- **CI/CD** — right now, deploying = `git pull && docker compose up -d --build` on the
  server. A GitHub Actions pipeline that does this automatically on push is a
  reasonable next step, not a blocker to going live.
- **Schema migrations** — `DDL_AUTO=update` auto-manages the business-api schema on boot.
  Fine for now; move to Flyway/Liquibase once the schema stabilizes so deploys can't
  accidentally alter production data.
- **Horizontal scaling / load balancing** — one container per service is plenty until
  you have real traffic. Docker Compose isn't the right tool past that point (you'd move
  to a managed platform or Kubernetes), but that's a "when you need it" problem.
