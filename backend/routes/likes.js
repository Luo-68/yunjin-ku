const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const { createNotification } = require('./notifications');

// 点赞/取消点赞帖子
router.post('/:postId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { postId } = req.params;

    // 检查帖子是否存在
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }

    // 检查是否已点赞
    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      // 取消点赞
      await Like.deleteOne({ _id: existingLike._id });
      post.stats.likeCount = Math.max(0, post.stats.likeCount - 1);
      await post.save();

      res.json({
        success: true,
        message: '取消点赞',
        data: {
          liked: false,
          likeCount: post.stats.likeCount
        }
      });
    } else {
      // 点赞
      const like = new Like({ post: postId, user: userId });
      await like.save();
      post.stats.likeCount += 1;
      await post.save();

      // 创建点赞通知
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: postId
      });

      res.json({
        success: true,
        message: '点赞成功',
        data: {
          liked: true,
          likeCount: post.stats.likeCount
        }
      });
    }

  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({
      success: false,
      error: '操作失败'
    });
  }
});

// 获取帖子点赞列表
router.get('/:postId/likes', async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const likes = await Like.find({ post: postId })
      .populate('user', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Like.countDocuments({ post: postId });

    res.json({
      success: true,
      data: likes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取点赞列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取点赞列表失败'
    });
  }
});

// 检查用户是否点赞了帖子
router.get('/:postId/check', async (req, res) => {
  try {
    const { userId } = req.session;
    const { postId } = req.params;

    if (!userId) {
      return res.json({
        success: true,
        data: {
          liked: false
        }
      });
    }

    const like = await Like.findOne({ post: postId, user: userId });

    res.json({
      success: true,
      data: {
        liked: !!like
      }
    });

  } catch (error) {
    console.error('检查点赞状态失败:', error);
    res.status(500).json({
      success: false,
      error: '检查点赞状态失败'
    });
  }
});

// 获取用户的点赞列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const likes = await Like.find({ user: userId })
      .populate({
        path: 'post',
        match: { isVisible: { $ne: false } }, // 只获取可见的帖子
        populate: {
          path: 'author',
          select: 'username avatar bio isVerified'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 过滤掉 post 为 null 的记录（帖子已被删除）
    const validLikes = likes.filter(like => like.post !== null);

    // 获取总数（只计算有效帖子）
    const allLikes = await Like.find({ user: userId })
      .populate({
        path: 'post',
        match: { isVisible: { $ne: false } },
        select: '_id'
      })
      .lean();
    const total = allLikes.filter(like => like.post !== null).length;

    res.json({
      success: true,
      data: validLikes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取用户点赞列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户点赞列表失败'
    });
  }
});

module.exports = router;