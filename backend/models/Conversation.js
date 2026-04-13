const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // 参与者（两个用户）
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // 最后一条消息（用于显示在列表中）
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // 最后一条消息时间
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // 未读消息数（按用户存储）
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// 确保只有两个参与者
conversationSchema.pre('save', async function() {
  if (this.participants && this.participants.length !== 2) {
    throw new Error('会话必须有两个参与者');
  }
});

// 索引
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
