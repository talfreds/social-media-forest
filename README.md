# 🌲 Social Media App

A forest-themed social media platform where posts are trees, comments are branches, and communities are forests.

## Tech Stack

- **Next.js 15** (React 19)
- **PostgreSQL** (via Docker)
- **Prisma ORM**
- **Material-UI**
- **JWT Authentication**

## Quick Start

### Prerequisites

- Node.js 24.x
- pnpm (`npm install -g pnpm`)
- Docker (for local PostgreSQL)

### Local Development

1. **Clone and Install**

   ```bash
   git clone <your-repo>
   cd social-media-app
   pnpm install
   ```

2. **Setup Environment**

   ```bash
   # Create .env file
   cat > .env << EOF
   DATABASE_URL="postgresql://postgres:password@localhost:5432/socialmedia"
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_NAME=socialmedia
   JWT_SECRET="your-secret-key-here"
   EOF
   ```

3. **Start Database**

   ```bash
   docker compose up -d
   ```

4. **Initialize Database**

   ```bash
   pnpx prisma db push
   pnpx prisma generate
   ```

5. **Run Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Oracle Cloud (Free Tier)

1. **Setup OCI Instance**

   ```bash
   ssh ubuntu@<OCI_IP>
   curl -o setup-oci.sh https://raw.githubusercontent.com/<YOUR_REPO>/main/scripts/setup-oci.sh
   chmod +x setup-oci.sh
   sudo ./setup-oci.sh
   ```

2. **Deploy Application**
   ```bash
   cd /opt/social-media-app
   git clone https://github.com/<YOUR_REPO>/social-media-app.git .
   chmod +x scripts/deploy-oci.sh
   ./scripts/deploy-oci.sh
   ```

### GitHub Actions

# Secrets:

- `OCI_HOST` - Your OCI instance IP
- `OCI_USER` - Usually `ubuntu`
- `OCI_SSH_KEY` - Your SSH private key
- `DATABASE_URL` - PostgreSQL connection string
- `APP_URL` - Your app URL

Then push to `main` branch to auto-deploy.

## Scripts

- `pnpm dev` - Start development server
- `pnpm db:reset` - Reset database and start dev server
- `pnpm db:push` - Push schema changes to database
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Lint code

## Database

View database in browser:

```bash
pnpx prisma studio
```
