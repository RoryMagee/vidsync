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
    console.log('getting connection');
    return new Promise((resolve) => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0]['id'], 'checkConnection', (response) => {
                console.log('response received', response);
                resolve(response);
            });
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
        });
    });
}
