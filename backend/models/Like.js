const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  // 帖子ID
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // 点赞者
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 复合索引（防止重复点赞）
likeSchema.index({ post: 1, user: 1 }, { unique: true });
likeSchema.index({ user: 1, createdAt: -1 });
likeSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Like', likeSchema);