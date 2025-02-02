# GameShield - Chrome Extension

## Overview
GameShield is a Chrome extension designed to help users stay focused by blocking websites that contain games. It detects gaming-related activity through keypress patterns and content scanning, automatically redirecting users away from blocked sites.

## Features
- **Detects Suspicious Keypresses**: Monitors common gaming key sequences (e.g., WASD, arrow keys) and blocks sites if excessive gaming behavior is detected.
- **Banned Word Scanning**: Analyzes website text for blocked game-related words and triggers a block if necessary.
- **Immediate Blocking List**: Instantly blocks known gaming websites.
- **Banned Connections**: Prevents access to known game-related domains.
- **Allowlist Support**: Ensures that essential non-gaming websites remain accessible.
- **Custom Block Page**: Redirects users to a block page explaining why access was denied.

## Installation
1. Download the repository as a ZIP file or clone it using Git:
   ```bash
   git clone https://github.com/your-username/GameShield.git
   ```
2. Open Chrome and navigate to chrome://extensions/.
3. Enable Developer Mode (toggle in the top right corner).
4. Click Load unpacked and select the GameShield project folder.

## How It Works
