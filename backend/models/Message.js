const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // 所属会话
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  // 发送者
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 接收者
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 消息内容
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  // 消息类型
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  // 媒体文件（图片/视频）
  media: {
    type: String
  },
  // 已读状态
  isRead: {
    type: Boolean,
    default: false
  },
  // 读取时间
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
