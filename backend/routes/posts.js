const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');

// 配置文件上传
const uploadsDir = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB（支持更大的视频文件）
  },
  fileFilter: (req, file, cb) => {
    // 支持的格式：图片(jpeg, jpg, png, gif, webp, avif) + 视频(mp4, mov, avi, webm, mkv)
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif|mp4|mov|avi|webm|mkv/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', ''); // 去掉点号
    const extname = allowedTypes.test(ext);
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    
    // 调试日志
    console.log('上传文件检测:', {
      originalname: file.originalname,
      ext: ext,
      extname: extname,
      mimetype: file.mimetype,
      mimetypeCheck: mimetype
    });

    if (extname || mimetype) {  // 扩展名或MIME类型任一匹配即可
      return cb(null, true);
    } else {
      console.log('文件被拒绝:', file.originalname, 'extname:', extname, 'mimetype:', mimetype);
      cb(new Error('只允许上传图片或视频文件（支持: jpg, png, gif, webp, avif, mp4, mov, avi, webm, mkv）'));
    }
  }
});

// 发布内容（支持FormData上传）
router.post('/', upload.fields([{ name: 'media', maxCount: 9 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  console.log('=== 开始处理发布内容请求 ===');
  console.log('用户ID:', req.session.userId);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  console.log('上传文件:', req.files ? {
    media: req.files.media?.length || 0,
    cover: req.files.cover?.length || 0
  } : '无文件');

  try {
    const { userId } = req.session;
    if (!userId) {
      console.log('错误：用户未登录');
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { description, mediaType, music, tags, topics, location } = req.body;

    // 验证媒体类型
    if (!mediaType || !['image', 'video'].includes(mediaType)) {
      console.log('错误：媒体类型无效 -', mediaType);
      return res.status(400).json({ success: false, error: '媒体类型无效，请选择image或video' });
    }

    // 验证文件上传
    if (!req.files || !req.files.media || req.files.media.length === 0) {
      console.log('错误：未上传媒体文件');
      return res.status(400).json({
        success: false,
        error: '请至少上传一张图片或视频',
        hint: '请使用FormData上传，字段名为media'
      });
    }

    console.log('上传的文件详情:', req.files.media.map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    })));

    // 验证视频文件
    if (mediaType === 'video') {
      const videoFile = req.files.media[0];
      if (!videoFile.mimetype.startsWith('video/')) {
        console.log('错误：视频类型不匹配 -', videoFile.mimetype);
        return res.status(400).json({
          success: false,
          error: '上传的文件不是视频',
          received: videoFile.mimetype,
          expected: 'video/*'
        });
      }
      console.log('视频文件验证通过:', videoFile.filename);
    }

    // 处理媒体URL
    const mediaUrls = req.files.media.map(file => `/uploads/posts/${file.filename}`);

    // 处理视频封面
    let coverUrl = null;
    if (req.files.cover && req.files.cover.length > 0) {
      coverUrl = `/uploads/posts/${req.files.cover[0].filename}`;
      console.log('视频封面已上传:', coverUrl);
    }

    // 处理标签和话题
    let parsedTags = [];
    let parsedTopics = [];

    try {
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
      parsedTopics = topics ? (typeof topics === 'string' ? JSON.parse(topics) : topics) : [];
    } catch (e) {
      console.log('警告：标签/话题解析失败，使用空数组');
    }

    // 处理音乐信息
    let parsedMusic = null;
    if (music) {
      try {
        parsedMusic = typeof music === 'string' ? JSON.parse(music) : music;
      } catch (e) {
        parsedMusic = { name: music };
      }
    }

    console.log('数据处理完成，开始创建帖子');

    // 创建帖子
    const post = new Post({
      author: userId,
      description: description || '',
      mediaType,
      mediaUrls,
      coverUrl,
      music: parsedMusic,
      tags: parsedTags,
      topics: parsedTopics,
      location: location || '',
      auditStatus: 'approved'
    });

    console.log('保存帖子到数据库...');
    await post.save();
    console.log('帖子保存成功，ID:', post._id);

    // 填充作者信息
    const User = require('../models/User');
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar bio isVerified');

    console.log('=== 发布内容成功 ===');
    res.status(201).json({
      success: true,
      message: '发布成功',
      data: populatedPost
    });

  } catch (error) {
    console.error('=== 发布内容失败 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error.stack);

    // 删除已上传的文件
    if (req.files) {
      console.log('清理已上传的文件...');
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          const filePath = file.path;
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log('已删除:', filePath);
            } catch (e) {
              console.log('删除文件失败:', filePath, e.message);
            }
          }
        });
      });
    }

    res.status(500).json({
      success: false,
      error: '发布失败，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 发布内容（支持base64上传）
router.post('/base64', async (req, res) => {
  console.log('=== 开始处理base64发布内容请求 ===');
  console.log('用户ID:', req.session.userId);

  try {
    const { userId } = req.session;
    if (!userId) {
      console.log('错误：用户未登录');
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const {
      description,
      mediaType,
      mediaUrls,
      coverUrl,
      music,
      tags,
      topics,
      location
    } = req.body;

    // 验证媒体类型
    if (!mediaType || !['image', 'video'].includes(mediaType)) {
      console.log('错误：媒体类型无效 -', mediaType);
      return res.status(400).json({ success: false, error: '媒体类型无效' });
    }

    // 验证媒体URL
    if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
      console.log('错误：未提供媒体URL');
      return res.status(400).json({
        success: false,
        error: '请至少提供一个媒体URL'
      });
    }

    console.log('媒体URL数量:', mediaUrls.length);

    // 处理标签和话题
    let parsedTags = tags || [];
    let parsedTopics = topics || [];

    // 处理音乐信息
    let parsedMusic = null;
    if (music) {
      try {
        parsedMusic = typeof music === 'string' ? JSON.parse(music) : music;
      } catch (e) {
        parsedMusic = { name: music };
      }
    }

    // 创建帖子
    const post = new Post({
      author: userId,
      description: description || '',
      mediaType,
      mediaUrls,
      coverUrl: coverUrl || null,
      music: parsedMusic,
      tags: parsedTags,
      topics: parsedTopics,
      location: location || '',
      auditStatus: 'approved'
    });

    console.log('保存帖子到数据库...');
    await post.save();
    console.log('帖子保存成功，ID:', post._id);

    // 填充作者信息
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar bio isVerified');

    console.log('=== base64发布内容成功 ===');
    res.status(201).json({
      success: true,
      message: '发布成功',
      data: populatedPost
    });

  } catch (error) {
    console.error('=== base64发布内容失败 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error.stack);

    res.status(500).json({
      success: false,
      error: '发布失败，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取Feed流（最新内容）
router.get('/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isVisible: true, auditStatus: 'approved' })
      .populate('author', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({ isVisible: true, auditStatus: 'approved' });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取Feed失败:', error);
    res.status(500).json({
      success: false,
      error: '获取内容失败'
    });
  }
});

// 获取用户发布的内容
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId, isVisible: true, auditStatus: 'approved' })
      .populate('author', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({ author: userId, isVisible: true, auditStatus: 'approved' });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取用户内容失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户内容失败'
    });
  }
});

// 获取关注的人的内容
router.get('/following', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Follow = require('../models/Follow');
    const following = await Follow.find({ follower: userId }).select('following');

    const followingIds = following.map(f => f.following);

    const posts = await Post.find({
      author: { $in: followingIds },
      isVisible: true,
      auditStatus: 'approved'
    })
      .populate('author', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      author: { $in: followingIds },
      isVisible: true,
      auditStatus: 'approved'
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取关注内容失败:', error);
    res.status(500).json({
      success: false,
      error: '获取关注内容失败'
    });
  }
});

// 搜索内容（必须在 /:postId 之前）
router.get('/search/q', async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: '请提供搜索关键词'
      });
    }

    const posts = await Post.find({
      $or: [
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { topics: { $in: [new RegExp(q, 'i')] } }
      ],
      isVisible: true,
      auditStatus: 'approved'
    })
      .populate('author', 'username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      $or: [
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { topics: { $in: [new RegExp(q, 'i')] } }
      ],
      isVisible: true,
      auditStatus: 'approved'
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败'
    });
  }
});

// 测试上传功能（必须在 /:postId 之前）
router.post('/test-upload', upload.single('test'), async (req, res) => {
  console.log('=== 测试上传功能 ===');
  console.log('用户ID:', req.session.userId);

  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未上传文件',
        hint: '请使用FormData上传，字段名为test'
      });
    }

    console.log('上传成功:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    res.json({
      success: true,
      message: '测试上传成功',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/posts/${req.file.filename}`
      }
    });

  } catch (error) {
    console.error('测试上传失败:', error);
    res.status(500).json({
      success: false,
      error: '测试上传失败',
      details: error.message
    });
  }
});

// 获取上传配置信息（必须在 /:postId 之前）
router.get('/upload-config', (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxImageCount: 9,
      maxVideoCount: 1,
      supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
      supportedVideoFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
      uploadFields: {
        media: {
          description: '媒体文件（图片或视频）',
          maxCount: 9
        },
        cover: {
          description: '视频封面（仅视频需要）',
          maxCount: 1
        }
      },
      exampleFormData: {
        description: '内容描述',
        mediaType: 'video', // 'image' or 'video'
        music: '{"name":"音乐名称","artist":"艺术家"}',
        tags: '["标签1","标签2"]',
        topics: '["话题1","话题2"]',
        location: '位置信息'
      }
    }
  });
});

// 获取单个帖子详情
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'username avatar bio isVerified');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '帖子不存在'
      });
    }

    // 增加浏览量
    post.stats.viewCount += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取帖子详情失败'
    });
  }
});

// 删除帖子
router.delete('/:postId', async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '帖子不存在'
      });
    }

    // 检查是否是作者
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权删除此帖子'
      });
    }

    // 软删除
    post.isVisible = false;
    await post.save();

    res.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({
      success: false,
      error: '删除帖子失败'
    });
  }
});

module.exports = router;