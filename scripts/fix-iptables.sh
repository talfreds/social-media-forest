#!/bin/bash

###############################################################################
# Fix iptables Rules on OCI Instance
# This script fixes the ordering of iptables rules to ensure HTTP/HTTPS work
###############################################################################

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

log_step() {
    echo -e "${BLUE}==>${NC} $1"
}

log_info "Fixing iptables rules for HTTP/HTTPS access..."
echo ""

# Show current rules
log_step "Current iptables rules:"
sudo iptables -L INPUT -n --line-numbers
echo ""

# Check if REJECT rule exists
REJECT_RULE_NUM=$(sudo iptables -L INPUT --line-numbers -n | grep "reject-with icmp-host-prohibited" | awk '{print $1}' | head -1)

if [ -z "$REJECT_RULE_NUM" ]; then
    log_warn "No REJECT rule found - iptables might already be configured correctly"
else
    log_info "Found REJECT rule at position $REJECT_RULE_NUM"
fi

# Check if port 80 and 443 rules exist and their positions
PORT_80_LINE=$(sudo iptables -L INPUT --line-numbers -n | grep "dpt:80" | awk '{print $1}' | head -1)
PORT_443_LINE=$(sudo iptables -L INPUT --line-numbers -n | grep "dpt:443" | awk '{print $1}' | head -1)

# Determine if we need to fix
NEEDS_FIX=false

if [ -n "$REJECT_RULE_NUM" ] && [ -n "$PORT_80_LINE" ] && [ "$PORT_80_LINE" -gt "$REJECT_RULE_NUM" ]; then
    log_warn "Port 80 rule is AFTER the REJECT rule - needs fixing!"
    NEEDS_FIX=true
fi

if [ -n "$REJECT_RULE_NUM" ] && [ -n "$PORT_443_LINE" ] && [ "$PORT_443_LINE" -gt "$REJECT_RULE_NUM" ]; then
    log_warn "Port 443 rule is AFTER the REJECT rule - needs fixing!"
    NEEDS_FIX=true
fi

if [ "$NEEDS_FIX" = false ]; then
    log_info "✅ iptables rules are already in the correct order!"
    exit 0
fi

echo ""
log_step "Fixing iptables rules..."

# Remove REJECT rule temporarily
if [ -n "$REJECT_RULE_NUM" ]; then
    log_info "Removing REJECT rule temporarily..."
    sudo iptables -D INPUT "$REJECT_RULE_NUM"
fi

# Remove existing port rules (we'll add them back in the right order)
if [ -n "$PORT_80_LINE" ]; then
    log_info "Removing existing port 80 rule..."
    # Recalculate line number after previous deletion
    PORT_80_LINE=$(sudo iptables -L INPUT --line-numbers -n | grep "dpt:80" | awk '{print $1}' | head -1)
    if [ -n "$PORT_80_LINE" ]; then
        sudo iptables -D INPUT "$PORT_80_LINE"
    fi
fi

if [ -n "$PORT_443_LINE" ]; then
    log_info "Removing existing port 443 rule..."
    # Recalculate line number
    PORT_443_LINE=$(sudo iptables -L INPUT --line-numbers -n | grep "dpt:443" | awk '{print $1}' | head -1)
    if [ -n "$PORT_443_LINE" ]; then
        sudo iptables -D INPUT "$PORT_443_LINE"
    fi
fi

# Add port rules back at the end (before REJECT)
log_info "Adding port 80 rule in correct position..."
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 80 -j ACCEPT

log_info "Adding port 443 rule in correct position..."
sudo iptables -A INPUT -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Add REJECT rule back at the end
if [ -n "$REJECT_RULE_NUM" ]; then
    log_info "Adding REJECT rule back at the end..."
    sudo iptables -A INPUT -j REJECT --reject-with icmp-host-prohibited
fi

# Save rules
log_info "Saving iptables rules..."
if command -v netfilter-persistent &> /dev/null; then
    sudo netfilter-persistent save
else
    log_warn "netfilter-persistent not found, trying manual save..."
    sudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null
fi

echo ""
log_step "✅ iptables rules fixed successfully!"
echo ""
log_info "New iptables rules:"
sudo iptables -L INPUT -n --line-numbers
echo ""
log_info "You can now test HTTP/HTTPS access to your server"

