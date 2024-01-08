document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logChatButton').addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: logChat
            });
        });
    });
});

function logChat() {
    const chatInputSelector = '.msg-form__contenteditable';
    const chatInput = document.querySelector(chatInputSelector);

    function simulateClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            const event = new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(event);
        });
    
        // Dispatch a focus event
        element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    }

    function typeMessage(message, callback) {
        const chatInputSelector = '.msg-form__contenteditable';
        const chatInput = document.querySelector(chatInputSelector);
        
        if (!chatInput) {
            console.error('Chat input field not found');
            return;
        }
    
        // Focus the input field before typing
        chatInput.focus();
        simulateClick(chatInput);
    
        let i = 0;
        function typeChar() {
            if (i < message.length) {
                // Wrap message in <p> tags to mimic the manual typing structure
                chatInput.innerHTML = `<p>${message.slice(0, i + 1)}</p>`;
                const evt = new InputEvent('input', { bubbles: true });
                chatInput.dispatchEvent(evt);
                i++;
                // Randomize the delay to mimic human typing
                const randomDelay = 100 + Math.random() * 100; // Between 100 and 200 milliseconds
                setTimeout(typeChar, randomDelay);
            } else {
                if (callback) callback();
            }
        }
        typeChar();
    }

    function clickToFocus(selector, callback) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error('Element to click not found');
            return;
        }
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        element.focus();
        if (callback) callback();
    }

    function processChats(chats, names, index = 0) {
        if (index < chats.length) {
            var name = names[index] ? names[index].innerText.trim() : 'Unknown';
            var fullMessage = `${name}: ${chats[index].innerText.trim()}`;
            clickToFocus(chatInputSelector, () => {
                typeMessage(fullMessage, () => {
                    // Delay before starting next message to prevent overlap
                    setTimeout(() => {
                        processChats(chats, names, index + 1);
                    }, 500);
                });
            });
        }
    }

    var chats = document.querySelectorAll('.msg-s-event-listitem__body');
    var names = document.querySelectorAll('.msg-s-message-group__name');
    processChats(chats, names);
}
