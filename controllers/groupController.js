const Group = require('../models/GroupModel');
const User = require('../models/UserModel');
const Category = require('../models/CategoryModel');
const mongoose = require('mongoose');

// Show groups page with the list of joined groups and categories
exports.showGroupsPage = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all groups the user is a member of
        const groups = await Group.find({ members: userId })
            .populate('members', 'username')
            .populate('admins', 'username');

        // Fetch all categories to show in the "Create Group" form
        const categories = await Category.find();

        // Render the groups page and pass the groups and categories to the view
        res.render('groupspage', {
            title: 'Groups',
            groups: groups,
            categories: categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error showing groups page:', error);
        res.status(500).send('Server Error');
    }
};

// Create a new group
exports.createGroup = async (req, res) => {
    try {
        const { name, description, category, invitedUsers = '' } = req.body;
        const creatorId = req.user._id;

        // Ensure group name and category are provided
        if (!name || !category) {
            return res.status(400).json({ msg: 'Group name and category are required' });
        }

        // Check if a group with the same name already exists
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ msg: 'A group with this name already exists' });
        }

        // Find category by name and get the ObjectId
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ msg: 'Invalid category' });
        }

        // Ensure invitedUsers is treated as a string
        const invitedUsersString = typeof invitedUsers === 'string' ? invitedUsers : '';
        const invitedUsernames = invitedUsersString.split(',').map(user => user.trim()).filter(username => username);

        // Find users by their usernames
        const usersByUsername = await User.find({ username: { $in: invitedUsernames } });

        const validInvitedUsers = usersByUsername.map(user => user._id);
        const invalidUsernames = invitedUsernames.filter(username => !usersByUsername.some(user => user.username === username));

        // Create the new group
        const newGroup = new Group({
            name,
            description,
            category: categoryDoc._id,
            members: [creatorId],
            admins: [creatorId],
            invitedUsers: validInvitedUsers,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        await newGroup.save();

        // Respond with success message and any invalid usernames
        res.status(201).json({
            msg: 'Group created successfully',
            group: newGroup,
            invalidUsers: invalidUsernames
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Controller function to delete a group
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check if the user is an admin
        if (!group.admins.includes(userId)) {
            return res.status(403).json({ msg: 'You are not authorized to delete this group' });
        }

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ msg: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Fetch incoming invites for the user
exports.incomingInvites = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find groups where the user is invited
        const groups = await Group.find({ invitedUsers: userId })
            .populate('members', 'username')
            .populate('admins', 'username');

        res.json(groups);
    } catch (error) {
        console.error('Error fetching incoming invites:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};
