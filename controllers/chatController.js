const UserFriend = require('../models/UserFriendModel');
const Group = require('../models/GroupModel'); // Assuming you have the Group model set up
const Message = require('../models/MessageModel');
const User = require('../models/UserModel');
const Category = require('../models/CategoryModel');

exports.showChatPage = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch all friends for the user
        const friends = await UserFriend.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ],
            status: 'Accepted'
        }).populate('user1 user2');

        const friendList = friends.map(friend => {
            const friendData = friend.user1._id.toString() === userId ? friend.user2 : friend.user1;
            return friendData;
        });

        res.render('chatpage', {
            title: 'Chat',
            friends: friendList,
            user: req.user
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;

        // Fetch messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: user1Id, receiver: user2Id },
                { sender: user2Id, receiver: user1Id }
            ]
        }).populate('sender', 'username').populate('receiver', 'username');

        res.json(messages);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ msg: 'Message text is required' });
        }

        const newMessage = new Message({
            text,
            sender: user1Id,
            receiver: user2Id
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

