document.addEventListener('DOMContentLoaded', () => {
    getConnectionStatus().then(connectionStatus => {
        if (connectionStatus === true) {
            updateButton("Leave Session", "leave");
        } else {
            updateButton("Join Session", "join");
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

function updateButton(htmlValue, messageString) {
    const button = document.querySelector('.mainButton');
    button.innerHTML = htmlValue;
    button.addEventListener('click', () => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0]['id'], messageString);
            window.close();
        })
    })
}
