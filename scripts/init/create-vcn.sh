#!/bin/bash

###############################################################################
# OCI VCN Creation Script
# This script creates a VCN and subnet for your OCI instance
###############################################################################

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load configuration (automatic fallback)
if [ -f "$SCRIPT_DIR/load-config.sh" ]; then
    source "$SCRIPT_DIR/load-config.sh"
else
    log_warn "load-config.sh not found - using environment variables only"
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

# Use compartment ID from config
COMPARTMENT_ID="$OCI_COMPARTMENT_ID"

# Check if OCI CLI is installed and configured
if ! command -v oci &> /dev/null; then
    log_error "OCI CLI is not installed. Please install it first:"
    log_error "https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
fi

# Test OCI CLI configuration
if ! oci iam user list &> /dev/null; then
    log_error "OCI CLI is not properly configured. Please run: oci setup config"
    exit 1
fi

log_info "OCI CLI is properly configured"

log_info "Using compartment ID: $COMPARTMENT_ID"

# VCN Configuration
VCN_NAME="social-media-vcn-$(date +%Y%m%d-%H%M%S)"
VCN_CIDR="$VCN_CIDR_BLOCK"
SUBNET_NAME="social-media-subnet-$(date +%Y%m%d-%H%M%S)"
SUBNET_CIDR="$SUBNET_CIDR_BLOCK"

log_step "Creating VCN: $VCN_NAME"
echo ""

# Create VCN
VCN_ID=$(oci network vcn create \
    --compartment-id "$COMPARTMENT_ID" \
    --display-name "$VCN_NAME" \
    --cidr-block "$VCN_CIDR" \
    --dns-label "socialmedia" \
    --query 'data.id' \
    --raw-output)

if [ -z "$VCN_ID" ]; then
    log_error "Failed to create VCN"
    exit 1
fi

log_info "VCN created successfully: $VCN_ID"

# Wait for VCN to be available
log_info "Waiting for VCN to be available..."
sleep 10

# Create Internet Gateway
log_step "Creating Internet Gateway"
IGW_ID=$(oci network internet-gateway create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "social-media-igw" \
    --is-enabled true \
    --query 'data.id' \
    --raw-output)

log_info "Internet Gateway created: $IGW_ID"

# Create Route Table
log_step "Creating Route Table"
ROUTE_TABLE_ID=$(oci network route-table create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "social-media-route-table" \
    --route-rules '[{"destination":"0.0.0.0/0","destinationType":"CIDR_BLOCK","networkEntityId":"'$IGW_ID'"}]' \
    --query 'data.id' \
    --raw-output)

log_info "Route Table created: $ROUTE_TABLE_ID"

# Create Security List
log_step "Creating Security List"
SECURITY_LIST_ID=$(oci network security-list create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "social-media-security-list" \
    --egress-security-rules '[{"destination":"0.0.0.0/0","destinationType":"CIDR_BLOCK","protocol":"all","isStateless":false}]' \
    --ingress-security-rules '[{"source":"0.0.0.0/0","sourceType":"CIDR_BLOCK","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},{"source":"0.0.0.0/0","sourceType":"CIDR_BLOCK","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":3000,"max":3000}}},{"source":"0.0.0.0/0","sourceType":"CIDR_BLOCK","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},{"source":"0.0.0.0/0","sourceType":"CIDR_BLOCK","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":443,"max":443}}}]' \
    --query 'data.id' \
    --raw-output)

log_info "Security List created: $SECURITY_LIST_ID"

# Create Subnet
log_step "Creating Subnet: $SUBNET_NAME"
SUBNET_ID=$(oci network subnet create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "$SUBNET_NAME" \
    --cidr-block "$SUBNET_CIDR" \
    --dns-label "socialmedia" \
    --route-table-id "$ROUTE_TABLE_ID" \
    --security-list-ids "[\"$SECURITY_LIST_ID\"]" \
    --query 'data.id' \
    --raw-output)

if [ -z "$SUBNET_ID" ]; then
    log_error "Failed to create subnet"
    exit 1
fi

log_info "Subnet created successfully: $SUBNET_ID"

# Wait for subnet to be available
log_info "Waiting for subnet to be available..."
sleep 15

echo ""
log_step "VCN Setup Complete!"
echo ""
log_info "VCN ID: $VCN_ID"
log_info "Subnet ID: $SUBNET_ID"
log_info "Internet Gateway ID: $IGW_ID"
log_info "Route Table ID: $ROUTE_TABLE_ID"
log_info "Security List ID: $SECURITY_LIST_ID"
echo ""

log_step "Security Rules Configured:"
echo "  - SSH (port 22): Allowed from anywhere"
echo "  - HTTP (port 80): Allowed from anywhere"
echo "  - HTTPS (port 443): Allowed from anywhere"
echo "  - App (port 3000): Allowed from anywhere"
echo ""

log_step "Next Steps:"
echo "1. Update your create-oci-instance.sh script with:"
echo "   COMPARTMENT_ID=\"$COMPARTMENT_ID\""
echo "   SUBNET_ID=\"$SUBNET_ID\""
echo ""
echo "2. Run the instance creation script:"
echo "   ./scripts/init/create-oci-instance.sh"
echo ""

log_info "VCN and subnet are ready for your social media app instance!"
