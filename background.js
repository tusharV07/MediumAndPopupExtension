let isEnabled = true; // Default state

chrome.action.onClicked.addListener((tab) => {
    isEnabled = !isEnabled; // Toggle state
    chrome.action.setIcon({
        path: isEnabled ? {
            "16": "icons/enabled16.png",
            "48": "icons/enabled48.png",
            "128": "icons/enabled128.png"
        } : {
            "16": "icons/disabled16.png",
            "48": "icons/disabled48.png",
            "128": "icons/disabled128.png"
        }
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'toggleExtension', enabled: true },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn('No content script listening in this tab:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Response:', response);
                    }
                }
            );
        }
    });

});
