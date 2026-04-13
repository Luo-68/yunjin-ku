/**
 * 高德地图API代理路由
 * 用于避免前端直接调用高德API导致的跨域问题
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// 高德地图API Key
const AMAP_KEY = process.env.AMAP_KEY || '';

/**
 * POI搜索
 * GET /api/amap/search
 * 参数: keywords, city, types, offset, page, extensions
 */
router.get('/search', async (req, res) => {
  try {
    const { keywords, city, types, offset = 20, page = 1, extensions = 'base' } = req.query;
    
    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: '请输入搜索关键词'
      });
    }

    const response = await axios.get('https://restapi.amap.com/v3/place/text', {
      params: {
        key: AMAP_KEY,
        keywords,
        city: city || '',
        types: types || '',
        offset,
        page,
        extensions
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('高德地图POI搜索失败:', error.message);
    res.status(500).json({
      success: false,
      error: '位置搜索失败，请稍后重试'
    });
  }
});

/**
 * 输入提示（自动补全）
 * GET /api/amap/suggest
 * 参数: keywords, city
 */
router.get('/suggest', async (req, res) => {
  try {
    const { keywords, city } = req.query;
    
    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: '请输入搜索关键词'
      });
    }

    const response = await axios.get('https://restapi.amap.com/v3/assistant/inputtips', {
      params: {
        key: AMAP_KEY,
        keywords,
        city: city || '',
        citylimit: city ? 'true' : 'false',
        datatype: 'all'
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('高德地图输入提示失败:', error.message);
    res.status(500).json({
      success: false,
      error: '获取建议失败，请稍后重试'
    });
  }
});

/**
 * 逆地理编码（坐标转地址）
 * GET /api/amap/regeo
 * 参数: location (经纬度，格式: lng,lat)
 */
router.get('/regeo', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: '请提供经纬度坐标'
      });
    }

    const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
      params: {
        key: AMAP_KEY,
        location,
        extensions: 'base'
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('高德地图逆地理编码失败:', error.message);
    res.status(500).json({
      success: false,
      error: '获取地址失败，请稍后重试'
    });
  }
});

/**
 * 地理编码（地址转坐标）
 * GET /api/amap/geo
 * 参数: address, city
 */
router.get('/geo', async (req, res) => {
  try {
    const { address, city } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: '请提供地址'
      });
    }

    const response = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
      params: {
        key: AMAP_KEY,
        address,
        city: city || ''
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('高德地图地理编码失败:', error.message);
    res.status(500).json({
      success: false,
      error: '获取坐标失败，请稍后重试'
    });
  }
});

module.exports = router;
