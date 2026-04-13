const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // 帖子ID
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // 评论者
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 评论内容
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  // 父评论ID（用于回复）
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // 被回复的用户
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // 点赞数
  likeCount: {
    type: Number,
    default: 0
  },
  // 是否删除
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);