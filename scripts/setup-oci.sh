#!/bin/bash

###############################################################################
# Oracle OCI Instance Setup Script for Social Media App
# This script automates the complete setup of a production environment
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Configuration
APP_NAME="social-media-app"
APP_DIR="/opt/${APP_NAME}"
DB_NAME="social_media"
DB_USER="socialmedia"
NODE_VERSION="24.x"

log_info "Starting OCI instance setup for ${APP_NAME}..."

###############################################################################
# 1. System Update
###############################################################################
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

###############################################################################
# 2. Install Node.js
###############################################################################
log_info "Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
    sudo apt-get install -y nodejs
    log_info "Node.js installed: $(node --version)"
else
    log_info "Node.js already installed: $(node --version)"
fi

###############################################################################
# 3. Install PostgreSQL
###############################################################################
log_info "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    log_info "PostgreSQL installed and started"
else
    log_info "PostgreSQL already installed"
fi

###############################################################################
# 4. Setup Database
###############################################################################
log_info "Setting up database..."

# Generate secure random password if not provided
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    log_warn "Generated database password: ${DB_PASSWORD}"
    log_warn "Save this password securely!"
fi

# Create database and user
sudo -u postgres psql << EOF || log_warn "Database may already exist"
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOF

log_info "Database setup complete"

###############################################################################
# 5. Install PM2
###############################################################################
log_info "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log_info "PM2 installed"
else
    log_info "PM2 already installed"
fi

###############################################################################
# 6. Install and Configure Nginx
###############################################################################
log_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    log_info "Nginx installed and started"
else
    log_info "Nginx already installed"
fi

# Configure Nginx
log_info "Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
NGINX_EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

log_info "Nginx configuration complete"

###############################################################################
# 7. Configure Firewall
###############################################################################
log_info "Configuring firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Install iptables-persistent to save rules
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
sudo netfilter-persistent save

log_info "Firewall configured"

###############################################################################
# 8. Setup Application Directory
###############################################################################
log_info "Setting up application directory..."
sudo mkdir -p ${APP_DIR}
sudo chown $USER:$USER ${APP_DIR}

log_info "Application directory ready at ${APP_DIR}"

###############################################################################
# 9. Generate JWT Secret
###############################################################################
log_info "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)

###############################################################################
# 10. Create Environment File Template
###############################################################################
log_info "Creating environment file..."
cat > ${APP_DIR}/.env << ENV_EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
JWT_SECRET="${JWT_SECRET}"
NODE_ENV=production
ENV_EOF

chmod 600 ${APP_DIR}/.env
log_info "Environment file created at ${APP_DIR}/.env"

###############################################################################
# 11. Setup PM2 Startup
###############################################################################
log_info "Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME | tail -n 1 | sudo bash
log_info "PM2 startup configured"

###############################################################################
# 12. Setup Log Rotation
###############################################################################
log_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/${APP_NAME} > /dev/null << 'LOGROTATE_EOF'
/opt/social-media-app/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
LOGROTATE_EOF

log_info "Log rotation configured"

###############################################################################
# 13. Install Git (if not present)
###############################################################################
log_info "Ensuring Git is installed..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    log_info "Git installed"
else
    log_info "Git already installed"
fi

###############################################################################
# Summary
###############################################################################
log_info ""
log_info "=================================================="
log_info "OCI Setup Complete!"
log_info "=================================================="
log_info ""
log_info "Configuration Summary:"
log_info "  App Directory: ${APP_DIR}"
log_info "  Database Name: ${DB_NAME}"
log_info "  Database User: ${DB_USER}"
log_info "  Database Password: ${DB_PASSWORD}"
log_info "  JWT Secret: ${JWT_SECRET}"
log_info ""
log_info "Next Steps:"
log_info "  1. Clone your repository to ${APP_DIR}"
log_info "  2. Run 'cd ${APP_DIR} && npm ci'"
log_info "  3. Run 'npx prisma migrate deploy'"
log_info "  4. Run 'npm run build'"
log_info "  5. Run 'pm2 start npm --name ${APP_NAME} -- start'"
log_info "  6. Run 'pm2 save'"
log_info ""
log_info "Or use the GitHub Actions CI/CD pipeline!"
log_info ""
log_warn "IMPORTANT: Save the database password and JWT secret!"
log_info ""
log_info "=================================================="

# Save credentials to a secure file
CREDS_FILE="${HOME}/.${APP_NAME}_credentials"
cat > ${CREDS_FILE} << CREDS_EOF
# Credentials for ${APP_NAME}
# Generated: $(date)

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
JWT_SECRET="${JWT_SECRET}"
DB_PASSWORD="${DB_PASSWORD}"
CREDS_EOF

chmod 600 ${CREDS_FILE}
log_info "Credentials saved to ${CREDS_FILE}"

