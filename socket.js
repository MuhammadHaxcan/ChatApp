const Message = require('./models/MessageModel');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Listen for event where a user joins their own room
        socket.on('joinRoom', (userId) => {
            socket.join(userId); // Join a room with the user's ID
            console.log(`User ${userId} joined room: ${userId}`);
        });

        // Listen for incoming messages
        socket.on('sendMessage', async ({ text, senderId, receiverId }) => {
            const newMessage = new Message({
                text,
                sender: senderId,
                receiver: receiverId
            });

            await newMessage.save();

            // Emit the new message to both the sender and receiver
            io.to(receiverId).to(senderId).emit('messageReceived', {
                text: newMessage.text,
                sender: { username: senderId }, // Assuming senderId is the username; adjust as needed
                receiver: receiverId
            });
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
