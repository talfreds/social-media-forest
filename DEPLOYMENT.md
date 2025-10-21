# Deployment Guide

This document explains how to deploy the Social Media App to Oracle Cloud Infrastructure (OCI) using GitHub Actions.

## Prerequisites

1. OCI account with a compute instance
2. GitHub repository with Actions enabled
3. OCI CLI configured locally (for initial setup)

## Initial Setup

### 1. Create OCI Infrastructure

```bash
# Configure your region in the config file
cd scripts/init
cp oci-config.env oci-config.local.env
# Edit oci-config.local.env with your OCI details

# Create VCN and networking
./create-vcn.sh

# Create compute instance
./create-oci-instance.sh

# SSH into the instance and run setup
ssh -i ~/.oci/oci_api_key_no_passphrase ubuntu@YOUR_PUBLIC_IP
```

### 2. Run Setup Script on Instance

```bash
# On the OCI instance
git clone YOUR_REPO_URL /opt/social-media-app
cd /opt/social-media-app
./scripts/setup-oci.sh
```

**Important**: The setup script will:

- Install Node.js, pnpm, PostgreSQL, nginx, PM2
- Configure firewall rules (ports 22, 80, 443)
- Set up nginx as a reverse proxy
- Create the database and application directory

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name    | Description                            | Example                                            |
| -------------- | -------------------------------------- | -------------------------------------------------- |
| `OCI_USER`     | SSH username on your OCI instance      | `ubuntu`                                           |
| `OCI_HOST`     | Public IP address of your OCI instance | `129.146.57.249`                                   |
| `OCI_SSH_KEY`  | Private SSH key for authentication     | Contents of `~/.oci/oci_api_key_no_passphrase`     |
| `DATABASE_URL` | PostgreSQL connection string           | `postgresql://user:password@localhost:5432/dbname` |
| `JWT_SECRET`   | Secret key for JWT tokens              | Generate with `openssl rand -base64 32`            |
| `APP_URL`      | **Public URL of your application**     | `http://129.146.57.249`                            |

**⚠️ Important Notes:**

- **APP_URL**: Must be `http://YOUR_PUBLIC_IP` (no `https://`, no port number, no trailing slash)
  - ✅ Correct: `http://129.146.57.249`
  - ❌ Wrong: `https://129.146.57.249`, `http://129.146.57.249:3000`, `http://129.146.57.249/`

- **OCI_SSH_KEY**: Copy the entire private key file including `-----BEGIN` and `-----END` lines

- **DATABASE_URL**: Get this from the `.env` file on your OCI instance after running setup

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Test** - Runs unit tests, linting, formatting, and type checking
2. **Build** - Creates production build of Next.js app and packages it in a tarball
3. **Deploy** - Copies build to OCI, installs dependencies, runs migrations, restarts app

### Workflow Triggers

- **Push to main branch** - Automatic deployment
- **Manual trigger** - Via GitHub Actions UI

## Troubleshooting

### Deployment Fails with "No route to host"

This usually means iptables rules are misconfigured. Run this on your OCI instance:

```bash
cd /opt/social-media-app
chmod +x scripts/fix-iptables.sh
./scripts/fix-iptables.sh
```

This will reorder iptables rules so HTTP/HTTPS ACCEPT rules come before the REJECT rule.

### Health Check Fails

1. **Check if app is running on the instance:**

   ```bash
   ssh ubuntu@YOUR_PUBLIC_IP
   pm2 status
   pm2 logs social-media-app
   curl http://localhost:3000/api/health
   ```

2. **Check nginx:**

   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   curl http://localhost/api/health
   ```

3. **Check firewall rules:**

   ```bash
   sudo iptables -L INPUT -n --line-numbers
   ```

   Ports 80 and 443 ACCEPT rules should come **before** any REJECT rules.

4. **Check OCI Security List:**
   - Go to OCI Console → Networking → VCN → Subnets
   - Verify ingress rules allow ports 22, 80, 443 from `0.0.0.0/0`

### pnpm Command Not Found

The deploy script automatically installs pnpm if it's missing. If you still get errors:

```bash
# On the OCI instance
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

Or reinstall:

```bash
sudo npm install -g pnpm@9.15.4
```

### Build Artifacts Missing `.next` Directory

This was fixed by packaging builds as tarballs in the workflow. If you see this error in older workflows, update your `.github/workflows/deploy.yml` to the latest version.

## Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
# On your local machine
pnpm run build
tar -czf build.tar.gz .next/ prisma/ public/ package.json pnpm-lock.yaml next.config.ts

# Copy to server
scp -i ~/.oci/oci_api_key_no_passphrase build.tar.gz ubuntu@YOUR_PUBLIC_IP:/opt/social-media-app/

# SSH into server
ssh -i ~/.oci/oci_api_key_no_passphrase ubuntu@YOUR_PUBLIC_IP

# Extract and deploy
cd /opt/social-media-app
tar -xzf build.tar.gz
pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pm2 restart social-media-app
```

## Useful Commands

### On OCI Instance

```bash
# View application logs
pm2 logs social-media-app

# Restart application
pm2 restart social-media-app

# Check application status
pm2 status

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check database
sudo -u postgres psql social_media -c "SELECT * FROM \"User\" LIMIT 5;"

# Test health endpoint
curl http://localhost:3000/api/health
```

### From Local Machine

```bash
# Test external access
curl http://YOUR_PUBLIC_IP/api/health

# Check what's deployed
ssh ubuntu@YOUR_PUBLIC_IP "cd /opt/social-media-app && ls -la .next/"

# View recent deployment logs
ssh ubuntu@YOUR_PUBLIC_IP "pm2 logs social-media-app --lines 50"
```

## Security Considerations

1. **SSH Keys**: Keep your SSH private keys secure, never commit them to the repository
2. **Secrets**: Rotate JWT_SECRET and database passwords regularly
3. **Firewall**: Only open necessary ports (22, 80, 443)
4. **SSL/TLS**: Consider adding HTTPS with Let's Encrypt (certbot)
5. **Database**: Use strong passwords and restrict PostgreSQL to localhost only
6. **Updates**: Regularly update system packages with `sudo apt update && sudo apt upgrade`

## Adding HTTPS (Optional)

To add HTTPS with Let's Encrypt:

```bash
# On OCI instance
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically by certbot
```

Then update your GitHub secret `APP_URL` to use `https://`.

## Monitoring

Consider setting up monitoring with:

- PM2 Plus (free tier available)
- Uptime monitoring (UptimeRobot, etc.)
- Log aggregation (Papertrail, Logtail, etc.)

## Backup Strategy

The deployment script automatically creates backups in `/opt/social-media-app/backups/`:

- Previous `.next` build
- Database dumps
- Old backups are cleaned up (keeps last 5)

To create a manual backup:

```bash
# On OCI instance
cd /opt/social-media-app
pg_dump social_media | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```
