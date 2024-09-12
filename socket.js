const Message = require('./models/MessageModel');
const User = require('./models/UserModel'); // Make sure to import the User model

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
            try {
                // Fetch the sender's username from the database
                const sender = await User.findById(senderId).select('username');

                if (!sender) throw new Error('Sender not found');

                // Save the message to the database
                const newMessage = new Message({
                    text,
                    sender: senderId,
                    receiver: receiverId
                });
                await newMessage.save();

                // Emit the new message to both the sender and receiver
                io.to(receiverId).to(senderId).emit('messageReceived', {
                    text: newMessage.text,
                    sender: { username: sender.username }, // Send the actual username
                    receiver: receiverId
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
