import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEthnicityImage } from './imageConfig';
import { authApi } from '@/utils/api';

// 56个民族完整数据
const GALLERY_ITEMS = [
  { id: 1, name: "汉族", title: "汉 · 华夏衣冠", desc: "汉服之美，承载千年文化传承。" },
  { id: 2, name: "壮族", title: "壮 · 锦绣山河", desc: "壮锦绚烂，展现南国风情。" },
  { id: 3, name: "满族", title: "满 · 旗袍雅韵", desc: "旗袍优雅，展现东方神韵。" },
  { id: 4, name: "回族", title: "回 · 白帽清真", desc: "白帽青衫，体现民族信仰。" },
  { id: 5, name: "苗族", title: "苗 · 银饰华章", desc: "银饰璀璨，展现苗族文化。" },
  { id: 6, name: "维吾尔族", title: "维吾尔 · 花帽绚丽", desc: "花帽绚丽，展现西域风情。" },
  { id: 7, name: "彝族", title: "彝 · 黑红图腾", desc: "黑红相间，体现彝族文化。" },
  { id: 8, name: "土家族", title: "土家 · 西兰卡普", desc: "西兰卡普，展现土家织锦。" },
  { id: 9, name: "藏族", title: "藏 · 雪域圣衣", desc: "雪域圣衣，承载宗教文化。" },
  { id: 10, name: "蒙古族", title: "蒙古 · 草原长袍", desc: "长袍广袖，展现草原风情。" },
  { id: 11, name: "侗族", title: "侗 · 锦绣侗乡", desc: "侗锦精美，展现民族特色。" },
  { id: 12, name: "瑶族", title: "瑶 · 五彩衣裳", desc: "五彩斑斓，体现瑶族文化。" },
  { id: 13, name: "白族", title: "白 · 风花雪月", desc: "风花雪月，展现白族风情。" },
  { id: 14, name: "傣族", title: "傣 · 孔雀之衣", desc: "孔雀衣裳，展现傣族特色。" },
  { id: 15, name: "畲族", title: "畲 · 凤凰传说", desc: "凤凰图腾，承载畲族传说。" },
  { id: 16, name: "哈尼族", title: "哈尼 · 梯田衣装", desc: "梯田文化，融入服饰设计。" },
  { id: 17, name: "哈萨克族", title: "哈萨克 · 游牧风情", desc: "游牧文化，展现民族特色。" },
  { id: 18, name: "黎族", title: "黎 · 椰风海韵", desc: "椰风海韵，展现海岛风情。" },
  { id: 19, name: "傈僳族", title: "傈僳 · 怒江之韵", desc: "怒江文化，融入服饰之中。" },
  { id: 20, name: "佤族", title: "佤 · 木鼓传音", desc: "木鼓文化，体现佤族特色。" },
  { id: 21, name: "拉祜族", title: "拉祜 · 芦笙悠扬", desc: "芦笙文化，融入服饰设计。" },
  { id: 22, name: "水族", title: "水 · 端节庆典", desc: "端节文化，展现水族特色。" },
  { id: 23, name: "东乡族", title: "东乡 · 白帽宗教", desc: "宗教信仰，融入服饰设计。" },
  { id: 24, name: "纳西族", title: "纳西 · 东巴文化", desc: "东巴文化，承载民族历史。" },
  { id: 25, name: "景颇族", title: "景颇 · 目脑纵歌", desc: "目脑纵歌，展现民族特色。" },
  { id: 26, name: "柯尔克孜族", title: "柯尔克孜 · 山鹰之魂", desc: "山鹰文化，体现民族精神。" },
  { id: 27, name: "土族", title: "土 · 七彩袖衣", desc: "七彩袖衣，展现土族特色。" },
  { id: 28, name: "达斡尔族", title: "达斡尔 · 山水之韵", desc: "山水文化，融入服饰设计。" },
  { id: 29, name: "仫佬族", title: "仫佬 · 依饭节庆", desc: "依饭节庆，体现仫佬特色。" },
  { id: 30, name: "羌族", title: "羌 · 云朵之衣", desc: "云朵文化，展现羌族风情。" },
  { id: 31, name: "布朗族", title: "布朗 · 山茶花语", desc: "山茶文化，融入服饰设计。" },
  { id: 32, name: "撒拉族", title: "撒拉 · 清真服饰", desc: "清真文化，体现民族特色。" },
  { id: 33, name: "毛南族", title: "毛南 · 花竹帽韵", desc: "花竹帽饰，展现毛南特色。" },
  { id: 34, name: "仡佬族", title: "仡佬 · 竹王传说", desc: "竹王文化，融入服饰之中。" },
  { id: 35, name: "锡伯族", title: "锡伯 · 箭乡风情", desc: "箭乡文化，展现民族特色。" },
  { id: 36, name: "阿昌族", title: "阿昌 · 户撒刀光", desc: "户撒刀艺，体现民族工艺。" },
  { id: 37, name: "普米族", title: "普米 · 四山之衣", desc: "雪山文化，融入服饰设计。" },
  { id: 38, name: "塔吉克族", title: "塔吉克 · 鹰鹰之魂", desc: "鹰文化，体现高原民族特色。" },
  { id: 39, name: "怒族", title: "怒 · 怒江奔腾", desc: "怒江文化，展现民族风貌。" },
  { id: 40, name: "乌孜别克族", title: "乌孜别克 · 丝路风情", desc: "丝路文化，体现民族特色。" },
  { id: 41, name: "俄罗斯族", title: "俄罗斯 · 民谣之韵", desc: "民谣文化，展现异域风情。" },
  { id: 42, name: "鄂温克族", title: "鄂温克 · 森林之子", desc: "森林文化，体现狩猎民族特色。" },
  { id: 43, name: "德昂族", title: "德昂 · 酸茶文化", desc: "酸茶文化，融入服饰设计。" },
  { id: 44, name: "保安族", title: "保安 · 刀匠精神", desc: "刀匠文化，体现民族工艺。" },
  { id: 45, name: "裕固族", title: "裕固 · 草原牧歌", desc: "牧歌文化，展现草原风情。" },
  { id: 46, name: "京族", title: "京 · 海岛风情", desc: "海岛文化，体现渔家特色。" },
  { id: 47, name: "塔塔尔族", title: "塔塔尔 · 花帽精美", desc: "花帽工艺，展现民族特色。" },
  { id: 48, name: "独龙族", title: "独龙 · 彩纹面颊", desc: "彩纹文化，体现民族传统。" },
  { id: 49, name: "鄂伦春族", title: "鄂伦春 · 剼运之子", desc: "狩猎文化，展现森林民族特色。" },
  { id: 50, name: "赫哲族", title: "赫哲 · 鱲皮船歌", desc: "渔猎文化，体现民族特色。" },
  { id: 51, name: "门巴族", title: "门巴 · 雪域之光", desc: "雪域文化，展现高原民族特色。" },
  { id: 52, name: "珞巴族", title: "珞巴 · 山地风情", desc: "山地文化，体现民族特色。" },
  { id: 53, name: "基诺族", title: "基诺 · 太鼓节庆", desc: "大鼓文化，展现民族风情。" },
  { id: 54, name: "高山族", title: "高山 · 祭祖之韵", desc: "祭祖文化，体现民族传统。" },
  { id: 55, name: "佤族", title: "佤 · 木鼓传音", desc: "木鼓文化，体现佤族特色。" },
  { id: 56, name: "仫佬族", title: "仫佬 · 依饭节庆", desc: "依饭节庆，体现仫佬特色。" }
];

// 6大民族详细图片数据
const ethnicityImages = [
  { name: "白族绕三灵", title: "白族 · 风花雪月", image: "/images/白族绕三灵/s5bf83c8037a20.jpg" },
  { name: "藏族", title: "藏 · 雪域圣衣", image: "/images/藏族/20200303104821_2hKC4.jpeg" },
  { name: "苗族", title: "苗 · 银饰华章", image: "/images/苗族/20161025010138_2XNdT.jpeg" },
  { name: "维吾尔族", title: "维吾尔 · 花帽绚丽", image: "/images/维吾尔族/20181123195316_kummZ.jpeg" },
  { name: "彝族", title: "彝 · 黑红图腾", image: "/images/彝族/20220922234713_92891.thumb.1000_0.jpeg" },
  { name: "壮族", title: "壮 · 锦绣山河", image: "/images/壮族/20220206092840_e3ea7.jpeg" },
];

export default function GalleryPage() {
  const [checking, setChecking] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // 认证检查 - 必须在所有hooks之前声明
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (!res.success || !res.data) navigate('/login');
      } catch {
        navigate('/login');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // 自动播放 - 必须在顶层声明
  useEffect(() => {
    if (checking || hoveredItem) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ethnicityImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [checking, hoveredItem]);

  // loading状态 - 在所有hooks之后
  if (checking) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mist-300">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 overflow-hidden relative">
      {/* Background System */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          {ethnicityImages.map((ethnicity, index) => (
            <img
              key={ethnicity.name}
              src={ethnicity.image}
              alt={ethnicity.name}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 slow-zoom ${index === currentIndex && !hoveredItem ? 'opacity-80' : 'opacity-0'}`}
            />
          ))}
        </div>

        <div className="absolute inset-0 silk-background w-full h-full opacity-50">
          <div className="silk-layer silk-soft-flow-1" />
          <div className="silk-layer silk-soft-flow-2" />
          <div className="silk-layer silk-soft-flow-3" />
          <div className="silk-layer water-ripple" />
          <div className="silk-pattern" />
          <div className="silk-soft-cloud silk-soft-cloud-1" />
          <div className="silk-soft-cloud silk-soft-cloud-2" />
          <div className="silk-soft-cloud silk-soft-cloud-3" />
        </div>

        {hoveredItem && (
          <img src={getEthnicityImage(hoveredItem.name)} alt={hoveredItem.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-80 transition-opacity duration-1000 slow-zoom z-10" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/40 to-ink-900/70 z-20" />
      </div>

      {/* Title */}
      <div className="relative z-30 pt-16">
        <div className="container-custom text-center">
          <h1 className="text-7xl md:text-9xl font-serif text-gold-100 mb-6 tracking-wider">锦绣画廊</h1>
          <p className="text-xl text-mist-300 max-w-3xl mx-auto leading-relaxed">五十六个民族，五十六朵花，锦绣中华，共谱华章</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-30 pt-8 pb-6">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="搜索民族..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-ink-800/80 backdrop-blur-md border border-mist-100/20 rounded-full text-mist-100 placeholder-mist-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-center text-lg"
            />
          </div>
        </div>
      </div>

      {/* Ethnic Names Grid */}
      <div className="relative z-30 mt-6 pb-16">
        <div className="container-custom">
          <div className="ethnicity-grid-compact">
            {GALLERY_ITEMS.map((item) => {
              const isMatch = searchTerm && item.name.includes(searchTerm);
              return (
                <div
                  key={item.id}
                  className={`ethnic-name-item-compact group cursor-pointer transition-all duration-300 ${isMatch ? 'highlighted' : ''}`}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => navigate(`/ethnicity/${item.id}`)}
                >
                  <div className="text-center">
                    <div className={`text-lg font-serif transition-colors ${isMatch ? 'text-gold-300' : 'text-white group-hover:text-gold-100'}`}>{item.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-30 h-16" />
    </div>
  );
}