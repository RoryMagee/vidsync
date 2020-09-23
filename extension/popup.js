chrome.storage.local.set({websocketConnected: true});
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.mainButton');
    getConnectionStatus().then(connectionStatus => {
        if (connectionStatus === true) {
            button.innerHTML = "Leave Session";
            button.addEventListener('click', () => {
                chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0]['id'], 'close');
                    window.close();
                });
            });
        } else {
            button.innerHTML = "Join Session";
            button.addEventListener('click', () => {
                chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0]['id'], 'join');
                    window.close();
                });
            });
        }
    });
}, false);


function getConnectionStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get('websocketConnected', (res) => {
            resolve(res['websocketConnected']);
        });
    });
}
