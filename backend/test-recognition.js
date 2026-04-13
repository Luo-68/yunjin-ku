/**
 * 测试AI识别功能
 */

const fs = require('fs');
const path = require('path');

// 读取图片并转换为base64
const imagePath = path.join(__dirname, '../56个少数民族图片/仡佬族.jpg');
const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

// 构造请求数据
const requestData = {
  image: imageBase64
};

console.log('图片路径:', imagePath);
console.log('图片大小:', imageBuffer.length, '字节');
console.log('Base64长度:', imageBase64.length, '字符');
console.log('\n发送识别请求到: http://localhost:3001/api/recognition');
console.log('请稍候...\n');

// 发送POST请求
fetch('http://localhost:3001/api/recognition', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
  .then(response => response.json())
  .then(data => {
    console.log('识别结果:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n✓ 识别成功!');
      console.log('民族:', data.data.ethnic_group);
      console.log('置信度:', data.data.confidence);
      console.log('朝代:', data.data.era);
      console.log('工艺:', data.data.craft);
      console.log('描述:', data.data.description);
    } else {
      console.log('\n✗ 识别失败:', data.error);
    }
  })
  .catch(error => {
    console.error('请求失败:', error);
  });