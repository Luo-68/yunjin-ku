const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // 作者
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 内容描述
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  // 媒体类型（image/video）
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  // 媒体URL（支持多个图片，视频仅支持一个）
  mediaUrls: [{
    type: String,
    required: true
  }],
  // 视频封面（仅视频类型需要）
  coverUrl: {
    type: String
  },
  // 音乐信息
  music: {
    name: String,
    artist: String,
    url: String
  },
  // 标签
  tags: [{
    type: String,
    trim: true
  }],
  // 话题
  topics: [{
    type: String,
    trim: true
  }],
  // 位置信息
  location: {
    type: String
  },
  // 是否可见
  isVisible: {
    type: Boolean,
    default: true
  },
  // 统计数据
  stats: {
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    collectionCount: {
      type: Number,
      default: 0
    }
  },
  // 审核状态
  auditStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// 索引
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ topics: 1 });

module.exports = mongoose.model('Post', postSchema);