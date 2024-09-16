# Google Drive Last Files Chrome Extension

## Description

This Chrome Extension allows users to quickly access their last accessed Google Drive files. It displays the five most recently modified files from the user's Google Drive, with options to filter by file type and sort by recency or frequency of access.

## Features

- Display the last 5 accessed Google Drive files
- Filter files by type (All, Docs, Sheets, Slides, Others)
- Sort files by recent modification or access frequency
- Refresh file list on demand
- Open files directly in Google Drive with a single click

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Use the tabs at the top to filter files by type.
3. Click the toggle switch at the bottom to sort by recency or frequency.
4. Click the refresh button to fetch the latest files from Google Drive.
5. Click on a file to open it in Google Drive.

## Configuration

Before using the extension, you need to set up OAuth 2.0 credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google Drive API for your project.
4. Create OAuth 2.0 credentials (OAuth client ID) for a Chrome Extension.
5. Add your extension's ID to the authorized JavaScript origins.
6. Copy the client ID and paste it into the `manifest.json` file in the `oauth2.client_id` field.

## Files

- `manifest.json`: Extension configuration file
- `popup.html`: HTML structure for the extension popup
- `popup.js`: JavaScript for handling popup interactions and displaying files
- `background.js`: Background script for handling authentication and API requests
- `styles.css`: CSS styles for the popup

## Dependencies

This extension uses the following APIs:

- Chrome Extension API
- Chrome Identity API
- Google Drive API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)# Last_five
# Last5
