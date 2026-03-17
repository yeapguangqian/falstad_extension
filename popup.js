// popup.js

// EXPORT LOGIC
document.getElementById('exportBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Ask content.js for the data
  const response = await chrome.tabs.sendMessage(tab.id, { action: "EXPORT_DATA" });
  
  // Create the download link (your original logic)
  const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "falstad_backup.json";
  a.click();
});

// IMPORT LOGIC
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    const data = JSON.parse(reader.result);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send data to content.js to save in localStorage
    await chrome.tabs.sendMessage(tab.id, { action: "IMPORT_DATA", payload: data });
    
    // Refresh the tab to apply changes
    chrome.tabs.reload(tab.id);
  };
  reader.readAsText(file);
});

document.getElementById('resetBtn').addEventListener('click', async () => {
  // Confirm with the user first
  const confirmed = confirm("This will clear ALL Falstad settings and subcircuits. Are you sure?");
  
  if (confirmed) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send reset command
    await chrome.tabs.sendMessage(tab.id, { action: "RESET_DATA" });
    
    // Reload the page to show clean state
    chrome.tabs.reload(tab.id);
    window.close(); // Close the popup
  }
});