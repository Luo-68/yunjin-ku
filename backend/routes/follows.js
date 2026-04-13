const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');
const { createNotification } = require('./notifications');

// 关注/取消关注用户
router.post('/:followingUserId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { followingUserId } = req.params;

    // 不能关注自己
    if (userId === followingUserId) {
      return res.status(400).json({ success: false, error: '不能关注自己' });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findById(followingUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 检查是否已关注
    const existingFollow = await Follow.findOne({
      follower: userId,
      following: followingUserId
    });

    if (existingFollow) {
      // 取消关注
      await Follow.deleteOne({ _id: existingFollow._id });

      res.json({
        success: true,
        message: '取消关注成功',
        data: {
          following: false
        }
      });
    } else {
      // 关注
      const follow = new Follow({
        follower: userId,
        following: followingUserId
      });
      await follow.save();

      // 创建关注通知
      await createNotification({
        recipient: followingUserId,
        sender: userId,
        type: 'follow'
      });

      res.json({
        success: true,
        message: '关注成功',
        data: {
          following: true
        }
      });
    }

  } catch (error) {
    console.error('关注操作失败:', error);
    res.status(500).json({
      success: false,
      error: '操作失败'
    });
  }
});

// 获取用户的粉丝列表
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ following: userId });

    res.json({
      success: true,
      data: followers.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取粉丝列表失败'
    });
  }
});

// 获取用户的关注列表
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ follower: userId });

    res.json({
      success: true,
      data: following.map(f => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取关注列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取关注列表失败'
    });
  }
});

// 检查是否关注了某个用户
router.get('/:followingUserId/check', async (req, res) => {
  try {
    const { userId } = req.session;
    const { followingUserId } = req.params;

    if (!userId) {
      return res.json({
        success: true,
        data: {
          following: false
        }
      });
    }

    const follow = await Follow.findOne({
      follower: userId,
      following: followingUserId
    });

    res.json({
      success: true,
      data: {
        following: !!follow
      }
    });

  } catch (error) {
    console.error('检查关注状态失败:', error);
    res.status(500).json({
      success: false,
      error: '检查关注状态失败'
    });
  }
});

// 获取用户统计信息（粉丝数、关注数）
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const followerCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    res.json({
      success: true,
      data: {
        followerCount,
        followingCount
      }
    });

  } catch (error) {
    console.error('获取用户统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户统计信息失败'
    });
  }
});

// 批量检查关注状态
router.post('/batch-check', async (req, res) => {
  try {
    const { userId } = req.session;
    const { userIds } = req.body;

    if (!userId) {
      return res.json({
        success: true,
        data: {}
      });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '用户ID列表不能为空'
      });
    }

    const follows = await Follow.find({
      follower: userId,
      following: { $in: userIds }
    });

    const followingMap = {};
    follows.forEach(follow => {
      followingMap[follow.following.toString()] = true;
    });

    res.json({
      success: true,
      data: followingMap
    });

  } catch (error) {
    console.error('批量检查关注状态失败:', error);
    res.status(500).json({
      success: false,
      error: '批量检查关注状态失败'
    });
  }
});

module.exports = router;