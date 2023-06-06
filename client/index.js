const url = 'ws://localhost:3000/ws';
const socket = new WebSocket(url);
const form = document.forms.chatForm;
const messagesContainer = document.querySelector('#messages');

socket.onmessage = ({ data: message }) => showMessage(message);

socket.onclose = event => console.log(`Закрытие сокета с кодом ${event.code}`);

form.addEventListener('submit', function (event) {
    const message = this.messageTextarea.value;

    event.preventDefault();
    socket.send(message);
    return false;
});

function showMessage(message) {
    const messageElement = document.createElement('div');

    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
}