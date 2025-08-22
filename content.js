(function () {
    const selectors = [
        '.popup:not([role="dialog"])', '.overlay:not([role="navigation"])',
        '.modal:not([data-keep])', '.backdrop', '.lightbox',
        '[class*="subscribe"]', '[class*="paywall"]', '[class*="modal"]', '[class*="overlay"]',
        '[id*="overlay"]', '[id*="modal"]', '[id*="paywall"]',
        'div[style*="position:fixed"][style*="z-index"]:not([data-keep])'
    ];

    const scrollLockClasses = [
        'no-scroll', 'locked', 'overflow-hidden', 'modal-open'
    ];
    // needed at start, because once a page fully loads, browser will not allow redirection, so this detects medium.com at start
    // and redirect it before it fully loads.
    // commented out as I want redirection when on click of the extension/use of extension shortcut, so wrote different logic in background.js
    // if (window.location.href.includes('medium.com') && !window.location.href.includes('freedium.cfd')) {
    //     console.log('Detected Medium URL, redirecting...');
    //     let newUrl = 'https://freedium.cfd/' + window.location.href;
    //     console.log('Redirecting to:', newUrl);
    //     try {
    //         window.location.replace(newUrl);
    //     } catch (err) {
    //         console.error('Navigation failed:', err);
    //     }
    //     return; // Stop further execution of the script
    // }

    function cleanupPage() {
        console.log('Cleaning up page...');
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => { if (!el.closest('#devtools')) el.remove() });
        });

        document.querySelectorAll('div').forEach(el => {
            // Check for "popup" in the class name
            if (el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('popup')) {
                el.remove();
                console.log('removing element with "popup" class');
                return; // Element is removed, no need to check for ad blocker text
            }

            //may cause issues, if the root parent of ad blocker popup is not a child of BODY tag 
            //and is a child of some other div containing other important child divs.
            if (el.textContent.toLowerCase().includes('ad blocker') && el.textContent.trim().split(/\s+/).length <= 25) {
                let rootParent = el;
                while (rootParent.parentElement && rootParent.parentElement.tagName !== 'BODY') {
                    rootParent = rootParent.parentElement;
                }
                console.log('Removing root parent:', rootParent);
                rootParent.remove();
            }
        });
        

        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.classList.remove(...scrollLockClasses);
        document.documentElement.classList.remove(...scrollLockClasses);
        document.body.style.position = 'static';
        document.documentElement.style.position = 'static';
        document.body.style.height = 'auto';
        document.documentElement.style.height = 'auto';

    }

    let runCount = 0;
    let timeoutId = null;
    // MutationObserver callback
    const observerCallback = () => {
        clearTimeout(timeoutId);
        if (runCount < 2) {
            timeoutId = setTimeout(() => {
                cleanupPage();
                runCount++;
                console.log(`Observer run count: ${runCount}`);
                if (runCount >= 2) {
                    console.log('Observer has run 2 times. Disconnecting...');
                    observer.disconnect();
                }
            }, 1500);
        } else {
            observer.disconnect();
        }
    };

    // Initialize the MutationObserver
    const observer = new MutationObserver(observerCallback);


    //commented out so that this only works with the click of the extension/use of extension shortcut
    // window.addEventListener('load', () => {
    //     setTimeout(() => {
    //         cleanupPage();
    //         observer.observe(document.body, {
    //             childList: true,
    //             subtree: true,
    //             attributes: true,
    //             attributeFilter: ['class', 'style']
    //         });
    //     }, 2000); // Delay of 2 seconds
    // });


    // Listen for trigger messages from background.js
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'triggerExtension') {
            if (message.enabled) {
                cleanupPage();
                if (runCount < 2) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['class', 'style']
                    });
                }
            } else {
                console.log('dummy as this won\' be called');
            }
        }
    });

})();
