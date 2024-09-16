document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('file-list');
  const tabButtons = document.querySelectorAll('.tab-button');
  const refreshButton = document.getElementById('refresh-button');
  const sortToggle = document.getElementById('sort-toggle');
  const toggleTextLeft = sortToggle.querySelector('.toggle-text-left');
  const toggleTextRight = sortToggle.querySelector('.toggle-text-right');
  let files = [];
  let filteredFiles = [];
  let frequencyData = {};
  let currentTab = 'all';
  let currentSort = 'recent';

  let availableTypes = new Set();

  // Load frequency data from storage
  chrome.storage.local.get(['frequencyData'], (result) => {
    frequencyData = result.frequencyData || {};
  });

  // Function to fetch and render files
  function fetchAndRenderFiles(forceRefresh = false) {
    chrome.runtime.sendMessage({ action: 'getLastFiles', forceRefresh }, (response) => {
      files = response.files
        .filter(file => !file.name.startsWith('Untitled'))
        .slice(0, 5) // Limit to 5 files after filtering
        .map(file => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          modifiedTime: file.modifiedTime,
          viewedByMeTime: file.viewedByMeTime || file.modifiedTime,
        }));

      updateAvailableTypes();
      updateTabButtons();
      filterFiles(currentTab);
      sortFiles(currentSort);
    });
  }

  // Update available file types
  function updateAvailableTypes() {
    availableTypes.clear();
    files.forEach(file => {
      const fileType = getFileType(file.mimeType);
      availableTypes.add(fileType);
    });
  }

  // Update tab buttons visibility
  function updateTabButtons() {
    tabButtons.forEach(button => {
      const type = button.getAttribute('data-type');
      if (type === 'all' || availableTypes.has(type) || (type === 'other' && availableTypes.has('others'))) {
        button.style.display = 'block';
      } else {
        button.style.display = 'none';
      }
    });

    // Ensure a visible tab is selected
    if (!availableTypes.has(currentTab) && currentTab !== 'all') {
      const firstVisibleTab = document.querySelector('.tab-button:not([style*="display: none"])');
      if (firstVisibleTab) {
        firstVisibleTab.click();
      }
    }
  }

  // Initial fetch and render
  fetchAndRenderFiles();

  // Render files to the UI
  function renderFiles(filesToRender) {
    fileList.innerHTML = '';
    filesToRender.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';

      const icon = document.createElement('img');
      icon.className = 'file-icon';
      icon.src = getIconForMimeType(file.mimeType);
      icon.alt = getFileType(file.mimeType);

      const fileDetails = document.createElement('div');
      fileDetails.className = 'file-details';

      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = file.name;

      const fileDate = document.createElement('div');
      fileDate.className = 'file-date';
      fileDate.textContent = `Last modified: ${new Date(file.modifiedTime).toLocaleString()}`;

      fileDetails.appendChild(fileName);
      fileDetails.appendChild(fileDate);

      fileItem.appendChild(icon);
      fileItem.appendChild(fileDetails);

      fileItem.addEventListener('click', () => {
        window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank');
        incrementFrequency(file.id);
      });

      fileList.appendChild(fileItem);
    });
  }

  // Handle tab button clicks
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentTab = button.getAttribute('data-type');
      filterFiles(currentTab);
    });
  });

  // Handle sort toggle click
  sortToggle.addEventListener('click', () => {
    sortToggle.classList.toggle('frequency');
    currentSort = sortToggle.classList.contains('frequency') ? 'frequency' : 'recent';
      // Update text visibility
      if (currentSort === 'recent') {
        toggleTextLeft.textContent = 'Recent';
        toggleTextRight.textContent = '';
      } else {
        toggleTextLeft.textContent = '';
        toggleTextRight.textContent = 'Frequency';
      }
      
    sortFiles(currentSort);
  });

  // Handle refresh button click
  refreshButton.addEventListener('click', () => {
    fetchAndRenderFiles(true);
  });

  // Filter files based on type
  function filterFiles(type) {
    if (type === 'all') {
      filteredFiles = [...files];
    } else {
      filteredFiles = files.filter(file => {
        const fileType = getFileType(file.mimeType).toLowerCase();
        return fileType === type || (type === 'other' && fileType === 'others');
      });
    }
    renderFiles(filteredFiles);
  }

  // Sort files based on criteria
  function sortFiles(criteria) {
    if (criteria === 'recent') {
      filteredFiles.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
    } else if (criteria === 'frequency') {
      filteredFiles.sort((a, b) => (frequencyData[b.id] || 0) - (frequencyData[a.id] || 0));
    }
    renderFiles(filteredFiles);
  }

  // Increment frequency count
  function incrementFrequency(fileId) {
    frequencyData[fileId] = (frequencyData[fileId] || 0) + 1;
    chrome.storage.local.set({ frequencyData });
  }

  // Determine icon based on MIME type
  function getIconForMimeType(mimeType) {
    if (mimeType.includes('document')) {
      return 'icons/doc-icon-48x48.png';
    } else if (mimeType.includes('spreadsheet')) {
      return 'icons/sheet-icon-48x48.png';
    } else if (mimeType.includes('presentation')) {
      return 'icons/slide-icon-48x48.png';
    } else {
      return 'icons/other-icon-48x48.png';
    }
  }

  // Determine file type
  function getFileType(mimeType) {
    if (mimeType.includes('document')) {
      return 'docs';
    } else if (mimeType.includes('spreadsheet')) {
      return 'sheets';
    } else if (mimeType.includes('presentation')) {
      return 'slides';
    } else {
      return 'other';
    }
  }
});