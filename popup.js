// popup.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logChatButton').addEventListener('click', () => {
        const optionalInput = document.getElementById('optionalInput').value;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: sendChatToOpenAI,
                args: [optionalInput]
            });
        });
    });
});



function sendChatToOpenAI(optionalInput) {

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
    const chats = Array.from(document.querySelectorAll('.msg-s-event-listitem__body'));
    const names = Array.from(document.querySelectorAll('.msg-s-message-group__name'));

    let prompt = "Please write a response from Fabian Gmeindl in the same language, tone and voice as these messages\n";
    chats.forEach((chat, index) => {
        const name = names[index] ? names[index].innerText.trim() : 'Unknown';
        prompt += `${name}: ${chat.innerText.trim()}\n`;
    });

    if (optionalInput) {
        prompt += "\nThe user had this additional input:\n" + optionalInput;
    }
    console.log('Prompt:', prompt);

    // Now send this data to OpenAI's API
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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` // Replace with your actual API key
        },
        body: JSON.stringify({
            model: "gpt-4-1106-preview",
            messages: [{role: "system", content: prompt}]
        })
    })
    .then(response => response.json())
    .then(data => {
        const responseMessage = data.choices[0].message.content.trim();
        typeMessage(responseMessage, () => {
            console.log('OpenAI response typed into chat.');
        });
    })
    .catch(error => {
        console.error('Error contacting OpenAI API:', error);
    });
}

// Ensure the typeMessage function is defined as before
