#!/bin/bash

# OCI Region Switcher
# This script helps you switch between different region configurations

set -e

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

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Available regions
REGIONS=("phoenix" "ashburn" "frankfurt" "london")

show_usage() {
    echo "Usage: $0 <region>"
    echo ""
    echo "Available regions:"
    for region in "${REGIONS[@]}"; do
        echo "  - $region"
    done
    echo ""
    echo "Example: $0 ashburn"
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

REGION=$1

# Check if region is valid
if [[ ! " ${REGIONS[@]} " =~ " ${REGION} " ]]; then
    log_error "Invalid region: $REGION"
    show_usage
    exit 1
fi

# Check if config file exists
CONFIG_FILE="$SCRIPT_DIR/oci-config.$REGION.env"
if [ ! -f "$CONFIG_FILE" ]; then
    log_error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Backup current config if it exists
if [ -f "$SCRIPT_DIR/oci-config.local.env" ]; then
    log_info "Backing up current config to oci-config.local.env.backup"
    cp "$SCRIPT_DIR/oci-config.local.env" "$SCRIPT_DIR/oci-config.local.env.backup"
fi

# Copy the region config to local config
log_info "Switching to $REGION region configuration..."
cp "$CONFIG_FILE" "$SCRIPT_DIR/oci-config.local.env"

log_success "Successfully switched to $REGION region!"
log_info "Current configuration: $SCRIPT_DIR/oci-config.local.env"
log_warn "Note: You may need to update subnet ID and image ID for the new region"
log_warn "Run './scripts/init/get-oci-info.sh' to get region-specific information"
