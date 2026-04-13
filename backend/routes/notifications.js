const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
// 确保 User 和 Post 模型被注册
require('../models/User');
require('../models/Post');

// 获取通知列表
router.get('/', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const { type, unreadOnly } = req.query;
    const query = { recipient: userId };
    
    if (type) {
      query.type = type;
    }
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username avatar')
      .populate('post', 'mediaUrls title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('获取通知失败:', error);
    res.status(500).json({ success: false, message: '获取通知失败' });
  }
});

// 获取未读通知数量
router.get('/unread-count', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('获取未读数量失败:', error);
    res.status(500).json({ success: false, message: '获取未读数量失败' });
  }
});

// 标记通知为已读
router.put('/:id/read', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ success: false, message: '标记已读失败' });
  }
});

// 标记所有通知为已读
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: '全部标记已读' });
  } catch (error) {
    console.error('标记全部已读失败:', error);
    res.status(500).json({ success: false, message: '标记全部已读失败' });
  }
});

// 创建通知（内部使用）
const createNotification = async (data) => {
  try {
    // 不给自己发通知
    if (data.recipient.toString() === data.sender.toString()) {
      return null;
    }

    // 检查是否已存在相同通知（避免重复）
    const existing = await Notification.findOne({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      post: data.post || null
    });

    if (existing) {
      // 更新时间
      existing.createdAt = new Date();
      existing.isRead = false;
      await existing.save();
      return existing;
    }

    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('创建通知失败:', error);
    return null;
  }
};

module.exports = router;
module.exports.createNotification = createNotification;
