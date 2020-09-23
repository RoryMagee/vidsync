chrome.storage.local.set({websocketConnected: true});
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.mainButton');
    getConnectionStatus().then(connectionStatus => {
        if (connectionStatus === true) {
            updateButton(button, "Leave Session", "close");
        } else {
            updateButton(button, "Join Session", "join");
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

function updateButton(button, htmlValue, messageString) {
    button.innerHTML = htmlValue;
    button.addEventListener('click', () => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0]['id'], messageString);
            window.close();
        })
    })
}
