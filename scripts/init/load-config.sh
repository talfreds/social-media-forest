#!/bin/bash

# OCI Configuration Loader
# This script loads configuration from environment files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration file paths
CONFIG_FILE="$SCRIPT_DIR/oci-config.env"
LOCAL_CONFIG_FILE="$SCRIPT_DIR/oci-config.local.env"

# Load configuration
load_config() {
    # Check if local config exists, otherwise use default
    if [ -f "$LOCAL_CONFIG_FILE" ]; then
        log_info "Using local configuration: $LOCAL_CONFIG_FILE"
        # Handle Windows line endings and source directly
        sed 's/\r$//' "$LOCAL_CONFIG_FILE" > /tmp/oci-config-clean.env
        source /tmp/oci-config-clean.env
        rm -f /tmp/oci-config-clean.env
    elif [ -f "$CONFIG_FILE" ]; then
        log_info "Using default configuration: $CONFIG_FILE"
        # Handle Windows line endings and source directly
        sed 's/\r$//' "$CONFIG_FILE" > /tmp/oci-config-clean.env
        source /tmp/oci-config-clean.env
        rm -f /tmp/oci-config-clean.env
    else
        log_warn "No configuration file found!"
        log_warn "Please create $LOCAL_CONFIG_FILE or ensure $CONFIG_FILE exists"
        log_warn "Continuing with environment variables only..."
        return 0
    fi
    
    # Validate required variables
    validate_config
}

# Validate configuration
validate_config() {
    local missing_vars=()
    
    # Check required OCI variables
    [ -z "$OCI_COMPARTMENT_ID" ] && missing_vars+=("OCI_COMPARTMENT_ID")
    [ -z "$OCI_REGION" ] && missing_vars+=("OCI_REGION")
    [ -z "$OCI_AVAILABILITY_DOMAIN" ] && missing_vars+=("OCI_AVAILABILITY_DOMAIN")
    [ -z "$OCI_SUBNET_ID" ] && missing_vars+=("OCI_SUBNET_ID")
    [ -z "$OCI_SSH_KEY_PATH" ] && missing_vars+=("OCI_SSH_KEY_PATH")
    [ -z "$OCI_IMAGE_ID" ] && missing_vars+=("OCI_IMAGE_ID")
    [ -z "$OCI_SHAPE" ] && missing_vars+=("OCI_SHAPE")
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warn "Missing configuration variables:"
        for var in "${missing_vars[@]}"; do
            log_warn "  - $var"
        done
        log_warn "These can be set via environment variables or configuration file"
        return 1
    fi
    
    # Check if SSH key file exists (only if path is set)
    if [ -n "$OCI_SSH_KEY_PATH" ] && [ ! -f "$OCI_SSH_KEY_PATH" ]; then
        log_warn "SSH key file not found: $OCI_SSH_KEY_PATH"
        log_warn "Please update OCI_SSH_KEY_PATH in your configuration"
        return 1
    fi
    
    log_success "Configuration validated successfully"
    return 0
}

# Export all OCI variables for use in other scripts
export_config() {
    export OCI_COMPARTMENT_ID
    export OCI_REGION
    export OCI_AVAILABILITY_DOMAIN
    export OCI_SUBNET_ID
    export OCI_SSH_KEY_PATH
    export OCI_IMAGE_ID
    export OCI_SHAPE
    export OCI_BOOT_VOLUME_SIZE
    export OCI_OCPUS
    export OCI_MEMORY_GB
    export GITHUB_REPO
    export APP_NAME
    export APP_PORT
    export VCN_CIDR_BLOCK
    export SUBNET_CIDR_BLOCK
}

# Main function
main() {
    load_config
    export_config
    if validate_config; then
        log_info "Configuration loaded and validated successfully"
    else
        log_warn "Configuration loaded with warnings - some variables may be missing"
    fi
}

# Run main function if script is executed directly or sourced
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
else
    # Script is being sourced, run main function
    main "$@"
fi
