const mongoose = require('mongoose');
const { Schema } = mongoose;

const userFriendSchema = new Schema({
  user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Accepted'], default: 'Accepted' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure that the friendship is unique for a pair of users
userFriendSchema.index({ user1: 1, user2: 1 }, { unique: true });

const UserFriend = mongoose.model('UserFriend', userFriendSchema);
module.exports = UserFriend;
