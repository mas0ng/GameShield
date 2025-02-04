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
   git clone https://github.com/mas0ng/GameShield.git
   ```
2. Open Chrome and navigate to chrome://extensions/.
3. Enable Developer Mode (toggle in the top right corner).
4. Click Load unpacked and select the GameShield project folder.

## How It Works

### Content Script (`contentScript.js`)
- Injects `pageScript.js` into websites to listen for keypress events.
- Checks against predefined sequences (`sequences.json`).
- Redirects to the block page (`blocked.html`) if gaming activity is detected.
- Loads block lists (`bannedWords.json`, `bannedConnections.json`, `blockimmediatelylist.json`) and prevents access to flagged sites.

### Page Script (`pageScript.js`)
- Captures keypresses and sends them to `contentScript.js`.
- Ensures that gaming input patterns are detected in real time.

### Block Page (`blocked.html` & `blocked.js`)
- Displays a custom message explaining why the site was blocked.
- Shows the detected reason using Base64 encoding in the URL.

### Configuration Files
- **`allowlist.json`**: Defines allowed websites (e.g., Google, Gmail).
- **`bannedWords.json`**: List of blocked game-related words.
- **`bannedConnections.json`**: Blocks certain third-party game-related services.
- **`blockimmediatelylist.json`**: List of domains that trigger an immediate block.
- **`sequences.json`**: Defines keypress sequences associated with gaming.

## Permissions
This extension requires the following permissions:
- `storage` - To store user preferences.
- `scripting` - To inject scripts into pages.
- `tabs` - To monitor tab activity and enforce restrictions.
- `host_permissions` - To control access to certain domains.

## Known Issues
- False positives may occur if certain key combinations are used frequently outside of gaming.
- Users may attempt to bypass the extension by disabling it.

## Future Enhancements
- User-configurable block lists.
- More advanced activity detection algorithms.
- Admin panel for school or workplace control.

## License
This project is open-source and available under the MIT License.

## Contributing
Feel free to submit issues and pull requests to improve GameShield!

