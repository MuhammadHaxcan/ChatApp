document.addEventListener('DOMContentLoaded', function () {
    const chatMessagesDiv = document.querySelector('.chat-messages');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    let activeFriendId = null; // To track the currently selected friend

    function generateChatUrl(endpoint, friendId) {
        return `/chat/${endpoint}/${userId}/${friendId}`;
    }

    async function loadMessages(friendId) {
        try {
            const chatUrl = generateChatUrl('getmessages', friendId);
            console.log('Loading messages from:', chatUrl);
            const response = await fetch(chatUrl);

            if (!response.ok) throw new Error('Failed to fetch messages.');

            const messages = await response.json();

            chatMessagesDiv.innerHTML = '';
            messages.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', 'mb-2');
                messageElement.innerHTML = `<strong>${msg.sender.username}:</strong> ${msg.text}`;
                chatMessagesDiv.appendChild(messageElement);
            });

            activeFriendId = friendId; // Set the active friend ID
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    chatForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text || !activeFriendId) return;

        const chatUrl = generateChatUrl('sendmessages', activeFriendId);
        console.log('Sending message to:', chatUrl);

        try {
            const response = await fetch(chatUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                messageInput.value = '';
                console.log('Message sent successfully.');
                loadMessages(activeFriendId);
            } else {
                throw new Error('Failed to send message.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    document.querySelectorAll('.friend-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.friend-item').forEach(friend => friend.classList.remove('active'));
            this.classList.add('active');
            const friendId = this.getAttribute('data-friend-id');
            console.log('Friend item clicked. Friend ID:', friendId);
            loadMessages(friendId);
        });
    });
});
