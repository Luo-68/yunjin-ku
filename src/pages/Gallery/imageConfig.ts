// 民族名称到图片文件的映射
// 图片来源: 56个少数民族图片/ 目录
// 有些民族没图片，用default.jpg代替
export const IMAGE_MAPPING: Record<string, string> = {
  '汉族': 'default.jpg',
  '白族': '白族.webp',
  '布朗族': '布朗族.jpg',
  '布依族': '布依族.jpg',
  '藏族': '藏族.jpg',
  '朝鲜族': '朝鲜族.jpg',
  '达斡尔族': '达斡尔族.jpg',
  '傣族': '傣族.jpg',
  '侗族': '侗族.v1',
  '高山族': '高山族.jpg',
  '仡佬族': '仡佬族.jpg',
  '哈尼族': '哈尼族.webp',
  '哈萨克族': '哈萨克族.webp',
  '回族': '回族.webp',
  '景颇族': '景颇族.jpg',
  '柯尔克孜族': '柯尔克孜族.jpg',
  '拉祜族': '拉祜族.jpg',
  '黎族': '黎族.jpg',
  '傈僳族': '傈傈族.jpg',
  '傈傈族': '傈傈族.jpg',
  '满族': '满族.jpg',
  '毛南族': '毛南族.jpg',
  '蒙古族': '蒙古族.jpg',
  '苗族': '苗族.jpg',
  '仫佬族': '仫佬族.avif',
  '纳西族': '纳西族.webp',
  '羌族': '羌族.webp',
  '撒拉族': '撒拉族.jpg',
  '畲族': '畲族.webp',
  '水族': '水族.jpg',
  '土家族': '土家族.webp',
  '土族': '土族.webp',
  '佤族': '佤族.webp',
  '锡伯族': '锡伯族.jpg',
  '瑶族': '瑶族.jpg',
  '彝族': '彝族.jpg',
  '壮族': '壮族.jpg',
  // 以下民族暂无图片，用default
  '维吾尔族': 'default.jpg',
  '东乡族': 'default.jpg',
  '阿昌族': 'default.jpg',
  '普米族': 'default.jpg',
  '塔吉克族': 'default.jpg',
  '怒族': 'default.jpg',
  '乌孜别克族': 'default.jpg',
  '俄罗斯族': 'default.jpg',
  '鄂温克族': 'default.jpg',
  '德昂族': 'default.jpg',
  '保安族': 'default.jpg',
  '裕固族': 'default.jpg',
  '京族': 'default.jpg',
  '塔塔尔族': 'default.jpg',
  '独龙族': 'default.jpg',
  '鄂伦春族': 'default.jpg',
  '赫哲族': 'default.jpg',
  '门巴族': 'default.jpg',
  '珞巴族': 'default.jpg',
  '基诺族': 'default.jpg',
};

// 获取民族图片路径
export const getEthnicityImage = (name: string): string => {
  const fileName = IMAGE_MAPPING[name];
  if (fileName) {
    return `/images/${fileName}`;
  }
  // 如果没有找到对应图片，使用默认占位图
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjE2Ij7nmoTmoLzlvZ88L3RleHQ+PC9zdmc+';
};
