#!/bin/bash

# Exit on error
set -e

# Variables
WINE_PREFIX="$HOME/.steam-wine"
STEAM_SETUP_URL="https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe"
DXVK_VERSION="2.3"

# Install Homebrew
if ! command -v brew &> /dev/null; then
  echo "Homebrew not found. Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Node.js and npm
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing Node.js..."
  brew install node
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

# Install npm dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Download and install Steam
if [ ! -f "$WINE_PREFIX/steam.done" ]; then
  echo "Downloading and installing Steam..."
  curl -L "$STEAM_SETUP_URL" -o "$WINE_PREFIX/SteamSetup.exe"
  WINEPREFIX="$WINE_PREFIX" wine "$WINE_PREFIX/SteamSetup.exe"
  touch "$WINE_PREFIX/steam.done"
fi

echo "Installation complete."
