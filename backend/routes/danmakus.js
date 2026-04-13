const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Danmaku = require('../models/Danmaku');
const Post = require('../models/Post');

// 发送弹幕
router.post('/:postId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { postId } = req.params;
    const { content, time, color, position, type, fontSize } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: '弹幕内容不能为空' });
    }

    if (time === undefined || time === null || time < 0) {
      return res.status(400).json({ success: false, error: '视频时间不能为空' });
    }

    // 检查是否是演示帖子（以 demo 开头）
    const isDemoPost = postId.startsWith('demo');
    
    if (!isDemoPost) {
      // 真实帖子需要验证存在性
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: '帖子不存在' });
      }

      // 检查是否是视频类型
      if (post.mediaType !== 'video') {
        return res.status(400).json({ success: false, error: '只有视频内容才能发送弹幕' });
      }
    }

    // 创建弹幕
    const danmaku = new Danmaku({
      post: postId,
      user: userId,
      content: content.trim(),
      time: parseFloat(time),
      color: color || '#FFFFFF',
      position: position || 'middle',
      type: type || 'scroll',
      fontSize: fontSize || 25
    });

    await danmaku.save();

    // 填充用户信息
    const populatedDanmaku = await Danmaku.findById(danmaku._id)
      .populate('user', 'username avatar')
      .lean();

    res.status(201).json({
      success: true,
      message: '弹幕发送成功',
      data: populatedDanmaku
    });

  } catch (error) {
    console.error('发送弹幕失败:', error);
    res.status(500).json({
      success: false,
      error: '发送弹幕失败'
    });
  }
});

// 获取帖子的弹幕列表
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // 检查是否是演示帖子
    const isDemoPost = postId.startsWith('demo');
    
    if (!isDemoPost) {
      // 真实帖子需要验证存在性
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: '帖子不存在' });
      }
    }

    const danmakus = await Danmaku.find({ post: postId })
      .populate('user', 'username avatar')
      .sort({ time: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: danmakus
    });

  } catch (error) {
    console.error('获取弹幕列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取弹幕列表失败'
    });
  }
});

// 删除弹幕
router.delete('/:danmakuId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { danmakuId } = req.params;

    const danmaku = await Danmaku.findById(danmakuId);

    if (!danmaku) {
      return res.status(404).json({ success: false, error: '弹幕不存在' });
    }

    // 检查是否是弹幕发送者
    if (danmaku.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权删除此弹幕'
      });
    }

    await Danmaku.deleteOne({ _id: danmakuId });

    res.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除弹幕失败:', error);
    res.status(500).json({
      success: false,
      error: '删除弹幕失败'
    });
  }
});

// 获取用户的弹幕列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const danmakus = await Danmaku.find({ user: userId })
      .populate('user', 'username avatar')
      .populate('post', 'author mediaType mediaUrls description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Danmaku.countDocuments({ user: userId });

    res.json({
      success: true,
      data: danmakus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取用户弹幕列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户弹幕列表失败'
    });
  }
});

// 获取帖子弹幕统计
router.get('/:postId/stats', async (req, res) => {
  try {
    const { postId } = req.params;

    // 演示帖子直接统计
    const stats = await Danmaku.aggregate([
      { $match: { post: postId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          total: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || { total: 0, uniqueUserCount: 0 }
    });

  } catch (error) {
    console.error('获取弹幕统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取弹幕统计失败'
    });
  }
});

module.exports = router;