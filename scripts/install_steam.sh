#!/bin/bash

# Exit on error
set -e

# Variables
WINE_PREFIX="$HOME/.steam-wine"
STEAM_SETUP_URL="https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe"
DXVK_VERSION="2.3"

# Check for Homebrew
if ! command -v brew &> /dev/null; then
  echo "Homebrew not found. Please install it first."
  exit 1
fi

# Install Wine
if ! command -v wine &> /dev/null; then
  echo "Installing Wine..."
  brew install --cask wine-stable
fi

# Create Wine prefix
if [ ! -d "$WINE_PREFIX" ]; then
  echo "Creating Wine prefix..."
  mkdir -p "$WINE_PREFIX"
fi



# Download and install Steam
if [ ! -f "$WINE_PREFIX/steam.done" ]; then
  echo "Downloading and installing Steam..."
  curl -L "$STEAM_SETUP_URL" -o "$WINE_PREFIX/SteamSetup.exe"
  WINEPREFIX="$WINE_PREFIX" wine "$WINE_PREFIX/SteamSetup.exe"
  touch "$WINE_PREFIX/steam.done"
fi

echo "Installation complete."
