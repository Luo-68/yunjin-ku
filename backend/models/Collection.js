const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  // 帖子ID
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // 收藏者
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 收藏夹名称
  folderName: {
    type: String,
    default: '默认收藏夹'
  }
}, {
  timestamps: true
});

// 复合索引（防止重复收藏）
collectionSchema.index({ post: 1, user: 1 }, { unique: true });
collectionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Collection', collectionSchema);