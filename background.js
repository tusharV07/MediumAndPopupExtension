let isEnabled = true;

chrome.action.onClicked.addListener((tab) => {
    isEnabled = !isEnabled; // Toggle state for icon change
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
    if (tab.url && tab.url.includes('medium.com') && !tab.url.includes('freedium.cfd')) {
        const newUrl = 'https://freedium.cfd/' + tab.url;
        chrome.tabs.update(tab.id, { url: newUrl });
    } else {
        if (tab.id) {
            chrome.tabs.sendMessage(
                tab.id,
                { action: 'triggerExtension', enabled: true },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn('No content script listening in this tab:', chrome.runtime.lastError.message);
                    }
                }
            );
        }
    }

});
