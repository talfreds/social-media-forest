#!/bin/bash

###############################################################################
# OCI Instance Termination Script
# This script terminates an existing OCI instance
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
    source "$SCRIPT_DIR/load-config.sh"
    main
else
    log_warn "load-config.sh not found - using environment variables only"
fi

# Check if instance OCID is provided
if [ -z "$1" ]; then
    log_error "Usage: $0 <INSTANCE_OCID>"
    log_error "Example: $0 ocid1.instance.oc1.phx.anyhqljsyznje4ac7wysahl6mq2nyiavt3blkcz5mrxxg4mgrk5odwa2bzpa"
    exit 1
fi

INSTANCE_OCID="$1"

log_info "Terminating instance: $INSTANCE_OCID"

###############################################################################
# 1. Check instance status
###############################################################################
log_step "Checking instance status..."

INSTANCE_STATE=$(oci compute instance get \
    --instance-id "$INSTANCE_OCID" \
    --query 'data."lifecycle-state"' \
    --raw-output)

log_info "Instance state: $INSTANCE_STATE"

if [ "$INSTANCE_STATE" = "TERMINATED" ]; then
    log_info "Instance is already terminated"
    exit 0
fi

if [ "$INSTANCE_STATE" = "TERMINATING" ]; then
    log_info "Instance is already being terminated"
    exit 0
fi

###############################################################################
# 2. Get instance details before termination
###############################################################################
log_step "Getting instance details..."

INSTANCE_NAME=$(oci compute instance get \
    --instance-id "$INSTANCE_OCID" \
    --query 'data."display-name"' \
    --raw-output)

PUBLIC_IP=$(oci compute instance list-vnics \
    --instance-id "$INSTANCE_OCID" \
    --query 'data[0]."public-ip"' \
    --raw-output 2>/dev/null || echo "N/A")

log_info "Instance name: $INSTANCE_NAME"
log_info "Public IP: $PUBLIC_IP"

###############################################################################
# 3. Terminate the instance
###############################################################################
log_step "Terminating instance..."

# Terminate the instance
oci compute instance terminate \
    --instance-id "$INSTANCE_OCID" \
    --force

log_info "Termination command sent"

###############################################################################
# 4. Wait for termination to complete
###############################################################################
log_step "Waiting for termination to complete..."

MAX_WAIT_SECONDS=300
WAIT_COUNT=0
WAIT_INTERVAL=10

while [ $WAIT_COUNT -lt $MAX_WAIT_SECONDS ]; do
    INSTANCE_STATE=$(oci compute instance get \
        --instance-id "$INSTANCE_OCID" \
        --query 'data."lifecycle-state"' \
        --raw-output)
    
    if [ "$INSTANCE_STATE" = "TERMINATED" ]; then
        log_info "Instance has been terminated successfully"
        break
    else
        log_info "Instance state: $INSTANCE_STATE (waiting...)"
        sleep $WAIT_INTERVAL
        WAIT_COUNT=$((WAIT_COUNT + WAIT_INTERVAL))
    fi
done

if [ $WAIT_COUNT -ge $MAX_WAIT_SECONDS ]; then
    log_warn "Timeout waiting for instance termination. It may still be terminating."
    log_warn "You can check the status manually with:"
    log_warn "oci compute instance get --instance-id $INSTANCE_OCID"
fi

###############################################################################
# 5. Final status
###############################################################################
log_step "Termination complete!"

log_info ""
log_info "=================================================="
log_info "OCI Instance Terminated Successfully!"
log_info "=================================================="
log_info ""
log_info "Instance Details:"
log_info "  Name: $INSTANCE_NAME"
log_info "  OCID: $INSTANCE_OCID"
log_info "  Public IP: $PUBLIC_IP"
log_info "  Final State: $INSTANCE_STATE"
log_info ""
log_info "Next Steps:"
log_info "  1. Generate a new SSH key without passphrase"
log_info "  2. Update your configuration"
log_info "  3. Create a new instance"
log_info ""
log_info "=================================================="
