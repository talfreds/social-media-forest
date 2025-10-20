#!/bin/bash

###############################################################################
# OCI Information Helper Script
# This script helps you gather the required information for creating an OCI instance
###############################################################################

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load configuration (optional - this script can run without config)
if [ -f "$SCRIPT_DIR/load-config.sh" ]; then
    source "$SCRIPT_DIR/load-config.sh" 2>/dev/null || true
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to get compartment ID with fallback to tenancy ID
get_compartment_id() {
    local compartment_id=$(oci iam compartment list --query 'data[0].id' --raw-output 2>/dev/null || echo "")
    
    if [ -z "$compartment_id" ] || [ "$compartment_id" = "null" ]; then
        log_warn "No compartments found, using tenancy ID as fallback" >&2
        
        # Try multiple methods to get tenancy ID
        compartment_id=$(oci iam user get --user-id $(oci iam user list --query 'data[0].id' --raw-output) --query 'data.compartment-id' --raw-output 2>/dev/null || echo "")
        
        if [ -z "$compartment_id" ] || [ "$compartment_id" = "null" ]; then
            # Alternative method: get tenancy ID from config
            compartment_id=$(oci iam user get --user-id $(oci iam user list --query 'data[0].id' --raw-output) --query 'data.tenant-id' --raw-output 2>/dev/null || echo "")
        fi
        
        if [ -z "$compartment_id" ] || [ "$compartment_id" = "null" ]; then
            # Last resort: try to get from OCI config file
            if [ -f ~/.oci/config ]; then
                compartment_id=$(grep "^tenancy=" ~/.oci/config | cut -d'=' -f2 | tr -d ' ' 2>/dev/null || echo "")
            fi
        fi
        
        if [ -z "$compartment_id" ] || [ "$compartment_id" = "null" ]; then
            log_error "Could not determine compartment ID or tenancy ID" >&2
            log_error "Please ensure your OCI CLI is properly configured with: oci setup config" >&2
            exit 1
        fi
        
        log_info "Using tenancy ID as compartment: $compartment_id" >&2
    else
        log_info "Using compartment ID: $compartment_id" >&2
    fi
    
    echo "$compartment_id"
}

# Check if OCI CLI is installed and configured
if ! command -v oci &> /dev/null; then
    log_error "OCI CLI is not installed. Please install it first:"
    log_error "https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
fi

if ! oci iam user get --user-id $(oci iam user list --query 'data[0].id' --raw-output) &> /dev/null; then
    log_error "OCI CLI is not configured. Please run 'oci setup config' first."
    exit 1
fi

log_info "Gathering OCI information for instance creation..."

###############################################################################
# 1. Get Compartments
###############################################################################
log_step "Available Compartments:"
echo ""
oci iam compartment list --query 'data[*].{Name:name,OCID:id}' --output table 
echo ""

###############################################################################
# 2. Get Availability Domains
###############################################################################
log_step "Available Domains:"
echo ""
oci iam availability-domain list --query 'data[*].{Name:name}' --output table
echo ""

###############################################################################
# 3. Get VCNs and Subnets
###############################################################################
log_step "Available VCNs:"
echo ""
oci network vcn list --compartment-id $(get_compartment_id) --query 'data[*].{Name:"display-name",OCID:id,CIDR:"cidr-block"}' --output table
echo ""

log_step "Available Subnets:"
echo ""
oci network subnet list --compartment-id $(get_compartment_id) --query 'data[*].{Name:"display-name",OCID:id,VCN:"vcn-id",CIDR:"cidr-block"}' --output table
echo ""

###############################################################################
# 4. Get Always Free Shapes
###############################################################################
log_step "Available Always Free Shapes:"
echo ""
# Get Always Free shapes - use a simpler approach
COMPARTMENT_ID=$(get_compartment_id)
echo "Querying available shapes for compartment: $COMPARTMENT_ID"
echo ""

# Try a simpler query first
if oci compute shape list --compartment-id "$COMPARTMENT_ID" --query 'data[].{Name:name,OCPUs:"ocpus",Memory:"memory-in-gbs"}' --output table 2>/dev/null | head -20; then
    echo ""
    echo "Note: Look for shapes like 'VM.Standard.E2.1.Micro' for Always Free tier"
else
    echo "Could not retrieve shapes. This might be due to:"
    echo "1. Insufficient permissions"
    echo "2. No shapes available in this region"
    echo "3. Account limitations"
    echo ""
    echo "For Always Free tier, you typically want: VM.Standard.E2.1.Micro"
fi
echo ""

###############################################################################
# 5. Get Ubuntu Images
###############################################################################
log_step "Available Ubuntu Images:"
echo ""
oci compute image list --compartment-id $(get_compartment_id) --operating-system "Canonical Ubuntu" --query 'data[0:3].{Name:"display-name",OCID:id,OS:"operating-system",Version:"operating-system-version"}' --output table
echo ""

###############################################################################
# 6. Generate Configuration Template
###############################################################################
log_step "Generating configuration template..."

CONFIG_FILE="oci-instance-config.sh"
cat > "$CONFIG_FILE" << 'EOF'
#!/bin/bash

# OCI Instance Configuration
# Update these values with your actual OCI information

# Required Configuration
COMPARTMENT_ID=""  # Copy from compartments list above
AVAILABILITY_DOMAIN=""  # e.g., "AD-3", "AD-3", "AD-3"
SUBNET_ID=""  # Copy from subnets list above
SSH_KEY_PATH=""  # Path to your public SSH key (e.g., ~/.ssh/id_rsa.pub)
GITHUB_REPO=""  # Your GitHub repository URL

# Optional Configuration (usually don't need to change)
IMAGE_ID="your-image-ocid-here"  # Ubuntu 22.04 LTS
SHAPE="VM.Standard.E2.1.Micro"  # Always Free shape
REGION="us-ashburn-1"  # Your preferred region
BOOT_VOLUME_SIZE="50"  # GB
EOF

log_info "Configuration template created: $CONFIG_FILE"
echo ""
log_info "Next Steps:"
log_info "1. Update the values in $CONFIG_FILE with your OCI information"
log_info "2. Make sure you have an SSH key pair generated"
log_info "3. Run: ./scripts/create-oci-instance.sh"
echo ""

###############################################################################
# 7. SSH Key Check
###############################################################################
log_step "Checking for SSH keys..."

if [ -f "$HOME/.ssh/id_rsa.pub" ]; then
    log_info "Found SSH public key: $HOME/.ssh/id_rsa.pub"
    echo "SSH Key: $(cat $HOME/.ssh/id_rsa.pub)"
elif [ -f "$HOME/.ssh/id_ed25519.pub" ]; then
    log_info "Found SSH public key: $HOME/.ssh/id_ed25519.pub"
    echo "SSH Key: $(cat $HOME/.ssh/id_ed25519.pub)"
else
    log_warn "No SSH public key found. Generate one with:"
    log_warn "ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
fi

echo ""
log_info "=================================================="
log_info "Information gathering complete!"
log_info "=================================================="
