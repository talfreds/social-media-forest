#!/bin/bash

###############################################################################
# Oracle OCI Instance Creation and Setup Script
# This script creates a new OCI instance and sets up the social media app
###############################################################################

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Load configuration
if [ -f "$SCRIPT_DIR/load-config.sh" ]; then
    log_warn "load-config.sh found - loading configuration"
    # Source the config and run the main function to export variables
    source "$SCRIPT_DIR/load-config.sh"
    main
else
    log_warn "load-config.sh not found - using environment variables only"
fi

log_info "Starting OCI instance creation and setup..."

# Instance configuration (after config is loaded)
INSTANCE_NAME="${APP_NAME:-social-media-app}-$(date +%Y%m%d-%H%M%S)"
DISPLAY_NAME="Social Media App Instance"

###############################################################################
# 1. Validate prerequisites
###############################################################################
log_step "Validating prerequisites..."

# Check if OCI CLI is installed
if ! command -v oci &> /dev/null; then
    log_error "OCI CLI is not installed. Please install it first:"
    log_error "https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
fi

# Check if OCI CLI is configured
if ! oci iam user get --user-id $(oci iam user list --query 'data[0].id' --raw-output) &> /dev/null; then
    log_error "OCI CLI is not configured. Please run 'oci setup config' first."
    exit 1
fi

# Validate required parameters (loaded from config)
if [ -z "$OCI_COMPARTMENT_ID" ] || [ -z "$OCI_AVAILABILITY_DOMAIN" ] || [ -z "$OCI_SUBNET_ID" ] || [ -z "$OCI_SSH_KEY_PATH" ]; then
    log_error "Please update the configuration file:"
    log_error "  - OCI_COMPARTMENT_ID: Your OCI compartment OCID"
    log_error "  - OCI_AVAILABILITY_DOMAIN: e.g., 'EoFt:PHX-AD-3'"
    log_error "  - OCI_SUBNET_ID: Your VCN subnet OCID"
    log_error "  - OCI_SSH_KEY_PATH: Path to your public SSH key"
    exit 1
fi

# Check if GitHub repo is provided (optional but recommended)
if [ -z "$GITHUB_REPO" ]; then
    log_warn "GITHUB_REPO is not set. The instance will be created but the app won't be deployed automatically."
    log_warn "You can manually deploy the app later or update GITHUB_REPO and re-run the script."
fi

# Check if SSH key exists
if [ ! -f "$OCI_SSH_KEY_PATH" ]; then
    log_error "SSH key not found at: $OCI_SSH_KEY_PATH"
    exit 1
fi

# Validate availability domain exists
log_info "Validating availability domain..."
if ! oci iam availability-domain list --query "data[?name=='$OCI_AVAILABILITY_DOMAIN'].name" --raw-output | grep -q "$OCI_AVAILABILITY_DOMAIN"; then
    log_error "Availability domain '$OCI_AVAILABILITY_DOMAIN' not found in your region"
    log_error "Available domains:"
    oci iam availability-domain list --query 'data[].name' --output table
    exit 1
fi

# Validate subnet exists
log_info "Validating subnet..."
if ! oci network subnet get --subnet-id "$OCI_SUBNET_ID" &> /dev/null; then
    log_error "Subnet '$OCI_SUBNET_ID' not found or not accessible"
    exit 1
fi

log_info "Prerequisites validated"

###############################################################################
# 2. Create instance
###############################################################################
log_step "Creating OCI instance..."

# Create instance
# Read and properly format SSH key for OCI
# OCI expects the key in format: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC..."
# We have a PEM format key, so we need to convert it to SSH format
# Extract the key content and convert to SSH format
if [[ "$OCI_SSH_KEY_PATH" == *.pem ]]; then
    # PEM format key - convert to SSH format
    KEY_CONTENT=$(cat "$OCI_SSH_KEY_PATH" | grep -v "BEGIN" | grep -v "END" | tr -d '\n' | tr -d '\r' | tr -d ' ')
    SSH_KEY_CONTENT="ssh-rsa $KEY_CONTENT"
else
    # Already in SSH format (.pub file)
    SSH_KEY_CONTENT=$(cat "$OCI_SSH_KEY_PATH")
fi

# Build the OCI command based on shape type
if [[ "$OCI_SHAPE" == *"Flex"* ]]; then
    # Flexible shape - requires shape-config
    INSTANCE_OCID=$(oci compute instance launch \
        --compartment-id "$OCI_COMPARTMENT_ID" \
        --availability-domain "$OCI_AVAILABILITY_DOMAIN" \
        --display-name "$DISPLAY_NAME" \
        --image-id "$OCI_IMAGE_ID" \
        --subnet-id "$OCI_SUBNET_ID" \
        --shape "$OCI_SHAPE" \
        --shape-config "{\"ocpus\": ${OCI_OCPUS:-1}, \"memoryInGBs\": ${OCI_MEMORY_GB:-6}}" \
        --assign-public-ip true \
        --metadata "{\"ssh_authorized_keys\": \"$SSH_KEY_CONTENT\"}" \
        --boot-volume-size-in-gbs "$OCI_BOOT_VOLUME_SIZE" \
        --query 'data.id' \
        --raw-output)
else
    # Fixed shape - no shape-config needed
    INSTANCE_OCID=$(oci compute instance launch \
        --compartment-id "$OCI_COMPARTMENT_ID" \
        --availability-domain "$OCI_AVAILABILITY_DOMAIN" \
        --display-name "$DISPLAY_NAME" \
        --image-id "$OCI_IMAGE_ID" \
        --subnet-id "$OCI_SUBNET_ID" \
        --shape "$OCI_SHAPE" \
        --assign-public-ip true \
        --metadata "{\"ssh_authorized_keys\": \"$SSH_KEY_CONTENT\"}" \
        --boot-volume-size-in-gbs "$OCI_BOOT_VOLUME_SIZE" \
        --query 'data.id' \
        --raw-output)
fi

log_info "Instance created with OCID: $INSTANCE_OCID"

###############################################################################
# 3. Wait for instance to be running
###############################################################################
log_step "Waiting for instance to be running..."

# Wait for instance to reach RUNNING state
log_info "This may take 2-3 minutes..."
MAX_WAIT_SECONDS=300
WAIT_COUNT=0
WAIT_INTERVAL=10

while [ $WAIT_COUNT -lt $MAX_WAIT_SECONDS ]; do
    INSTANCE_STATE=$(oci compute instance get \
        --instance-id "$INSTANCE_OCID" \
        --query 'data."lifecycle-state"' \
        --raw-output)
    
    if [ "$INSTANCE_STATE" = "RUNNING" ]; then
        log_info "Instance is now running"
        break
    elif [ "$INSTANCE_STATE" = "TERMINATED" ] || [ "$INSTANCE_STATE" = "TERMINATING" ]; then
        log_error "Instance failed to start. State: $INSTANCE_STATE"
        exit 1
    else
        log_info "Instance state: $INSTANCE_STATE (waiting...)"
        sleep $WAIT_INTERVAL
        WAIT_COUNT=$((WAIT_COUNT + WAIT_INTERVAL))
    fi
done

if [ $WAIT_COUNT -ge $MAX_WAIT_SECONDS ]; then
    log_error "Timeout waiting for instance to reach RUNNING state"
    exit 1
fi

###############################################################################
# 4. Get public IP
###############################################################################
log_step "Getting instance public IP..."

PUBLIC_IP=$(oci compute instance list-vnics \
    --instance-id "$INSTANCE_OCID" \
    --query 'data[0]."public-ip"' \
    --raw-output)

log_info "Instance public IP: $PUBLIC_IP"

###############################################################################
# 5. Wait for SSH to be available
###############################################################################
log_step "Waiting for SSH to be available..."

# Wait for SSH to be ready
MAX_RETRIES=30
RETRY_COUNT=0
SSH_USER="ubuntu"  # Default for Ubuntu images

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$PUBLIC_IP" "echo 'SSH ready'" &> /dev/null; then
        log_info "SSH is ready"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            log_info "SSH not ready yet, waiting... (attempt $RETRY_COUNT/$MAX_RETRIES)"
            sleep 10
        else
            log_error "SSH connection failed after $MAX_RETRIES attempts"
            exit 1
        fi
    fi
done

###############################################################################
# 6. Upload and run setup script
###############################################################################
log_step "Setting up the instance..."

# Create a temporary setup script
TEMP_SETUP_SCRIPT="/tmp/setup-with-repo.sh"
cat > "$TEMP_SETUP_SCRIPT" << 'SETUP_EOF'
#!/bin/bash

# Download and run the original setup script
curl -fsSL https://raw.githubusercontent.com/REPO_PLACEHOLDER/main/scripts/setup-oci.sh | bash

# Clone the repository if provided
if [ ! -z "REPO_PLACEHOLDER" ]; then
    echo "Cloning repository..."
    cd /opt/social-media-app
    git clone REPO_PLACEHOLDER .
    npm ci
    npx prisma migrate deploy
    npm run build
    pm2 start npm --name "social-media-app" -- start
    pm2 save
    echo "Application deployed and started!"
else
    echo "No repository provided. Instance is ready for manual deployment."
    echo "You can clone your repository manually and deploy the app."
fi
SETUP_EOF

# Replace placeholder with actual repo URL (or empty string if not provided)
if [ -z "$GITHUB_REPO" ]; then
    sed -i "s|REPO_PLACEHOLDER||g" "$TEMP_SETUP_SCRIPT"
else
    sed -i "s|REPO_PLACEHOLDER|$GITHUB_REPO|g" "$TEMP_SETUP_SCRIPT"
fi

# Upload and run the setup script
scp -o StrictHostKeyChecking=no "$TEMP_SETUP_SCRIPT" "$SSH_USER@$PUBLIC_IP:/tmp/setup-with-repo.sh"
ssh -o StrictHostKeyChecking=no "$SSH_USER@$PUBLIC_IP" "chmod +x /tmp/setup-with-repo.sh && /tmp/setup-with-repo.sh"

# Clean up
rm "$TEMP_SETUP_SCRIPT"

log_info "Instance setup complete"

###############################################################################
# 7. Generate GitHub secrets configuration
###############################################################################
log_step "Generating GitHub secrets configuration..."

# Get SSH private key path (assuming it's the same as public key but without .pub)
SSH_PRIVATE_KEY_PATH="${OCI_SSH_KEY_PATH%.pub}"

if [ ! -f "$SSH_PRIVATE_KEY_PATH" ]; then
    log_warn "Private SSH key not found at: $SSH_PRIVATE_KEY_PATH"
    log_warn "You'll need to manually add the SSH key to GitHub secrets"
else
    log_info "SSH private key found. Here are your GitHub secrets:"
    echo ""
    echo "=== GITHUB SECRETS ==="
    echo "OCI_SSH_KEY:"
    echo "$(cat $SSH_PRIVATE_KEY_PATH)"
    echo ""
    echo "OCI_HOST: $PUBLIC_IP"
    echo "OCI_USER: $SSH_USER"
    echo "APP_URL: http://$PUBLIC_IP:80"
    echo ""
    echo "DATABASE_URL: (will be generated by setup script)"
    echo "JWT_SECRET: (will be generated by setup script)"
    echo "======================"
fi

###############################################################################
# 8. Final status and next steps
###############################################################################
log_step "Deployment complete!"

log_info ""
log_info "=================================================="
log_info "OCI Instance Created Successfully!"
log_info "=================================================="
log_info ""
log_info "Instance Details:"
log_info "  Name: $DISPLAY_NAME"
log_info "  OCID: $INSTANCE_OCID"
log_info "  Public IP: $PUBLIC_IP"
log_info "  SSH Command: ssh $SSH_USER@$PUBLIC_IP"
log_info ""
log_info "Application URL: http://$PUBLIC_IP:80"
log_info "Health Check: http://$PUBLIC_IP:80/api/health"
log_info ""
log_info "Next Steps:"
log_info "  1. Add the GitHub secrets shown above to your repository"
log_info "  2. Test the application at http://$PUBLIC_IP:80"
log_info "  3. Push to main branch to trigger CI/CD deployment"
log_info ""
log_info "Useful Commands:"
log_info "  SSH to instance: ssh $SSH_USER@$PUBLIC_IP"
log_info "  Check app status: ssh $SSH_USER@$PUBLIC_IP 'pm2 status'"
log_info "  View app logs: ssh $SSH_USER@$PUBLIC_IP 'pm2 logs social-media-app'"
log_info ""
log_info "=================================================="

# Save instance details to file
INSTANCE_DETAILS_FILE="oci-instance-details.txt"
cat > "$INSTANCE_DETAILS_FILE" << EOF
# OCI Instance Details
# Created: $(date)

INSTANCE_OCID=$INSTANCE_OCID
PUBLIC_IP=$PUBLIC_IP
SSH_USER=$SSH_USER
APP_URL=http://$PUBLIC_IP:80
HEALTH_CHECK_URL=http://$PUBLIC_IP:80/api/health

# SSH Command
ssh $SSH_USER@$PUBLIC_IP

# GitHub Secrets
OCI_HOST=$PUBLIC_IP
OCI_USER=$SSH_USER
APP_URL=http://$PUBLIC_IP:80
EOF

log_info "Instance details saved to: $INSTANCE_DETAILS_FILE"
