const mongoose = require('mongoose');
const { Schema } = mongoose;

// GroupMessage Schema: Handles messages exchanged in a group
const groupMessageSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },  
    sender : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


groupMessageSchema.methods.addMessage = function (groupId, sender, text) {
    this.groupId = groupId;
    this.sender = sender;
    this.text = text;
    return this.save();
};

module.exports = mongoose.model('GroupMessage', groupMessageSchema);