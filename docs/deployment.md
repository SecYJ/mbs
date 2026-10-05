# Deployment (single EC2)

Everything runs on one machine:

```text
browser ──HTTPS──▶ nginx :443 ──▶ client SSR 127.0.0.1:3001 ──▶ Express 127.0.0.1:3000 ──▶ Postgres localhost:5432
```

- nginx is the only public entry point. It terminates TLS and forwards every request to the client SSR server.
- The client's server functions (the BFF) call Express on localhost. Express is never exposed to the internet.
- Postgres listens on localhost only. Do not open port 5432 in the security group.
- Both Node processes run with `TZ=Asia/Kuala_Lumpur` (the app's single time zone, `APP_TIME_ZONE` in `@mbs/shared/time`).

The files used below live in [`deploy/`](../deploy).

## 1. Machine

- Ubuntu 24.04 LTS, at least 2 GB RAM (for example `t3.small`). `vite build` needs more memory than a 1 GB instance has; on a small instance add swap first:

    ```bash
    sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
    sudo mkswap /swapfile && sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```

- Security group inbound: 22 (your IP only), 80, 443.
- Install Node 24, pnpm, nginx, Postgres and certbot:

    ```bash
    curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
    sudo apt-get install -y nodejs nginx postgresql postgresql-contrib certbot python3-certbot-nginx git
    sudo corepack enable
    ```

## 2. App user and code

```bash
sudo useradd --system --create-home --shell /bin/bash mbs   # home: /home/mbs
sudo install -d -o mbs -g mbs -m 755 /srv/mbs
sudo -u mbs git clone <repo-url> /srv/mbs
```

## 3. Database

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE mbs LOGIN PASSWORD 'choose-a-long-random-password';
CREATE DATABASE mbs OWNER mbs;
\c mbs
CREATE EXTENSION IF NOT EXISTS btree_gist;
SQL
```

`btree_gist` lets Postgres itself reject two overlapping bookings for the same room. The migration also creates it, but creating an extension needs a superuser, so do it once here.

## 4. Environment files

```bash
sudo mkdir -p /etc/mbs
sudo cp /srv/mbs/server/.env.example /etc/mbs/server.env
sudo cp /srv/mbs/client/.env.example /etc/mbs/client.env
sudo chown root:mbs /etc/mbs/*.env && sudo chmod 640 /etc/mbs/*.env
```

Fill in the values. Wrap every value in double quotes (`KEY="value"`): both systemd and the deploy script's shell read this file, and quoting keeps characters such as `&`, `$`, `#` and `<>` intact. The important ones:

| File         | Variable             | Example                                                     |
| ------------ | -------------------- | ----------------------------------------------------------- |
| `server.env` | `DATABASE_URL`       | `postgresql://mbs:<password>@localhost:5432/mbs`            |
| `server.env` | `SERVER_ORIGIN`      | `http://127.0.0.1:3000`                                     |
| `server.env` | `CLIENT_ORIGIN`      | `https://mbs.example.com`                                   |
| `server.env` | `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32`                         |
| `server.env` | `RESEND_API_KEY`     | required: Express refuses to start without it in production |
| `client.env` | `SERVER_ORIGIN`      | `http://127.0.0.1:3000`                                     |

`NODE_ENV`, `PORT`, `HOST` and `TZ` are set in the systemd units.

## 5. First build and migrations

```bash
sudo -u mbs bash /srv/mbs/deploy/scripts/deploy.sh --no-restart
```

The script installs dependencies from the lockfile, builds the client, and runs `pnpm db:migrate` with `/etc/mbs/server.env`. Migrations run once per deploy, before the new code starts, never at server boot.

## 6. Services

```bash
sudo cp /srv/mbs/deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mbs-server mbs-client
curl -s http://127.0.0.1:3000/health   # {"status":"ok"}
```

Logs: `journalctl -u mbs-server -f` and `journalctl -u mbs-client -f`.

## 7. nginx and HTTPS

```bash
sudo cp /srv/mbs/deploy/nginx/mbs.conf /etc/nginx/sites-available/mbs.conf
sudo sed -i 's/mbs.example.com/<your-domain>/g' /etc/nginx/sites-available/mbs.conf
sudo ln -s /etc/nginx/sites-available/mbs.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo certbot --nginx -d <your-domain>
sudo nginx -t && sudo systemctl reload nginx
```

## 8. Backups

One machine means one copy of the data. Back it up every day, and copy it off the machine:

```bash
sudo mkdir -p /var/backups/mbs && sudo chown postgres /var/backups/mbs
sudo -u postgres crontab -e
# 15 3 * * * S3_BUCKET=s3://<bucket> /srv/mbs/deploy/scripts/backup-db.sh
```

Copying to S3 needs the AWS CLI v2 (its official installer puts `aws` in `/usr/local/bin`, which the script adds to `PATH`) and an EC2 instance role allowed to write to the bucket. Restore with `pg_restore --clean --dbname=mbs <file>.dump`. Also consider scheduled EBS snapshots.

## Updating

```bash
sudo -u mbs bash /srv/mbs/deploy/scripts/deploy.sh
```

The script pulls `master`, installs, builds, migrates, restarts both services, and checks `/health`. Take a backup before deploys that include migrations.

To let the `mbs` user restart only these two services, add a sudoers rule with `sudo visudo -f /etc/sudoers.d/mbs`:

```text
mbs ALL=(root) NOPASSWD: /usr/bin/systemctl restart mbs-server mbs-client
```

## Creating the first super admin

Nobody can grant `super_admin` from the app. After registering an account, promote it directly in the database:

```bash
sudo -u postgres psql mbs -c "UPDATE \"user\" SET role = 'super_admin' WHERE email = 'you@example.com';"
```
