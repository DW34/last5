// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Installed');
});

// Function to get OAuth token
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

// Function to fetch last accessed files
async function fetchLastFiles(forceRefresh = false) {
  try {
    // Check cache first, unless forceRefresh is true
    if (!forceRefresh) {
      const cachedFiles = await getCachedFiles();
      if (cachedFiles) {
        console.log('Returning cached files');
        return cachedFiles;
      }
    }

    const token = await getAuthToken();
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,mimeType,modifiedTime,viewedByMeTime)',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    const files = data.files; // Remove the slice here

    // Cache the fetched files
    await cacheFiles(files);

    return files;
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}

// Function to get cached files
async function getCachedFiles() {
  return new Promise((resolve) => {
    chrome.storage.local.get('cachedFiles', (result) => {
      if (result.cachedFiles && Date.now() - result.cachedFiles.timestamp < 5 * 60 * 1000) {
        resolve(result.cachedFiles.files);
      } else {
        resolve(null);
      }
    });
  });
}

// Function to cache files
async function cacheFiles(files) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      cachedFiles: {
        files: files,
        timestamp: Date.now()
      }
    }, resolve);
  });
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLastFiles') {
    if (request.forceRefresh) {
      // Force a new fetch from the API
      fetchLastFiles(true).then((files) => sendResponse({ files }));
    } else {
      // Use cached data if available
      fetchLastFiles().then((files) => sendResponse({ files }));
    }
    return true; // Indicates that the response is asynchronous
  }
});
