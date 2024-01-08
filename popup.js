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
        element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    }

function typeMessage(message, callback) {
    const chatInputSelector = '.msg-form__contenteditable';
    const chatInput = document.querySelector(chatInputSelector);

    if (!chatInput) {
        console.error('Chat input field not found');
        return;
    }

    chatInput.focus();
    simulateClick(chatInput);

    let i = 0;
    const typingSpeed = 100;
    function typeChar() {
        if (i < message.length) {
            const char = message[i];
            // Mimic the key events that normally occur when typing
            ['keydown', 'keypress', 'keyup'].forEach(eventType => {
                const keyEvent = new KeyboardEvent(eventType, {
                    key: char,
                    code: char.charCodeAt(0),
                    bubbles: true,
                    cancelable: true
                });
                chatInput.dispatchEvent(keyEvent);
            });
            
            chatInput.innerHTML = `<p>${message.slice(0, i + 1)}</p>`; // Insert the character
            chatInput.dispatchEvent(new InputEvent('input', { bubbles: true })); // Trigger the input event
            
            i++;
            setTimeout(typeChar, typingSpeed);
        } else {
            chatInput.dispatchEvent(new Event('change', { bubbles: true })); // Trigger change event at the end
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
