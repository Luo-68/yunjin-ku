const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// 发表评论
router.post('/:postId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { postId } = req.params;
    const { content, parentCommentId, replyToUserId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: '评论内容不能为空' });
    }

    // 检查帖子是否存在
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }

    // 如果是回复评论，检查父评论是否存在
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, error: '被回复的评论不存在' });
      }
    }

    // 创建评论
    const comment = new Comment({
      post: postId,
      author: userId,
      content: content.trim(),
      parentComment: parentCommentId || null,
      replyTo: replyToUserId || null
    });

    await comment.save();

    // 更新帖子评论数
    post.stats.commentCount += 1;
    await post.save();

    // 填充作者信息
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar bio isVerified')
      .populate('replyTo', 'username avatar')
      .lean();

    res.status(201).json({
      success: true,
      message: '评论成功',
      data: populatedComment
    });

  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({
      success: false,
      error: '发表评论失败'
    });
  }
});

// 获取帖子的评论列表
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 获取顶级评论（没有父评论的评论）
    const comments = await Comment.find({
      post: postId,
      parentComment: null,
      isDeleted: false
    })
      .populate('author', 'username avatar bio isVerified')
      .populate('replyTo', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 获取每条评论的回复数量
    const commentIds = comments.map(c => c._id);
    const replyCounts = await Comment.aggregate([
      {
        $match: {
          parentComment: { $in: commentIds },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$parentComment',
          count: { $sum: 1 }
        }
      }
    ]);

    const replyCountMap = {};
    replyCounts.forEach(rc => {
      replyCountMap[rc._id.toString()] = rc.count;
    });

    // 添加回复数量到评论数据
    const commentsWithReplyCount = comments.map(comment => ({
      ...comment,
      replyCount: replyCountMap[comment._id.toString()] || 0
    }));

    const total = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false
    });

    res.json({
      success: true,
      data: commentsWithReplyCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取评论列表失败'
    });
  }
});

// 获取评论的回复列表
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false
    })
      .populate('author', 'username avatar bio isVerified')
      .populate('replyTo', 'username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取回复列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取回复列表失败'
    });
  }
});

// 删除评论
router.delete('/:commentId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: '评论不存在' });
    }

    // 检查是否是评论作者
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权删除此评论'
      });
    }

    // 软删除
    comment.isDeleted = true;
    await comment.save();

    // 更新帖子评论数
    const post = await Post.findById(comment.post);
    if (post) {
      post.stats.commentCount = Math.max(0, post.stats.commentCount - 1);
      await post.save();
    }

    res.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      error: '删除评论失败'
    });
  }
});

// 获取用户的评论列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      author: userId,
      isDeleted: false
    })
      .populate('author', 'username avatar bio isVerified')
      .populate('post', 'author mediaType mediaUrls description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({
      author: userId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取用户评论列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户评论列表失败'
    });
  }
});

module.exports = router;