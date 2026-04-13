const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Collection = require('../models/Collection');
const Post = require('../models/Post');

// 收藏/取消收藏帖子
router.post('/:postId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { postId } = req.params;
    const { folderName } = req.body;

    // 检查帖子是否存在
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }

    // 检查是否已收藏
    const existingCollection = await Collection.findOne({ post: postId, user: userId });

    if (existingCollection) {
      // 取消收藏
      await Collection.deleteOne({ _id: existingCollection._id });
      post.stats.collectionCount = Math.max(0, post.stats.collectionCount - 1);
      await post.save();

      res.json({
        success: true,
        message: '取消收藏',
        data: {
          collected: false,
          collectionCount: post.stats.collectionCount
        }
      });
    } else {
      // 收藏
      const collection = new Collection({
        post: postId,
        user: userId,
        folderName: folderName || '默认收藏夹'
      });
      await collection.save();
      post.stats.collectionCount += 1;
      await post.save();

      res.json({
        success: true,
        message: '收藏成功',
        data: {
          collected: true,
          collectionCount: post.stats.collectionCount
        }
      });
    }

  } catch (error) {
    console.error('收藏操作失败:', error);
    res.status(500).json({
      success: false,
      error: '操作失败'
    });
  }
});

// 获取用户的收藏列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { folder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: userId };
    if (folder) {
      query.folderName = folder;
    }

    const collections = await Collection.find(query)
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
    const validCollections = collections.filter(col => col.post !== null);

    // 获取总数（只计算有效帖子）
    const allCollections = await Collection.find(query)
      .populate({
        path: 'post',
        match: { isVisible: { $ne: false } },
        select: '_id'
      })
      .lean();
    const total = allCollections.filter(col => col.post !== null).length;

    res.json({
      success: true,
      data: validCollections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏列表失败'
    });
  }
});

// 获取用户的收藏夹列表
router.get('/user/:userId/folders', async (req, res) => {
  try {
    const { userId } = req.params;

    const folders = await Collection.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$folderName',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      data: folders
    });

  } catch (error) {
    console.error('获取收藏夹列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏夹列表失败'
    });
  }
});

// 检查用户是否收藏了帖子
router.get('/:postId/check', async (req, res) => {
  try {
    const { userId } = req.session;
    const { postId } = req.params;

    if (!userId) {
      return res.json({
        success: true,
        data: {
          collected: false
        }
      });
    }

    const collection = await Collection.findOne({ post: postId, user: userId });

    res.json({
      success: true,
      data: {
        collected: !!collection,
        folderName: collection?.folderName || null
      }
    });

  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({
      success: false,
      error: '检查收藏状态失败'
    });
  }
});

// 创建收藏夹
router.post('/user/:userId/folders', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId || req.params.userId !== userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { folderName } = req.body;

    if (!folderName) {
      return res.status(400).json({ success: false, error: '收藏夹名称不能为空' });
    }

    // 检查收藏夹是否已存在
    const existingFolder = await Collection.findOne({ user: userId, folderName });

    if (existingFolder) {
      return res.status(400).json({ success: false, error: '收藏夹已存在' });
    }

    res.json({
      success: true,
      message: '收藏夹创建成功',
      data: { folderName }
    });

  } catch (error) {
    console.error('创建收藏夹失败:', error);
    res.status(500).json({
      success: false,
      error: '创建收藏夹失败'
    });
  }
});

// 删除收藏夹
router.delete('/user/:userId/folders/:folderName', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId || req.params.userId !== userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { folderName } = req.params;

    // 删除该收藏夹下的所有收藏
    await Collection.deleteMany({ user: userId, folderName });

    res.json({
      success: true,
      message: '收藏夹删除成功'
    });

  } catch (error) {
    console.error('删除收藏夹失败:', error);
    res.status(500).json({
      success: false,
      error: '删除收藏夹失败'
    });
  }
});

module.exports = router;