const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Group schema
const groupSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    invitedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    memberRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Method to add a message to the group
groupSchema.methods.addMessage = function (messageId) {
    this.messages.push(messageId);
    this.updatedAt = Date.now(); // Update the timestamp
    return this.save();
};

// Method to add a member to the group
groupSchema.methods.addMember = async function (userId) {
    // Check if the user is already a member, invited, or has a membership request
    if (!this.members.includes(userId) && !this.invitedUsers.includes(userId) && !this.memberRequests.includes(userId)) {
        this.members.push(userId);
        this.updatedAt = Date.now();
        // Remove user from invitedUsers if they were invited
        this.invitedUsers.pull(userId);
        // Remove user from memberRequests if they had a pending request
        this.memberRequests.pull(userId);
        await this.save();
    }
};

// Method to remove a member from the group
groupSchema.methods.removeMember = async function (userId) {
    // Check if the user is an admin
    if (this.admins.includes(userId)) {
        // Demote the user from admin before removing them
        this.admins.pull(userId);
    }
    if (this.members.includes(userId)) {
        this.members.pull(userId);
        this.updatedAt = Date.now();
        await this.save();
    }
};

// Method to handle member requests
groupSchema.methods.requestMembership = async function (userId) {
    if (!this.memberRequests.includes(userId) && !this.members.includes(userId)) {
        this.memberRequests.push(userId);
        this.updatedAt = Date.now();
        await this.save();
    }
};

// Method to invite a user to the group
groupSchema.methods.inviteUser = async function (userId) {
    // Ensure the user is not already a member, invited, or has a membership request
    if (!this.members.includes(userId) && !this.invitedUsers.includes(userId) && !this.memberRequests.includes(userId)) {
        this.invitedUsers.push(userId);
        this.updatedAt = Date.now();
        await this.save();
    }
};

// Method to accept a membership request
groupSchema.methods.acceptMembershipRequest = async function (userId) {
    if (this.memberRequests.includes(userId) && !this.members.includes(userId)) {
        this.members.push(userId);
        this.memberRequests.pull(userId);
        this.invitedUsers.pull(userId); // Remove if the user was also invited
        this.updatedAt = Date.now();
        await this.save();
    }
};

// Method to reject a membership request
groupSchema.methods.rejectMembershipRequest = async function (userId) {
    if (this.memberRequests.includes(userId)) {
        this.memberRequests.pull(userId);
        this.updatedAt = Date.now();
        await this.save();
        // Optionally, send a notification to the user (notification logic not shown here)
    }
};

// Method to promote a member to admin
groupSchema.methods.promoteToAdmin = async function (userId) {
    if (this.members.includes(userId) && !this.admins.includes(userId)) {
        this.admins.push(userId);
        this.updatedAt = Date.now();
        await this.save();
    }
};

// Method to demote an admin
groupSchema.methods.demoteAdmin = async function (userId) {
    if (this.admins.includes(userId)) {
        this.admins.pull(userId);
        this.updatedAt = Date.now();
        await this.save();
    }
};

module.exports = mongoose.model('Group', groupSchema);
