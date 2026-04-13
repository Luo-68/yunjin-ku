const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Follow = require('../models/Follow');
const User = require('../models/User');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/messages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'message-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 检查两个用户是否互相关注
async function checkMutualFollow(userId1, userId2) {
  const follow1 = await Follow.findOne({ follower: userId1, following: userId2 });
  const follow2 = await Follow.findOne({ follower: userId2, following: userId1 });
  return !!(follow1 && follow2);
}

// 获取或创建会话
async function getOrCreateConversation(userId1, userId2) {
  // 查找现有会话
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2], $size: 2 }
  });

  if (!conversation) {
    // 创建新会话
    conversation = new Conversation({
      participants: [userId1, userId2],
      unreadCount: {}
    });
    await conversation.save();
  }

  return conversation;
}

// 检查是否可以发送私信（互相关注）
router.get('/can-message/:userId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const targetUserId = req.params.userId;

    // 不能给自己发私信
    if (userId === targetUserId) {
      return res.json({
        success: true,
        data: { canMessage: false, reason: '不能给自己发私信' }
      });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.json({
        success: true,
        data: { canMessage: false, reason: '用户不存在' }
      });
    }

    // 检查是否互相关注
    const mutualFollow = await checkMutualFollow(userId, targetUserId);

    res.json({
      success: true,
      data: {
        canMessage: mutualFollow,
        reason: mutualFollow ? '' : '需要互相关注才能发送私信'
      }
    });

  } catch (error) {
    console.error('检查私信权限失败:', error);
    res.status(500).json({ success: false, error: '检查失败' });
  }
});

// 发送私信
router.post('/send', async (req, res) => {
  try {
    const { userId } = req.session;
    console.log('[私信发送] session:', req.session);
    console.log('[私信发送] userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { recipientId, content, type = 'text', media } = req.body;
    console.log('[私信发送] recipientId:', recipientId, 'content:', content);

    if (!recipientId) {
      return res.status(400).json({ success: false, error: '缺少接收者' });
    }

    if (!content && !media) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }

    // 检查是否互相关注
    const mutualFollow = await checkMutualFollow(userId, recipientId);
    console.log('[私信发送] mutualFollow:', mutualFollow);
    
    if (!mutualFollow) {
      return res.status(403).json({ success: false, error: '需要互相关注才能发送私信' });
    }

    // 获取或创建会话
    const conversation = await getOrCreateConversation(userId, recipientId);
    console.log('[私信发送] conversation:', conversation._id);

    // 创建消息
    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      recipient: recipientId,
      content: content || '',
      type,
      media
    });
    await message.save();

    // 更新会话
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    // 增加接收者的未读数
    const currentUnread = conversation.unreadCount.get(recipientId) || 0;
    conversation.unreadCount.set(recipientId, currentUnread + 1);
    await conversation.save();

    // 填充发送者信息
    await message.populate('sender', 'username avatar');

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('发送私信失败:', error);
    res.status(500).json({ success: false, error: error.message || '发送失败' });
  }
});

// 发送图片/视频私信
router.post('/send-media', upload.single('media'), async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { recipientId, content = '' } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, error: '缺少接收者' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择文件' });
    }

    // 检查是否互相关注
    const mutualFollow = await checkMutualFollow(userId, recipientId);
    if (!mutualFollow) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, error: '需要互相关注才能发送私信' });
    }

    // 判断文件类型
    const isVideo = /^video\/|^application\/octet-stream$/.test(req.file.mimetype) ||
                    /\.(mp4|mov|avi)$/i.test(req.file.originalname);
    const messageType = isVideo ? 'video' : 'image';

    // 获取或创建会话
    const conversation = await getOrCreateConversation(userId, recipientId);

    // 创建消息
    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      recipient: recipientId,
      content,
      type: messageType,
      media: `/uploads/messages/${req.file.filename}`
    });
    await message.save();

    // 更新会话
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    const currentUnread = conversation.unreadCount.get(recipientId) || 0;
    conversation.unreadCount.set(recipientId, currentUnread + 1);
    await conversation.save();

    await message.populate('sender', 'username avatar');

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('发送媒体私信失败:', error);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ success: false, error: '发送失败' });
  }
});

// 获取会话列表
router.get('/conversations', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 查找用户参与的所有会话
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username avatar bio isVerified')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 处理会话数据，获取对方用户信息和未读数
    const result = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      // lean() 后 Map 变成普通对象，需要用对象方式获取
      const unreadCount = conv.unreadCount instanceof Map 
        ? (conv.unreadCount.get(userId) || 0)
        : (conv.unreadCount?.[userId] || 0);
      return {
        _id: conv._id,
        user: otherUser,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount
      };
    });

    const total = await Conversation.countDocuments({ participants: userId });

    res.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 获取与某用户的消息记录
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // 查找会话
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 }
    });

    if (!conversation) {
      return res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    // 获取消息
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ conversation: conversation._id });

    res.json({
      success: true,
      data: messages.reverse(), // 反转顺序，让最新消息在底部
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('获取消息记录失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 标记消息已读
router.put('/read/:userId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const otherUserId = req.params.userId;

    // 查找会话
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 }
    });

    if (conversation) {
      // 标记所有来自对方的消息为已读
      await Message.updateMany(
        {
          conversation: conversation._id,
          sender: otherUserId,
          isRead: false
        },
        { isRead: true, readAt: new Date() }
      );

      // 重置未读数
      conversation.unreadCount.set(userId, 0);
      await conversation.save();
    }

    res.json({ success: true });

  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ success: false, error: '操作失败' });
  }
});

// 获取未读消息总数
router.get('/unread-count', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    // 聚合所有会话的未读数
    const conversations = await Conversation.find({ participants: userId });
    let totalUnread = 0;

    conversations.forEach(conv => {
      totalUnread += conv.unreadCount.get(userId) || 0;
    });

    res.json({
      success: true,
      data: { unreadCount: totalUnread }
    });

  } catch (error) {
    console.error('获取未读数失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 获取互关好友列表（可以发私信的人）
router.get('/mutual-follows', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    // 获取我关注的人
    const myFollowing = await Follow.find({ follower: userId }).select('following').lean();
    const followingIds = myFollowing.map(f => f.following);

    // 获取关注我的人，且我也关注了他们（互关）
    const mutualFollows = await Follow.find({
      follower: { $in: followingIds },
      following: userId
    })
      .populate('follower', 'username avatar bio isVerified')
      .lean();

    const result = mutualFollows.map(f => f.follower);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('获取互关好友失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

module.exports = router;
