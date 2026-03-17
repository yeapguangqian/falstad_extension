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

// popup.js

// --- 1. THE HIERARCHY BUILDER ---
function buildTree(library) {
    const tree = {};
    Object.keys(library).forEach(path => {
        const parts = path.split('/');
        let current = tree;
        parts.forEach((part, i) => {
            if (i === parts.length - 1) {
                current[part] = { _data: library[path], _path: path };
            } else {
                current[part] = current[part] || {};
                current = current[part];
            }
        });
    });
    return tree;
}

// --- 2. THE UI RENDERER ---
async function refreshUI() {
    const { library = {} } = await chrome.storage.local.get("library");
    const container = document.getElementById('treeContainer');
    container.innerHTML = "";
    
    const tree = buildTree(library);
    renderNode(tree, container);
}

function renderNode(node, container) {
    const ul = document.createElement('ul');
    for (const key in node) {
        const li = document.createElement('li');
        
        if (node[key]._data) { // It's a circuit/subcircuit (Leaf)
            li.className = "circuit";
            li.innerHTML = "📄 " + key;
            
            // THE LOAD ACTION
            li.onclick = () => {
                const subName = key; // The name of the subcircuit
                const subData = node[key]._data; // The v3 dump string
                activateSubcircuit(subName, subData);
            };
        } else { // It's a folder
            li.className = "folder";
            li.innerHTML = "📁 " + key;
            const subUl = document.createElement('div');
            renderNode(node[key], subUl);
            li.appendChild(subUl);
        }
        ul.appendChild(li);
    }
    container.appendChild(ul);
}

// --- 3. ACTIONS ---
async function activateSubcircuit(name, data) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { 
        action: "LOAD_AND_ACTIVATE", 
        name: name, 
        data: data 
    });
}

document.getElementById('saveBtn').onclick = async () => {
    const path = document.getElementById('pathInput').value; // e.g., "Logic/Gates/XOR"
    const subcircuitName = path.split('/').pop(); // "XOR"

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_ALL_DATA" });
    
    // Find the subcircuit in localStorage
    const subData = response.data[`subcircuit:${subcircuitName}`];
    
    if (!subData) {
        alert(`Error: No subcircuit named "${subcircuitName}" found in Falstad. Save it in Falstad first!`);
        return;
    }

    const { library = {} } = await chrome.storage.local.get("library");
    library[path] = subData;
    await chrome.storage.local.set({ library });
    refreshUI();
};

refreshUI();