const User = require('../models/UserModel');
const FriendRequest = require('../models/FriendRequestModel');
const UserFriend = require('../models/UserFriendModel');
const Group = require('../models/GroupModel'); // Ensure the correct path to your Group model

// Helper function to handle errors
const handleError = (err, res) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  try {
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const newRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();
    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (err) {
    handleError(err, res);
  }
};

// Cancel a friend request
exports.cancelFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  try {
    const existingRequest = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: 'Pending'
    });

    if (!existingRequest) {
      return res.status(400).json({ message: 'No pending friend request found' });
    }

    res.status(200).json({ message: 'Friend request canceled successfully' });
  } catch (err) {
    handleError(err, res);
  }
};

// Get incoming friend requests
exports.getIncomingRequests = async (req, res) => {
  const userId = req.user._id;

  try {
    const requests = await FriendRequest.find({ receiver: userId, status: 'Pending' })
      .populate('sender', 'username')
      .lean();
      
    res.json(requests);
  } catch (err) {
    handleError(err, res);
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user._id;

  if (!requestId) {
    return res.status(400).json({ message: 'Request ID is required' });
  }

  try {
    const request = await FriendRequest.findByIdAndUpdate(requestId, { status: 'Accepted' }, { new: true }).lean();

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    await UserFriend.create({ user1: request.sender, user2: userId });

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    handleError(err, res);
  }
};

// Reject a friend request
exports.rejectFriendRequest = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ message: 'Request ID is required' });
  }

  try {
    const request = await FriendRequest.findByIdAndUpdate(requestId, { status: 'Rejected' }, { new: true }).lean();

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (err) {
    handleError(err, res);
  }
};

// Get the list of friends
exports.getFriends = async (req, res) => {
  const userId = req.user._id;

  try {
    const friends = await UserFriend.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).lean();

    const friendIds = friends.map(friend =>
      friend.user1.toString() === userId.toString() ? friend.user2 : friend.user1
    );

    const friendUsers = await User.find({ _id: { $in: friendIds } }).select('username').lean();

    res.json(friendUsers);
  } catch (err) {
    handleError(err, res);
  }
};

// Find the mutual friends count between two users
const findMutualFriendsCount = async (userId1, userId2) => {
  try {
    const [friendsOfUser1, friendsOfUser2] = await Promise.all([
      UserFriend.find({
        $or: [{ user1: userId1 }, { user2: userId1 }]
      }).lean(),
      UserFriend.find({
        $or: [{ user1: userId2 }, { user2: userId2 }]
      }).lean()
    ]);

    const user1FriendsIds = friendsOfUser1.map(friend =>
      friend.user1.toString() === userId1.toString() ? friend.user2.toString() : friend.user1.toString()
    );
    const user2FriendsIds = friendsOfUser2.map(friend =>
      friend.user1.toString() === userId2.toString() ? friend.user2.toString() : friend.user1.toString()
    );

    const mutualFriends = user1FriendsIds.filter(friendId => user2FriendsIds.includes(friendId));

    return mutualFriends.length;
  } catch (error) {
    console.error('Error finding mutual friends:', error);
    return 0; 
  }
};

// Search for users excluding the current user, friends, and users who have sent requests
exports.searchUser = async (req, res) => {
  const { query } = req.query;
  const senderId = req.user._id;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const [friends, incomingRequests, users, sentRequests] = await Promise.all([
      UserFriend.find({ $or: [{ user1: senderId }, { user2: senderId }] }).lean(),
      FriendRequest.find({ receiver: senderId, status: 'Pending' }).select('sender').lean(),
      User.find({
        _id: { $ne: senderId },
        username: { $regex: query, $options: 'i' }
      }).limit(5).lean(),
      FriendRequest.find({ sender: senderId, status: 'Pending' }).select('receiver').lean()
    ]);

    const friendIds = friends.map(friend =>
      friend.user1.toString() === senderId.toString() ? friend.user2.toString() : friend.user1.toString()
    );

    const requestSenderIds = incomingRequests.map(request => request.sender.toString());

    const filteredUsers = users.filter(user =>
      !friendIds.includes(user._id.toString()) && !requestSenderIds.includes(user._id.toString())
    );

    const usersWithStatus = await Promise.all(filteredUsers.map(async user => {
      const mutualFriendsCount = await findMutualFriendsCount(senderId, user._id);
      return {
        ...user,
        requestSent: sentRequests.some(request => request.receiver.toString() === user._id.toString()),
        mutualFriendsCount 
      };
    }));

    res.json(usersWithStatus);
  } catch (err) {
    handleError(err, res);
  }
};

// Search for groups excluding the current user's groups and invited groups
exports.searchGroup = async (req, res) => {
  const { query } = req.query;
  const userId = req.user._id;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // Fetch all groups matching the search query
    const groups = await Group.find({
      name: { $regex: query, $options: 'i' } // Case-insensitive search
    }).lean();

    // Fetch groups the user is invited to
    const invitedGroups = await Group.find({
      invitedUsers: userId
    }).select('_id').lean();

    // Fetch groups the user has sent membership requests to
    const memberRequests = await Group.find({
      memberRequests: userId
    }).select('_id').lean();

    // Fetch groups the user is already a member of
    const joinedGroups = await Group.find({
      members: userId
    }).select('_id').lean();

    // Convert IDs to strings for easier comparison
    const invitedGroupIds = invitedGroups.map(group => group._id.toString());
    const requestedGroupIds = memberRequests.map(group => group._id.toString());
    const joinedGroupIds = joinedGroups.map(group => group._id.toString());

    // Filter out groups that the user is invited to, has requested, or is already a member of
    const filteredGroups = groups.filter(group =>
      !invitedGroupIds.includes(group._id.toString()) &&
      !requestedGroupIds.includes(group._id.toString()) &&
      !joinedGroupIds.includes(group._id.toString())
    );

    // Map the filtered groups to include the request status
    const groupsWithStatus = filteredGroups.map(group => ({
      ...group,
      requestSent: requestedGroupIds.includes(group._id.toString()) // Check if a request was sent for this group
    }));

    // Return the filtered groups with request status
    res.json(groupsWithStatus);
  } catch (err) {
    handleError(err, res);
  }
};