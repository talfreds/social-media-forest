#!/bin/bash

###############################################################################
# OCI Deployment Script for Social Media App
# This script handles application deployment and updates
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Configuration
APP_NAME="social-media-app"
APP_DIR="/opt/${APP_NAME}"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Validate environment
if [ ! -f "${APP_DIR}/.env" ]; then
    log_error "Environment file not found. Run setup-oci.sh first!"
    exit 1
fi

log_info "Starting deployment at $(date)"

###############################################################################
# 1. Create backup
###############################################################################
log_step "Creating backup..."
mkdir -p ${BACKUP_DIR}

if [ -d "${APP_DIR}/.next" ]; then
    log_info "Backing up previous build..."
    tar -czf ${BACKUP_DIR}/build_${TIMESTAMP}.tar.gz -C ${APP_DIR} .next node_modules package-lock.json 2>/dev/null || true
fi

# Database backup
log_info "Backing up database..."
source ${APP_DIR}/.env
pg_dump "${DATABASE_URL}" > ${BACKUP_DIR}/db_${TIMESTAMP}.sql || log_warn "Database backup failed"

# Keep only last 5 backups
log_info "Cleaning old backups..."
cd ${BACKUP_DIR} && ls -t build_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
cd ${BACKUP_DIR} && ls -t db_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

log_info "Backup complete"

###############################################################################
# 2. Pull latest code
###############################################################################
log_step "Pulling latest code..."
cd ${APP_DIR}

if [ ! -d "${APP_DIR}/.git" ]; then
    log_error "Not a git repository. Repository must be cloned before deployment!"
    log_error "Run: git clone <your-repo-url> ${APP_DIR}"
    exit 1
fi

# Stash any local changes
git stash || true
git pull origin main

log_info "Code updated"

###############################################################################
# 3. Install dependencies
###############################################################################
log_step "Installing dependencies..."
npm ci

log_info "Dependencies installed"

###############################################################################
# 4. Run database migrations
###############################################################################
log_step "Running database migrations..."
npx prisma migrate deploy
npx prisma generate

log_info "Migrations complete"

###############################################################################
# 5. Build application
###############################################################################
log_step "Building application..."
npm run build

log_info "Build complete"

###############################################################################
# 6. Restart application
###############################################################################
log_step "Restarting application..."

if pm2 list | grep -q "${APP_NAME}"; then
    log_info "Restarting existing PM2 process..."
    pm2 restart ${APP_NAME}
else
    log_info "Starting new PM2 process..."
    pm2 start npm --name "${APP_NAME}" -- start
fi

# Save PM2 configuration
pm2 save

log_info "Application restarted"

###############################################################################
# 7. Health check
###############################################################################
log_step "Performing health check..."
sleep 5

# Check if app is responding
MAX_RETRIES=12
RETRY_COUNT=0
HEALTH_CHECK_URL="http://localhost:3000/api/health"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s ${HEALTH_CHECK_URL} > /dev/null 2>&1; then
        log_info "✓ Health check passed!"
        HEALTH_RESPONSE=$(curl -s ${HEALTH_CHECK_URL})
        echo "  Response: ${HEALTH_RESPONSE}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            log_warn "Health check attempt $RETRY_COUNT failed, retrying..."
            sleep 5
        else
            log_error "Health check failed after $MAX_RETRIES attempts!"
            log_error "Rolling back to previous version..."
            
            # Rollback
            if [ -f "${BACKUP_DIR}/build_${TIMESTAMP}.tar.gz" ]; then
                cd ${APP_DIR}
                tar -xzf ${BACKUP_DIR}/build_${TIMESTAMP}.tar.gz
                pm2 restart ${APP_NAME}
                log_warn "Rolled back to previous version"
            fi
            
            exit 1
        fi
    fi
done

###############################################################################
# 8. Display status
###############################################################################
log_step "Deployment status..."
pm2 list
pm2 logs ${APP_NAME} --lines 10 --nostream

###############################################################################
# Summary
###############################################################################
log_info ""
log_info "=================================================="
log_info "Deployment Complete!"
log_info "=================================================="
log_info ""
log_info "Deployment Time: $(date)"
log_info "Backup Location: ${BACKUP_DIR}/build_${TIMESTAMP}.tar.gz"
log_info ""
log_info "Useful Commands:"
log_info "  View logs:      pm2 logs ${APP_NAME}"
log_info "  Monitor:        pm2 monit"
log_info "  Restart:        pm2 restart ${APP_NAME}"
log_info "  Stop:           pm2 stop ${APP_NAME}"
log_info "  Status:         pm2 status"
log_info ""
log_info "Application is running at http://$(curl -s ifconfig.me):80"
log_info "=================================================="

