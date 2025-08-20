(function () {
    const selectors = [
        '.popup:not([role="dialog"])', '.overlay:not([role="navigation"])',
        '.modal:not([data-keep])', '.backdrop', '.lightbox',
        '[class*="subscribe"]', '[class*="paywall"]',
        '[id*="overlay"]', '[id*="modal"]', '[id*="paywall"]',
        'div[style*="position:fixed"][style*="z-index"]:not([data-keep])'
    ];

    const scrollLockClasses = [
        'no-scroll', 'locked', 'overflow-hidden', 'modal-open'
    ];

    if (window.location.href.includes('medium.com') && !window.location.href.includes('freedium.cfd')) {
        console.log('Detected Medium URL, redirecting...');
        let newUrl = 'https://freedium.cfd/' + window.location.href;
        console.log('Redirecting to:', newUrl);
        try {
            window.location.replace(newUrl);
        } catch (err) {
            console.error('Navigation failed:', err);
        }
        return; // Stop further execution of the script
    }

    function cleanupPage() {
        console.log('Cleaning up page...');
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        document.querySelectorAll('[class]').forEach(el => {
            console.log('Checking class:', el.className);
            const className = el.className;
            if (typeof className === 'string' && className.toLowerCase().includes('popup')) {
                el.remove();
                console.log('removing elements')
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


    //commented out so that this only works with the toggle
    // window.addEventListener('load', () => {
    //     setTimeout(() => {
    //         cleanupPage();
    //         observer.observe(document.documentElement, {
    //             childList: true,
    //             subtree: true,
    //             attributes: true,
    //             attributeFilter: ['class', 'style']
    //         });
    //     }, 2000); // Delay of 2 seconds
    // });


    // Listen for toggle messages from background.js
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'toggleExtension') {
            if (message.enabled) {
                cleanupPage();
                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            } else {
                observer.disconnect();
            }
        }
    });

    // Observe for new elements or style changes
    const observer = new MutationObserver(() => cleanupPage());
})();
