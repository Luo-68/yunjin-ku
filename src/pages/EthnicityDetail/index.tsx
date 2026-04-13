import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, Maximize2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import clsx from 'clsx';
import { getEthnicityImage } from '../Gallery/imageConfig';

gsap.registerPlugin(ScrollTrigger);

// Enhanced ethnic groups data with detailed information
const ETHNICITY_DATA = {
  1: {
    id: 1,
    title: "汉 · 华夏衣冠",
    tag: "汉族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "汉服之美，承载千年文化传承。",
    heroText: "感受华夏衣冠的千年传承，体会汉服文化中的礼仪与美学",
    content: {
      overview: "汉族是中国的主体民族，汉族服饰即汉服，具有悠久的历史和深厚的文化内涵。汉服注重线条的流畅和整体的和谐，体现了中华传统美学。",
      history: "汉服历史可以追溯到黄帝时期，历经夏、商、周等朝代的发展，形成了完整的服饰体系。汉服在不同朝代有不同的风格特点，但都体现了中华文化的审美观念。",
      craftsmanship: "汉服制作工艺精湛，包括织、染、绣等多个环节。面料多用丝绸、棉麻等天然材料，图案多采用吉祥纹样，寓意美好。",
      culture: "汉服不仅是一种服饰，更是中华文化的重要载体。它体现了中华民族的礼仪文化、审美观念和哲学思想。",
      materials: "主要使用丝绸、棉、麻、毛等天然纤维材料，配以传统染色和刺绣工艺。",
      region: "全国范围广泛分布，各地区有不同的汉服传统特色。",
      population: "约910,000,000人",
      language: "汉语",
      timeline: [
        { year: "远古", event: "汉服雏形形成，开始使用丝麻制作服装" },
        { year: "周朝", event: "形成完整的服饰制度，奠定汉服基本形制" },
        { year: "汉朝", event: "汉服体系完善，风格趋于成熟" },
        { year: "唐宋", event: "汉服达到鼎盛，风格多样，影响深远" },
        { year: "明清", event: "传统汉服受到冲击，但仍有传承" },
        { year: "现代", event: "汉服文化复兴，成为传统文化的重要象征" }
      ]
    }
  },
  2: {
    id: 2,
    title: "壮 · 锦绣山河",
    tag: "壮族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "壮锦绚烂，展现南国风情。",
    heroText: "感受壮族服饰的绚烂色彩，体验南国民族的浓郁风情",
    content: {
      overview: "壮族是中国人口最多的少数民族，主要分布在广西壮族自治区。壮族服饰色彩艳丽，图案丰富，具有浓郁的民族特色。",
      history: "壮族服饰历史悠久，可追溯到古代的西瓯、骆越等族群。经过数千年的发展，形成了独特的服饰风格。",
      craftsmanship: "壮族服饰制作工艺以壮锦最为著名，采用复杂的织造技术，色彩搭配大胆，图案寓意深刻。",
      culture: "壮族服饰不仅是日常穿着，更是文化传承的重要载体，体现了壮族人民对生活的热爱和对美好未来的祝愿。",
      materials: "主要使用棉、麻、丝等天然纤维，配以银饰和刺绣装饰。",
      region: "主要分布在广西壮族自治区，以及云南、广东、贵州等省区。",
      population: "约16,260,000人",
      language: "壮语，属汉藏语系壮侗语族",
      timeline: [
        { year: "古代", event: "壮族先民创造独特的纺织工艺和服饰文化" },
        { year: "唐宋", event: "壮锦工艺逐渐成熟，服饰风格趋于稳定" },
        { year: "明清", event: "服饰文化进一步发展，形成区域性特色" },
        { year: "现代", event: "传统服饰与现代生活结合，继续传承发展" }
      ]
    }
  },
  3: {
    id: 3,
    title: "满 · 旗袍雅韵",
    tag: "满族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "旗袍优雅，展现东方神韵。",
    heroText: "体验满族服饰的优雅与端庄，感受东方女性的独特魅力",
    content: {
      overview: "满族服饰对中国服饰文化产生了深远影响，特别是旗袍，已成为中华女性的代表性服饰之一。满族服饰注重整体的和谐与优雅。",
      history: "满族服饰源于女真族的传统服饰，在清朝时期发展出独特的风格，并对整个中华民族的服饰文化产生了重要影响。",
      craftsmanship: "满族服饰工艺精细，特别是刺绣工艺，图案多采用花卉、鸟兽等自然元素，寓意吉祥。",
      culture: "满族服饰体现了北方民族的豪放与南方汉族的细腻的结合，形成了独特的审美风格。",
      materials: "主要使用丝绸、锦缎等高档面料，配以珠宝、金银等装饰品。",
      region: "主要分布在辽宁、河北、黑龙江、吉林等省区，以辽宁最为集中。",
      population: "约10,410,585人",
      language: "满语（现多使用汉语）",
      timeline: [
        { year: "女真时期", event: "形成早期满族服饰的基本特点" },
        { year: "清朝", event: "满族服饰成为全国主导服饰，旗袍等样式确立" },
        { year: "民国", event: "旗袍进一步发展改良，成为时尚象征" },
        { year: "现代", event: "满族传统服饰与现代设计结合，继续展现魅力" }
      ]
    }
  },
  4: {
    id: 4,
    title: "回 · 白帽清真",
    tag: "回族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "白帽青衫，体现民族信仰。",
    heroText: "感受回族服饰的简洁与庄重，体验伊斯兰文化的独特魅力",
    content: {
      overview: "回族服饰在保持中华传统服饰基本特征的同时，融入了伊斯兰文化元素，形成了独特的风格。回族服饰注重简洁、庄重，体现了民族的宗教信仰。",
      history: "回族服饰在形成过程中，融合了中亚、阿拉伯等地的文化元素，同时保持了中华服饰的传统特色，形成了独特的民族风格。",
      craftsmanship: "回族服饰制作工艺注重实用与美观的结合，面料多选用纯色，装饰相对简朴。",
      culture: "回族服饰体现了伊斯兰教信仰与中华文化的完美融合，白帽、盖头等服饰具有特殊的宗教和文化意义。",
      materials: "主要使用棉、麻、毛、丝等天然纤维，以纯色为主。",
      region: "全国均有分布，以宁夏回族自治区最为集中，甘肃、青海、河南等省区也有较多分布。",
      population: "约10,586,087人",
      language: "汉语",
      timeline: [
        { year: "唐宋", event: "回族先民开始在中国定居，服饰文化初步形成" },
        { year: "元代", event: "大量回族先民迁入中国，服饰文化进一步发展" },
        { year: "明清", event: "回族服饰基本定型，形成区域性特色" },
        { year: "现代", event: "回族传统服饰与现代生活结合，保持宗教特色" }
      ]
    }
  },
  5: {
    id: 5,
    title: "苗 · 银饰华章",
    tag: "苗族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "银饰璀璨，展现苗族文化。",
    heroText: "惊叹苗族银饰的璀璨夺目，感受苗族文化的深厚底蕴",
    content: {
      overview: "苗族服饰以其精美的刺绣和华丽的银饰而闻名于世。苗族服饰色彩丰富，图案独特，被誉为'穿在身上的史书'，记录着苗族的历史和文化。",
      history: "苗族服饰历史悠久，其纹样记录着苗族的历史、传说和信仰。服饰款式在不同地区有所差异，但都体现了苗族的审美观念和文化认同。",
      craftsmanship: "苗族服饰制作工艺精湛，特别是刺绣和银饰工艺。苗绣针法多样，图案寓意深刻；苗族银饰工艺复杂，造型独特。",
      culture: "苗族服饰是苗族文化的重要载体，每个图案都有特定的含义，体现了苗族人民对自然的崇拜和对生活的热爱。",
      materials: "主要使用棉、麻、丝等天然纤维，配以银饰和彩线，色彩对比强烈。",
      region: "主要分布在贵州、湖南、云南、四川、广西、湖北等省区，以贵州最为集中。",
      population: "约9,426,007人",
      language: "苗语，属汉藏语系苗瑶语族",
      timeline: [
        { year: "古代", event: "苗族服饰开始形成独特的风格和工艺" },
        { year: "唐宋", event: "服饰文化进一步发展，银饰工艺逐渐成熟" },
        { year: "明清", event: "服饰工艺达到高峰，形成了区域性特色" },
        { year: "现代", event: "苗族传统服饰得到保护和传承，银饰工艺列入非遗" }
      ]
    }
  },
  6: {
    id: 6,
    title: "维吾尔 · 花帽绚丽",
    tag: "维吾尔族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "花帽绚丽，展现西域风情。",
    heroText: "感受维吾尔族服饰的绚丽多彩，体验西域文化的独特魅力",
    content: {
      overview: "维吾尔族服饰色彩绚丽，式样多样，体现了西域民族的热情和豪放。维吾尔族服饰在保持民族特色的同时，也融合了当地的文化元素。",
      history: "维吾尔族服饰在古代丝绸之路上受到多种文化的影响，形成了独特的风格。服饰承载着维吾尔族的历史和文化传统。",
      craftsmanship: "维吾尔族服饰制作工艺精湛，特别是织花、刺绣、印染等工艺，图案多采用植物纹样和几何图案。",
      culture: "维吾尔族服饰体现了对美的追求和对生活的热爱，服饰上的图案多有吉祥寓意，反映了民族的审美观念。",
      materials: "主要使用丝绸、棉布、艾德莱斯绸等材料，色彩鲜艳，图案丰富。",
      region: "主要分布在新疆维吾尔自治区，以南疆地区最为集中。",
      population: "约11,774,538人",
      language: "维吾尔语，属阿尔泰语系突厥语族",
      timeline: [
        { year: "古代", event: "维吾尔族先民创造独特的服饰文化" },
        { year: "唐宋", event: "服饰文化在丝绸之路影响下发展" },
        { year: "明清", event: "服饰风格进一步成熟，形成了区域性特色" },
        { year: "现代", event: "维吾尔族传统服饰得到保护和传承" }
      ]
    }
  },
  7: {
    id: 7,
    title: "彝 · 黑红图腾",
    tag: "彝族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "黑红相间，体现彝族文化。",
    heroText: "穿梭于群山之间，感受彝族服饰中蕴含的山风与阳光",
    content: {
      overview: "彝族是中国第六大少数民族，主要分布在云南、四川、贵州和广西。彝族服饰以黑、黄、红三色为主，色彩对比强烈，纹样丰富多样，体现了彝族人民对自然的敬畏和对生活的热爱。",
      history: "彝族服饰历史悠久，可以追溯到古代的滇文化。在不同的历史时期，彝族服饰吸收了汉族、藏族等其他民族的文化元素，形成了独特的风格。明清时期，彝族服饰工艺达到了很高的水平。",
      craftsmanship: "彝族服饰的制作工艺包括刺绣、蜡染、银饰制作等。其中，彝绣是最具代表性的工艺，针法多样，图案多为几何纹样和自然图案，寓意吉祥。银饰是彝族服饰的重要组成部分，工艺精湛。",
      culture: "彝族服饰在日常生活中扮演着重要角色，不同的服饰适合不同的场合。节日盛装最为华丽，体现了彝族人民的审美观念和文化认同。服饰上的每一个图案都有特定的文化含义。",
      materials: "主要材料包括棉、麻、丝、羊毛等天然纤维。银饰主要使用纯银制作，配以宝石、珊瑚等装饰材料。",
      region: "主要分布在云南楚雄、四川凉山、贵州毕节等地。不同地区的彝族服饰在款式和纹样上有所差异。",
      population: "约9,055,503人",
      language: "彝语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "彝族服饰起源于滇文化，形成了独特的黑黄红配色体系" },
        { year: "明清", event: "服饰工艺达到鼎盛，刺绣和银饰制作技术日臻完善" },
        { year: "现代", event: "传统与现代融合，彝族服饰成为文化认同的重要象征" }
      ]
    }
  },
  8: {
    id: 8,
    title: "土家 · 西兰卡普",
    tag: "土家族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "西兰卡普，展现土家织锦。",
    heroText: "感受土家族织锦的魅力，体验西兰卡普的精美绝伦",
    content: {
      overview: "土家族服饰以织锦著称，特别是西兰卡普，被誉为'土家之花'。土家族服饰色彩丰富，图案独特，体现了土家人民的智慧和创造力。",
      history: "土家族服饰历史悠久，其织锦工艺可追溯到秦汉时期。土家服饰在历史发展过程中，形成了独特的风格和工艺。",
      craftsmanship: "土家族服饰以西兰卡普织锦最为著名，工艺复杂，图案精美，多采用几何纹样和动植物图案。",
      culture: "土家族服饰承载着深厚的民族文化内涵，是土家族文化的重要组成部分，体现了土家人对美好生活的向往。",
      materials: "主要使用棉、丝等材料，配以织锦工艺，色彩鲜艳。",
      region: "主要分布在湖南、湖北、四川、贵州等省的武陵山区，以湘西、鄂西地区最为集中。",
      population: "约9,587,732人",
      language: "土家语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "土家族先民开始使用织锦工艺制作服饰" },
        { year: "唐宋", event: "西兰卡普工艺逐渐成熟，服饰风格确立" },
        { year: "明清", event: "土家织锦工艺达到高峰" },
        { year: "现代", event: "西兰卡普列入国家非遗，得到有效保护" }
      ]
    }
  },
  9: {
    id: 9,
    title: "藏 · 雪域圣衣",
    tag: "藏族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "雪域圣衣，承载宗教文化。",
    heroText: "在雪域高原上，感受藏族服饰中蕴含的信仰力量与自然和谐",
    content: {
      overview: "藏族服饰是高原文化的瑰宝，色彩浓烈，款式厚重，充分适应高原环境。藏袍是最具代表性的服饰，既是日常服装，也是夜晚的被褥。",
      history: "藏族服饰历史悠久，受到佛教文化深刻影响。各个历史时期，藏族服饰在保持传统的基础上，不断吸收周边民族的文化元素。",
      craftsmanship: "藏族服饰工艺包括氆氇编织、金银首饰制作、刺绣等。其中，氆氇是藏族特有的毛织品，工艺复杂，图案丰富。",
      culture: "藏族服饰与宗教信仰密切相关，不同的服饰适合不同的宗教场合。服饰上的图案多具有宗教意义，体现了藏族人民的信仰世界。",
      materials: "主要材料包括羊毛、牦牛毛、皮革等。装饰品多使用绿松石、蜜蜡、珊瑚、金银等。",
      region: "主要分布在西藏、青海、四川、甘肃、云南等藏区。",
      population: "约6,282,117人",
      language: "藏语，属汉藏语系藏缅语族",
      timeline: [
        { year: "7世纪", event: "吐蕃王朝时期，藏族服饰体系基本形成" },
        { year: "佛教传入", event: "佛教文化深刻影响服饰样式和图案设计" },
        { year: "明清", event: "藏族服饰工艺进一步发展" },
        { year: "现代", event: "传统服饰与现代生活融合，保持文化特色" }
      ]
    }
  },
  10: {
    id: 10,
    title: "蒙古 · 草原长袍",
    tag: "蒙古族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "长袍广袖，展现草原风情。",
    heroText: "策马奔腾在辽阔草原，感受蒙古族服饰的豪放与自由",
    content: {
      overview: "蒙古族服饰以袍服为主，适应草原生活的需要。蒙古袍宽大舒适，既保暖又便于骑马，体现了游牧民族的智慧。",
      history: "蒙古族服饰历史悠久，经历了从原始社会到现代社会的演变，形成了独特的风格和制作工艺。",
      craftsmanship: "蒙古族服饰制作工艺精湛，特别是对襟、盘扣、绣花等工艺，装饰华丽，色彩鲜艳。",
      culture: "蒙古族服饰不仅是生活用品，更是身份地位和民族文化的象征，体现了草原民族的豪放气质。",
      materials: "主要使用丝绸、棉布、毛皮等材料，冬装多用毛皮，夏装多用丝绸。",
      region: "主要分布在内蒙古自治区，以及东北、华北等蒙古族聚居区。",
      population: "约5,981,840人",
      language: "蒙古语，属阿尔泰语系蒙古语族",
      timeline: [
        { year: "古代", event: "蒙古族先民创造适应草原生活的服饰" },
        { year: "元朝", event: "蒙古服饰影响全国，形成独特风格" },
        { year: "明清", event: "服饰文化进一步发展，形成区域性特色" },
        { year: "现代", event: "蒙古族传统服饰得到保护和传承" }
      ]
    }
  },
  11: {
    id: 11,
    title: "侗 · 锦绣侗乡",
    tag: "侗族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "侗锦精美，展现民族特色。",
    heroText: "走进侗乡深处，感受侗族服饰的精致与和谐",
    content: {
      overview: "侗族服饰以精美著称，特别是侗锦工艺，图案精美，色彩丰富。侗族服饰体现了侗家人对美的追求和对生活的热爱。",
      history: "侗族服饰历史悠久，其工艺和风格在历史发展过程中逐渐形成，体现了侗族的民族特色和文化传统。",
      craftsmanship: "侗族服饰制作工艺精湛，特别是侗锦和刺绣工艺，图案多采用几何纹样和自然图案。",
      culture: "侗族服饰承载着深厚的民族文化内涵，是侗族文化的重要组成部分，体现了侗家人对美好生活的向往。",
      materials: "主要使用棉、麻、丝等天然纤维，配以侗锦工艺，色彩协调。",
      region: "主要分布在贵州、湖南、广西等省区，以黔东南地区最为集中。",
      population: "约2,879,974人",
      language: "侗语，属汉藏语系壮侗语族",
      timeline: [
        { year: "古代", event: "侗族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "侗锦工艺达到高峰" },
        { year: "现代", event: "侗族传统服饰得到保护和传承" }
      ]
    }
  },
  12: {
    id: 12,
    title: "瑶 · 五彩衣裳",
    tag: "瑶族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "五彩斑斓，体现瑶族文化。",
    heroText: "感受瑶族服饰的五彩斑斓，体验瑶族文化的多姿多彩",
    content: {
      overview: "瑶族服饰色彩鲜艳，图案丰富，被誉为'五彩衣裳'。瑶族服饰因支系不同而风格各异，但都体现了瑶族人民对美的追求。",
      history: "瑶族服饰历史悠久，其工艺和风格在历史发展过程中逐渐形成，承载着瑶族的历史和文化传统。",
      craftsmanship: "瑶族服饰制作工艺精湛，特别是挑花、刺绣、织锦等工艺，图案寓意深刻。",
      culture: "瑶族服饰是瑶族文化的重要载体，每个图案都有特定的含义，体现了瑶族人民的信仰和生活观念。",
      materials: "主要使用棉、麻、丝等天然纤维，配以挑花、刺绣等装饰，色彩丰富。",
      region: "主要分布在广西、湖南、云南、广东、贵州等省区，以广西最为集中。",
      population: "约2,796,003人",
      language: "瑶语（多种方言），属汉藏语系苗瑶语族",
      timeline: [
        { year: "古代", event: "瑶族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰工艺达到高峰，形成区域性特色" },
        { year: "现代", event: "瑶族传统服饰得到保护和传承" }
      ]
    }
  },
  13: {
    id: 13,
    title: "白 · 风花雪月",
    tag: "白族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "风花雪月，展现白族风情。",
    heroText: "漫步大理古城，感受白族服饰的清雅与风韵",
    content: {
      overview: "白族服饰以白色为主，风格清雅，体现了白族人民对纯洁、美好的追求。白族服饰在保持传统的基础上，也融入了现代元素。",
      history: "白族服饰历史悠久，受到南诏、大理国等历史时期文化的影响，形成了独特的风格和工艺。",
      craftsmanship: "白族服饰制作工艺精湛，特别是挑花、刺绣等工艺，图案多采用'风花雪月'等自然元素。",
      culture: "白族服饰体现了白族人民的审美观念和文化传统，是白族文化的重要组成部分。",
      materials: "主要使用棉、麻、丝等天然纤维，以白色为主，配以淡雅色彩。",
      region: "主要分布在云南省大理白族自治州，以及丽江、怒江等地区。",
      population: "约1,933,510人",
      language: "白语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "白族服饰开始形成独特风格" },
        { year: "南诏时期", event: "服饰文化受中原文化影响" },
        { year: "大理国", event: "服饰风格进一步发展" },
        { year: "现代", event: "白族传统服饰得到保护和传承" }
      ]
    }
  },
  14: {
    id: 14,
    title: "傣 · 孔雀之衣",
    tag: "傣族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "孔雀衣裳，展现傣族特色。",
    heroText: "漫步热带雨林，感受傣族服饰的轻盈与优雅",
    content: {
      overview: "傣族服饰轻盈优雅，体现了热带民族的特色。傣族服饰色彩鲜艳，款式多样，特别是女性服饰，体现了傣族女性的美丽和优雅。",
      history: "傣族服饰历史悠久，受到东南亚文化的影响，形成了独特的风格和工艺。",
      craftsmanship: "傣族服饰制作工艺精湛，特别是织锦、刺绣等工艺，图案多采用自然元素。",
      culture: "傣族服饰体现了傣族人民的审美观念和文化传统，是傣族文化的重要组成部分。",
      materials: "主要使用丝绸、棉布等材料，色彩鲜艳，质地轻盈。",
      region: "主要分布在云南省西双版纳、德宏等傣族自治州，以及临沧、普洱等地区。",
      population: "约1,261,311人",
      language: "傣语，属汉藏语系壮侗语族",
      timeline: [
        { year: "古代", event: "傣族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰工艺达到高峰" },
        { year: "现代", event: "傣族传统服饰得到保护和传承" }
      ]
    }
  },
  15: {
    id: 15,
    title: "畲 · 凤凰传说",
    tag: "畲族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "凤凰图腾，承载畲族传说。",
    heroText: "聆听凤凰传说，感受畲族服饰的神秘与美丽",
    content: {
      overview: "畲族服饰以凤凰图腾为特色，体现了畲族的民族信仰和文化传统。畲族服饰工艺精湛，图案寓意深刻。",
      history: "畲族服饰历史悠久，凤凰图腾是畲族服饰的重要元素，体现了畲族对凤凰的崇拜和美好生活的向往。",
      craftsmanship: "畲族服饰制作工艺精湛，特别是刺绣工艺，图案以凤凰为主，色彩鲜艳。",
      culture: "畲族服饰承载着凤凰图腾的文化内涵，是畲族文化的重要组成部分，体现了畲族人民的精神追求。",
      materials: "主要使用棉、麻、丝等天然纤维，以蓝色为主，配以彩色刺绣。",
      region: "主要分布在福建、浙江、江西、广东等省，以福建、浙江最为集中。",
      population: "约708,662人",
      language: "畲语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "畲族服饰开始形成以凤凰为图腾的特色" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "凤凰图腾服饰工艺达到高峰" },
        { year: "现代", event: "畲族传统服饰得到保护和传承" }
      ]
    }
  },
  16: {
    id: 16,
    title: "哈尼 · 梯田衣装",
    tag: "哈尼族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "梯田文化，融入服饰设计。",
    heroText: "走进红河梯田，感受哈尼族服饰的质朴与和谐",
    content: {
      overview: "哈尼族服饰体现了梯田农耕文化的特点，色彩沉稳，款式实用。哈尼族服饰体现了与自然环境的和谐统一。",
      history: "哈尼族服饰在梯田农耕文化的影响下形成，适应山区生活环境，体现了哈尼族的智慧和创造力。",
      craftsmanship: "哈尼族服饰制作工艺实用，多采用天然染料，图案简洁大方，色彩以黑、蓝、白为主。",
      culture: "哈尼族服饰体现了与梯田文化的紧密结合，是哈尼族文化的重要组成部分，体现了人与自然的和谐。",
      materials: "主要使用棉、麻等天然纤维，采用植物染料染色，色彩自然。",
      region: "主要分布在云南省南部的红河、普洱、玉溪等地区，以红河州最为集中。",
      population: "约1,660,932人",
      language: "哈尼语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "哈尼族服饰开始适应山区生活需要" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "梯田服饰文化成熟" },
        { year: "现代", event: "哈尼族传统服饰得到保护和传承" }
      ]
    }
  },
  17: {
    id: 17,
    title: "哈萨克 · 游牧风情",
    tag: "哈萨克族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "游牧文化，展现民族特色。",
    heroText: "驰骋天山草原，感受哈萨克族服饰的豪迈与温暖",
    content: {
      overview: "哈萨克族服饰体现了游牧民族的特色，注重保暖和实用。服饰工艺精湛，装饰华丽，体现了哈萨克族的审美观念。",
      history: "哈萨克族服饰在游牧生活中形成，适应草原气候，体现了游牧民族的智慧和文化传统。",
      craftsmanship: "哈萨克族服饰制作工艺精湛，特别是皮毛加工和刺绣工艺，装饰华丽，色彩丰富。",
      culture: "哈萨克族服饰承载着游牧文化的深厚内涵，是哈萨克族文化的重要组成部分。",
      materials: "主要使用毛皮、毛毡、丝绸等材料，注重保暖和实用性。",
      region: "主要分布在新疆维吾尔自治区，特别是伊犁、阿勒泰等哈萨克族聚居区。",
      population: "约1,462,588人",
      language: "哈萨克语，属阿尔泰语系突厥语族",
      timeline: [
        { year: "古代", event: "哈萨克族服饰开始适应游牧生活需要" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "游牧服饰工艺成熟" },
        { year: "现代", event: "哈萨克族传统服饰得到保护和传承" }
      ]
    }
  },
  18: {
    id: 18,
    title: "黎 · 椰风海韵",
    tag: "黎族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "椰风海韵，展现海岛风情。",
    heroText: "漫步海南岛，感受黎族服饰的质朴与自然",
    content: {
      overview: "黎族服饰体现了海岛民族的特色，多采用天然材料，工艺独特。服饰色彩以深色为主，图案古朴，体现了原始的文化特色。",
      history: "黎族服饰历史悠久，使用传统的纺、染、织、绣工艺，特别是黎锦工艺，是世界上最古老的棉纺织工艺之一。",
      craftsmanship: "黎族服饰制作工艺独特，特别是黎锦工艺，采用踞织腰机，图案古朴，色彩对比强烈。",
      culture: "黎族服饰承载着深厚的文化内涵，是黎族文化的重要组成部分，体现了黎族人民的生活智慧。",
      materials: "主要使用木棉、麻、丝等天然纤维，采用植物染料染色。",
      region: "主要分布在海南省中南部地区，以五指山、保亭、三亚等地最为集中。",
      population: "约1,463,064人",
      language: "黎语，属汉藏语系壮侗语族",
      timeline: [
        { year: "古代", event: "黎族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "黎锦工艺达到高峰" },
        { year: "现代", event: "黎族传统服饰得到保护和传承" }
      ]
    }
  },
  19: {
    id: 19,
    title: "傈僳 · 怒江之韵",
    tag: "傈僳族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "怒江文化，融入服饰之中。",
    heroText: "沿怒江而行，感受傈僳族服饰的多彩与质朴",
    content: {
      overview: "傈僳族服饰色彩鲜艳，女性服饰尤为华丽，体现了傈僳族人民对美的追求。服饰多采用对比强烈的色彩搭配。",
      history: "傈僳族服饰在怒江流域的自然环境中形成，适应山区生活需要，体现了傈僳族的文化传统。",
      craftsmanship: "傈僳族服饰制作工艺精美，特别是女性的装饰品，包括贝壳、玛瑙、银饰等，色彩丰富。",
      culture: "傈僳族服饰体现了傈僳族人民的生活观念和审美情趣，是傈僳族文化的重要组成部分。",
      materials: "主要使用棉、麻、毛等天然纤维，配以贝壳、玛瑙、银饰等装饰品。",
      region: "主要分布在云南省怒江傈僳族自治州、迪庆藏族自治州，以及丽江、大理等地区。",
      population: "约702,839人",
      language: "傈僳语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "傈僳族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰工艺成熟" },
        { year: "现代", event: "傈僳族传统服饰得到保护和传承" }
      ]
    }
  },
  20: {
    id: 20,
    title: "佤 · 木鼓传音",
    tag: "佤族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "木鼓文化，体现佤族特色。",
    heroText: "聆听木鼓声响，感受佤族服饰的古朴与神秘",
    content: {
      overview: "佤族服饰体现了原始文化特色，以黑色为主，装饰简洁。服饰反映了佤族人民朴实、豪放的民族性格。",
      history: "佤族服饰在原始社会文化影响下形成，体现了佤族的历史传统和文化特色。",
      craftsmanship: "佤族服饰制作工艺相对简朴，多采用天然染料染色，装饰以银饰为主。",
      culture: "佤族服饰承载着深厚的原始文化内涵，是佤族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以黑色为主色调，配以银饰。",
      region: "主要分布在云南省西南部的沧源、西盟、孟连、耿马等县，以及缅甸、泰国等邻近国家。",
      population: "约429,709人",
      language: "佤语，属南亚语系孟高棉语族",
      timeline: [
        { year: "古代", event: "佤族服饰开始形成原始文化特色" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰风格稳定" },
        { year: "现代", event: "佤族传统服饰得到保护和传承" }
      ]
    }
  },
  21: {
    id: 21,
    title: "拉祜 · 芦笙悠扬",
    tag: "拉祜族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "芦笙文化，融入服饰设计。",
    heroText: "聆听芦笙悠扬，感受拉祜族服饰的质朴与和谐",
    content: {
      overview: "拉祜族服饰以黑色为主，装饰简洁大方。服饰体现了拉祜族人民朴实的生活方式和审美观念。",
      history: "拉祜族服饰在历史发展过程中形成，适应山区生活需要，体现了拉祜族的文化传统。",
      craftsmanship: "拉祜族服饰制作工艺简朴实用，多采用天然染料，装饰以几何图案为主。",
      culture: "拉祜族服饰体现了拉祜族人民的生活观念和文化传统，是拉祜族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以黑色为主，配以少量彩色装饰。",
      region: "主要分布在云南省的澜沧、孟连、双江、临沧等县，以及缅甸、泰国等邻近国家。",
      population: "约485,969人",
      language: "拉祜语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "拉祜族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰风格稳定" },
        { year: "现代", event: "拉祜族传统服饰得到保护和传承" }
      ]
    }
  },
  22: {
    id: 22,
    title: "水 · 端节庆典",
    tag: "水族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "端节文化，展现水族特色。",
    heroText: "欢度端节庆典，感受水族服饰的古雅与端庄",
    content: {
      overview: "水族服饰以素雅著称，特别是女性服饰，色彩淡雅，款式端庄。水族服饰体现了水族人民的审美观念。",
      history: "水族服饰历史悠久，使用传统的水族文字和水族绣工艺，体现了独特的民族文化。",
      craftsmanship: "水族服饰制作工艺精湛，特别是水族绣，图案精美，色彩搭配和谐。",
      culture: "水族服饰承载着深厚的文化内涵，是水族文化的重要组成部分，体现了水族人民的生活智慧。",
      materials: "主要使用棉、麻、丝等天然纤维，色彩以青、蓝、白为主。",
      region: "主要分布在贵州省黔南布依族苗族自治州的三都水族自治县，以及荔波、都匀、独山等县。",
      population: "约451,955人",
      language: "水语，属汉藏语系壮侗语族",
      timeline: [
        { year: "古代", event: "水族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "水族绣工艺成熟" },
        { year: "现代", event: "水族传统服饰得到保护和传承" }
      ]
    }
  },
  23: {
    id: 23,
    title: "东乡 · 白帽宗教",
    tag: "东乡族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "宗教信仰，融入服饰设计。",
    heroText: "感受宗教信仰，体验东乡族服饰的庄重与虔诚",
    content: {
      overview: "东乡族服饰体现了伊斯兰教信仰特色，服饰简洁庄重，体现了东乡族人民的宗教信仰和生活传统。",
      history: "东乡族服饰在伊斯兰教影响下形成，融合了中亚、汉族等文化元素，形成了独特的风格。",
      craftsmanship: "东乡族服饰制作工艺注重实用，装饰相对简朴，体现了宗教信仰的要求。",
      culture: "东乡族服饰承载着伊斯兰教文化内涵，是东乡族文化的重要组成部分。",
      materials: "主要使用棉、毛等天然纤维，以素色为主。",
      region: "主要分布在甘肃省临夏回族自治州的东乡族自治县，以及周边的和政、广河、临夏等县。",
      population: "约621,500人",
      language: "东乡语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "东乡族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰风格稳定" },
        { year: "现代", event: "东乡族传统服饰得到保护和传承" }
      ]
    }
  },
  24: {
    id: 24,
    title: "纳西 · 东巴文化",
    tag: "纳西族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "东巴文化，承载民族历史。",
    heroText: "走进东巴文化，感受纳西族服饰的古朴与神秘",
    content: {
      overview: "纳西族服饰体现了东巴文化的深厚内涵，特别是摩梭人的走婚文化影响下的服饰特色。服饰古朴典雅，富有文化特色。",
      history: "纳西族服饰历史悠久，受到东巴文化、藏族文化等多种文化的影响，形成了独特的风格。",
      craftsmanship: "纳西族服饰制作工艺精湛，特别是传统服饰的制作，保持了古老的手工技艺。",
      culture: "纳西族服饰承载着东巴文化的深厚内涵，是纳西族文化的重要组成部分。",
      materials: "主要使用棉、麻、毛、丝等天然纤维，色彩以素雅为主。",
      region: "主要分布在云南省丽江市、迪庆藏族自治州，以及四川省的盐源、木里等县。",
      population: "约326,295人",
      language: "纳西语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "纳西族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "东巴文化影响下的服饰成熟" },
        { year: "现代", event: "纳西族传统服饰得到保护和传承" }
      ]
    }
  },
  25: {
    id: 25,
    title: "景颇 · 目脑纵歌",
    tag: "景颇族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "目脑纵歌，展现民族特色。",
    heroText: "欢跳目脑纵歌，感受景颇族服饰的艳丽与豪放",
    content: {
      overview: "景颇族服饰色彩艳丽，图案丰富，特别是银泡装饰，使服饰显得华丽夺目。服饰体现了景颇族的热情和豪放。",
      history: "景颇族服饰在历史发展过程中形成，受到缅甸等邻近民族文化的影响，形成了独特的风格。",
      craftsmanship: "景颇族服饰制作工艺精湛，特别是银泡装饰工艺，图案多采用几何纹样。",
      culture: "景颇族服饰承载着深厚的文化内涵，是景颇族文化的重要组成部分，特别是在目脑纵歌节等重要场合。",
      materials: "主要使用棉、丝等天然纤维，配以银泡、银饰等装饰，色彩鲜艳。",
      region: "主要分布在云南省德宏傣族景颇族自治州，以及怒江州的部分地区。",
      population: "约160,485人",
      language: "景颇语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "景颇族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "银泡装饰工艺成熟" },
        { year: "现代", event: "景颇族传统服饰得到保护和传承" }
      ]
    }
  },
  26: {
    id: 26,
    title: "柯尔克孜 · 山鹰之魂",
    tag: "柯尔克孜族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "山鹰文化，体现民族精神。",
    heroText: "仰望帕米尔高原，感受柯尔克孜族服饰的豪迈与坚韧",
    content: {
      overview: "柯尔克孜族服饰体现了高原民族的特色，注重保暖和实用性。服饰工艺精湛，装饰华丽，体现了柯尔克孜族的民族精神。",
      history: "柯尔克孜族服饰在高原游牧生活中形成，适应寒冷气候，体现了柯尔克孜族的传统文化。",
      craftsmanship: "柯尔克孜族服饰制作工艺精湛，特别是皮毛加工和刺绣工艺，装饰华丽，色彩丰富。",
      culture: "柯尔克孜族服饰承载着深厚的高原文化内涵，是柯尔克孜族文化的重要组成部分。",
      materials: "主要使用毛皮、毛毡、丝绸等材料，注重保暖和实用性。",
      region: "主要分布在新疆维吾尔自治区的克孜勒苏柯尔克孜自治州，以及伊犁、塔城等地区。",
      population: "约204,766人",
      language: "柯尔克孜语，属阿尔泰语系突厥语族",
      timeline: [
        { year: "古代", event: "柯尔克孜族服饰开始适应高原生活需要" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "高原服饰工艺成熟" },
        { year: "现代", event: "柯尔克孜族传统服饰得到保护和传承" }
      ]
    }
  },
  27: {
    id: 27,
    title: "土 · 七彩袖衣",
    tag: "土族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "七彩袖衣，展现土族特色。",
    heroText: "走进互助土族自治县，感受土族服饰的七彩斑斓",
    content: {
      overview: "土族服饰以七彩袖而闻名，色彩搭配丰富，体现了土族人民对美的独特理解。女性服饰尤为华丽，色彩鲜艳。",
      history: "土族服饰历史悠久，受到蒙古族、藏族等文化的影响，形成了独特的风格。",
      craftsmanship: "土族服饰制作工艺精湛，特别是七彩袖的制作，色彩搭配和谐，工艺复杂。",
      culture: "土族服饰承载着深厚的文化内涵，是土族文化的重要组成部分，特别是七彩袖的传说寓意深刻。",
      materials: "主要使用丝绸、棉布等材料，以彩虹色为主，色彩搭配丰富。",
      region: "主要分布在青海省东部的互助土族自治县，以及民和、大通等县，甘肃省也有少量分布。",
      population: "约289,562人",
      language: "土族语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "土族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "七彩袖服饰工艺成熟" },
        { year: "现代", event: "土族传统服饰得到保护和传承" }
      ]
    }
  },
  28: {
    id: 28,
    title: "达斡尔 · 山水之韵",
    tag: "达斡尔族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "山水文化，融入服饰设计。",
    heroText: "走进嫩江流域，感受达斡尔族服饰的质朴与实用",
    content: {
      overview: "达斡尔族服饰体现了渔猎文化的特色，注重实用性和保暖性。服饰工艺精湛，体现了达斡尔族人民的智慧。",
      history: "达斡尔族服饰在渔猎生活中形成，适应寒冷气候，体现了达斡尔族的传统文化。",
      craftsmanship: "达斡尔族服饰制作工艺精湛，特别是皮毛加工工艺，注重实用性和保暖性。",
      culture: "达斡尔族服饰承载着渔猎文化的深厚内涵，是达 hurl 族文化的重要组成部分。",
      materials: "主要使用毛皮、棉布等材料，注重保暖和实用性。",
      region: "主要分布在内蒙古自治区的莫力达瓦达斡尔族自治旗、鄂温克族自治旗，以及黑龙江省的齐齐哈尔市、嫩江县等地。",
      population: "约131,992人",
      language: "达斡尔语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "达斡尔族服饰开始适应渔猎生活需要" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "渔猎服饰工艺成熟" },
        { year: "现代", event: "达斡尔族传统服饰得到保护和传承" }
      ]
    }
  },
  29: {
    id: 29,
    title: "仫佬 · 依饭节庆",
    tag: "仫佬族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "依饭节庆，体现仫佬特色。",
    heroText: "欢度依饭节庆，感受仫佬族服饰的质朴与庄重",
    content: {
      overview: "仫佬族服饰体现了山区民族的特色，以素色为主，工艺简朴实用。服饰体现了仫佬族人民的生活方式和审美观念。",
      history: "仫佬族服饰在山区生活中形成，受到壮族、汉族等文化的影响，形成了独特的风格。",
      craftsmanship: "仫佬族服饰制作工艺简朴实用，多采用天然染料，装饰简单。",
      culture: "仫佬族服饰承载着山区文化的深厚内涵，是仫佬族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以青、蓝、黑色为主。",
      region: "主要分布在广西壮族自治区的罗城仫佬族自治县，以及周边的柳城、忻城、宜州等县市。",
      population: "约189,716人",
      language: "仫佬语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "仫佬族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山区服饰风格稳定" },
        { year: "现代", event: "仫佬族传统服饰得到保护和传承" }
      ]
    }
  },
  30: {
    id: 30,
    title: "羌 · 云朵之衣",
    tag: "羌族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "云朵文化，展现羌族风情。",
    heroText: "攀登岷山之巅，感受羌族服饰的古朴与神秘",
    content: {
      overview: "羌族服饰体现了高原民族的特色，以素雅为主，工艺精湛。服饰图案多采用云纹等自然元素，体现了羌族人民对自然的崇拜。",
      history: "羌族服饰历史悠久，被称为'云朵上的民族'，服饰承载着深厚的羌族历史文化。",
      craftsmanship: "羌族服饰制作工艺精湛，特别是挑花、刺绣等工艺，图案寓意深刻。",
      culture: "羌族服饰承载着深厚的羌族文化内涵，是羌族文化的重要组成部分，体现了羌族人民的生活观念。",
      materials: "主要使用棉、麻、毛等天然纤维，以素色为主，配以彩色挑花。",
      region: "主要分布在四川省阿坝藏族羌族自治州的茂县、汶川、理县，以及绵阳市的北川羌族自治县等地。",
      population: "约309,576人",
      language: "羌语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "羌族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "高原服饰工艺成熟" },
        { year: "现代", event: "羌族传统服饰得到保护和传承" }
      ]
    }
  },
  31: {
    id: 31,
    title: "布朗 · 山茶花语",
    tag: "布朗族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "山茶文化，融入服饰设计。",
    heroText: "走进布朗山寨，感受布朗族服饰的质朴与自然",
    content: {
      overview: "布朗族服饰体现了山区民族的特色，以实用为主，工艺简朴。服饰色彩以深色为主，体现了布朗族人民的生活方式。",
      history: "布朗族服饰在山区生活中形成，受到傣族等邻近民族文化的影响，形成了独特的风格。",
      craftsmanship: "布朗族服饰制作工艺简朴实用，多采用天然染料，装饰简单。",
      culture: "布朗族服饰承载着山区文化的深厚内涵，是布朗族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以青、黑色为主。",
      region: "主要分布在云南省的西双版纳、临沧、普洱、保山等地区，以西双版纳最为集中。",
      population: "约119,639人",
      language: "布朗语，属南亚语系孟高棉语族",
      timeline: [
        { year: "古代", event: "布朗族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山区服饰风格稳定" },
        { year: "现代", event: "布朗族传统服饰得到保护和传承" }
      ]
    }
  },
  32: {
    id: 32,
    title: "撒拉 · 清真服饰",
    tag: "撒拉族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "清真文化，体现民族特色。",
    heroText: "感受清真文化，体验撒拉族服饰的庄重与典雅",
    content: {
      overview: "撒拉族服饰体现了伊斯兰教信仰特色，服饰简洁典雅，体现了撒拉族人民的宗教信仰和生活传统。",
      history: "撒拉族服饰在伊斯兰教影响下形成，融合了中亚、汉族等文化元素，形成了独特的风格。",
      craftsmanship: "撒拉族服饰制作工艺精湛，注重细节，女性头饰尤为精美。",
      culture: "撒拉族服饰承载着伊斯兰教文化内涵，是撒拉族文化的重要组成部分。",
      materials: "主要使用棉、毛、丝等天然纤维，以素色为主。",
      region: "主要分布在青海省循化撒拉族自治县和化隆回族自治县，以及甘肃省积石山保安族东乡族撒拉族自治县等地。",
      population: "约155,126人",
      language: "撒拉语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "撒拉族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "清真服饰风格稳定" },
        { year: "现代", event: "撒拉族传统服饰得到保护和传承" }
      ]
    }
  },
  33: {
    id: 33,
    title: "毛南 · 花竹帽韵",
    tag: "毛南族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "花竹帽饰，展现毛南特色。",
    heroText: "欣赏花竹帽韵，感受毛南族服饰的精致与美丽",
    content: {
      overview: "毛南族服饰以花竹帽而闻名，体现了毛南族人民的精湛手工艺。服饰色彩素雅，工艺精细。",
      history: "毛南族服饰历史悠久，花竹帽工艺精湛，是毛南族文化的象征。",
      craftsmanship: "毛南族服饰制作工艺精湛，特别是花竹帽编织工艺，被列入国家非物质文化遗产。",
      culture: "毛南族服饰承载着深厚的文化内涵，是毛南族文化的重要组成部分，特别是花竹帽具有特殊的文化意义。",
      materials: "主要使用棉、麻等天然纤维，花竹帽为竹编工艺品。",
      region: "主要分布在广西壮族自治区的环江毛南族自治县，以及河池、南丹等县市。",
      population: "约101,169人",
      language: "毛南语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "毛南族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "花竹帽工艺成熟" },
        { year: "现代", event: "毛南族传统服饰得到保护和传承" }
      ]
    }
  },
  34: {
    id: 34,
    title: "仡佬 · 竹王传说",
    tag: "仡佬族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "竹王文化，融入服饰之中。",
    heroText: "聆听竹王传说，感受仡佬族服饰的古朴与神秘",
    content: {
      overview: "仡佬族服饰体现了古朴的民族特色，以实用为主，工艺简朴。服饰反映了仡佬族人民的生活方式和文化传统。",
      history: "仡佬族服饰历史悠久，受到了古代濮人的文化影响，形成了独特的风格。",
      craftsmanship: "仡佬族服饰制作工艺简朴实用，多采用天然染料，装饰简单。",
      culture: "仡佬族服饰承载着深厚的文化内涵，是仡佬族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以青、黑色为主。",
      region: "主要分布在贵州省的务川仡佬族苗族自治县、道真仡佬族苗族自治县，以及广西、云南、重庆等省市的部分地区。",
      population: "约550,746人",
      language: "仡佬语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "仡佬族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "古朴服饰风格稳定" },
        { year: "现代", event: "仡佬族传统服饰得到保护和传承" }
      ]
    }
  },
  35: {
    id: 35,
    title: "锡伯 · 箭乡风情",
    tag: "锡伯族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "箭乡文化，展现民族特色。",
    heroText: "走进箭乡察布查尔，感受锡伯族服饰的英武与优雅",
    content: {
      overview: "锡伯族服饰体现了射箭民族的特色，款式简洁实用，女性服饰优雅大方。服饰体现了锡伯族人民的民族特色。",
      history: "锡伯族服饰在历史发展过程中形成，受到满族、汉族等文化的影响，形成了独特的风格。",
      craftsmanship: "锡伯族服饰制作工艺精湛，特别是刺绣工艺，图案精美。",
      culture: "锡伯族服饰承载着深厚的文化内涵，是锡伯族文化的重要组成部分，体现了射箭民族的特色。",
      materials: "主要使用棉、丝等天然纤维，色彩搭配和谐。",
      region: "主要分布在新疆维吾尔自治区的察布查尔锡伯自治县，以及辽宁省、黑龙江省等锡伯族聚居区。",
      population: "约191,911人",
      language: "锡伯语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "锡伯族服饰开始形成独特风格" },
        { year: "清代", event: "服饰文化受满族影响" },
        { year: "民国", event: "服饰风格进一步发展" },
        { year: "现代", event: "锡伯族传统服饰得到保护和传承" }
      ]
    }
  },
  36: {
    id: 36,
    title: "阿昌 · 户撒刀光",
    tag: "阿昌族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "户撒刀艺，体现民族工艺。",
    heroText: "欣赏户撒刀光，感受阿昌族服饰的质朴与实用",
    content: {
      overview: "阿昌族服饰体现了山区民族的特色，以实用为主，工艺精湛。服饰色彩素雅，体现了阿昌族人民的生活方式。",
      history: "阿昌族服饰在山区生活中形成，受到汉族、傣族等文化的影响，形成了独特的风格。",
      craftsmanship: "阿昌族服饰制作工艺精湛，女性服饰的银饰工艺尤为精美。",
      culture: "阿昌族服饰承载着深厚的文化内涵，是阿昌族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，配以银饰装饰。",
      region: "主要分布在云南省德宏傣族景颇族自治州的陇川县户撒阿昌族乡、梁河县九保阿昌族乡等地。",
      population: "约39,555人",
      language: "阿昌语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "阿昌族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山区服饰工艺成熟" },
        { year: "现代", event: "阿昌族传统服饰得到保护和传承" }
      ]
    }
  },
  37: {
    id: 37,
    title: "普米 · 四山之衣",
    tag: "普米族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "雪山文化，融入服饰设计。",
    heroText: "走进雪山深处，感受普米族服饰的古朴与温暖",
    content: {
      overview: "普米族服饰体现了高原民族的特色，注重保暖，工艺精湛。服饰色彩以素色为主，体现了普米族人民的生活方式。",
      history: "普米族服饰在高原生活中形成，受到藏族等文化的影响，形成了独特的风格。",
      craftsmanship: "普米族服饰制作工艺精湛，特别是皮毛加工工艺，注重保暖功能。",
      culture: "普米族服饰承载着深厚的文化内涵，是普米族文化的重要组成部分。",
      materials: "主要使用毛皮、棉、麻等天然纤维，注重保暖性。",
      region: "主要分布在云南省的兰坪、丽江、维西、永胜等县，以及四川省的木里、盐源等县。",
      population: "约42,861人",
      language: "普米语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "普米族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "高原服饰工艺成熟" },
        { year: "现代", event: "普米族传统服饰得到保护和传承" }
      ]
    }
  },
  38: {
    id: 38,
    title: "塔吉克 · 鹰鹰之魂",
    tag: "塔吉克族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "鹰文化，体现高原民族特色。",
    heroText: "仰望帕米尔雄鹰，感受塔吉克族服饰的豪迈与美丽",
    content: {
      overview: "塔吉克族服饰体现了高原民族的特色，女性服饰尤为美丽，帽子是其显著特色。服饰色彩鲜艳，工艺精湛。",
      history: "塔吉克族服饰在高原生活中形成，受到中亚文化的影响，形成了独特的风格。",
      craftsmanship: "塔吉克族服饰制作工艺精湛，特别是女性的鹰帽制作工艺，装饰华丽。",
      culture: "塔吉克族服饰承载着深厚的高原文化内涵，是塔吉克族文化的重要组成部分。",
      materials: "主要使用毛皮、棉、丝等天然纤维，配以金属装饰。",
      region: "主要分布在新疆维吾尔自治区的塔什库尔干塔吉克自治县，以及邻近地区。",
      population: "约51,314人",
      language: "塔吉克语，属印欧语系伊朗语族",
      timeline: [
        { year: "古代", event: "塔吉克族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "高原服饰工艺成熟" },
        { year: "现代", event: "塔吉克族传统服饰得到保护和传承" }
      ]
    }
  },
  39: {
    id: 39,
    title: "怒 · 怒江奔腾",
    tag: "怒族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "怒江文化，展现民族风貌。",
    heroText: "沿怒江而下，感受怒族服饰的质朴与实用",
    content: {
      overview: "怒族服饰体现了山区民族的特色，以实用为主，工艺简朴。服饰反映了怒族人民在怒江流域的生活方式。",
      history: "怒族服饰在怒江流域的自然环境中形成，适应山区生活需要，体现了怒族的文化传统。",
      craftsmanship: "怒族服饰制作工艺简朴实用，多采用天然材料，装饰简单。",
      culture: "怒族服饰承载着深厚的文化内涵，是怒族文化的重要组成部分。",
      materials: "主要使用麻、棉等天然纤维，以实用为主。",
      region: "主要分布在云南省怒江傈僳族自治州的泸水、福贡、贡山等县，以及西藏自治区的察隅县。",
      population: "约37,523人",
      language: "怒语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "怒族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山区服饰风格稳定" },
        { year: "现代", event: "怒族传统服饰得到保护和传承" }
      ]
    }
  },
  40: {
    id: 40,
    title: "乌孜别克 · 丝路风情",
    tag: "乌孜别克族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "丝路文化，体现民族特色。",
    heroText: "重走丝绸之路，感受乌孜别克族服饰的异域风情",
    content: {
      overview: "乌孜别克族服饰体现了丝绸之路文化的特色，色彩鲜艳，工艺精湛。服饰反映了乌孜别克族的商业文化传统。",
      history: "乌孜别克族服饰受到中亚文化的影响，体现了丝绸之路沿线民族的文化特色。",
      craftsmanship: "乌孜别克族服饰制作工艺精湛，特别是刺绣工艺，图案精美，色彩丰富。",
      culture: "乌孜别克族服饰承载着丝绸之路文化的深厚内涵，是乌孜别克族文化的重要组成部分。",
      materials: "主要使用丝绸、棉布等材料，色彩鲜艳，装饰华丽。",
      region: "主要分布在中国新疆维吾尔自治区，特别是南疆地区，人数较少。",
      population: "约12,758人",
      language: "乌孜别克语（现多使用维吾尔语或汉语）",
      timeline: [
        { year: "古代", event: "乌孜别克族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "丝路服饰工艺成熟" },
        { year: "现代", event: "乌孜别克族传统服饰得到保护和传承" }
      ]
    }
  },
  41: {
    id: 41,
    title: "俄罗斯 · 民谣之韵",
    tag: "俄罗斯族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "民谣文化，展现异域风情。",
    heroText: "聆听俄罗斯民谣，感受俄罗斯族服饰的优雅与美丽",
    content: {
      overview: "俄罗斯族服饰体现了欧洲民族的特色，女性传统服饰优雅美丽，男性服饰简洁大方。服饰反映了俄罗斯族的文化传统。",
      history: "俄罗斯族服饰在历史发展过程中，受到俄罗斯本土文化的影响，形成了独特的风格。",
      craftsmanship: "俄罗斯族服饰制作工艺精湛，特别是女性的头饰和刺绣工艺，色彩搭配和谐。",
      culture: "俄罗斯族服饰承载着深厚的欧洲文化内涵，是俄罗斯族文化的重要组成部分。",
      materials: "主要使用棉、丝、毛等天然纤维，色彩搭配丰富。",
      region: "主要分布在新疆维吾尔自治区的伊犁、塔城、阿勒泰等地区，以及内蒙古自治区、黑龙江省等地。",
      population: "约15,398人",
      language: "俄语（现多使用汉语）",
      timeline: [
        { year: "清代", event: "俄罗斯族开始迁入中国境内" },
        { year: "民国", event: "服饰文化在中国境内发展" },
        { year: "新中国", event: "服饰传统得到保护" },
        { year: "现代", event: "俄罗斯族传统服饰得到保护和传承" }
      ]
    }
  },
  42: {
    id: 42,
    title: "鄂温克 · 森林之子",
    tag: "鄂温克族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "森林文化，体现狩猎民族特色。",
    heroText: "走进大兴安岭，感受鄂温克族服饰的温暖与实用",
    content: {
      overview: "鄂温克族服饰体现了森林狩猎民族的特色，注重保暖和实用性。服饰工艺精湛，体现了鄂温克族人民的生存智慧。",
      history: "鄂温克族服饰在森林狩猎生活中形成，适应严寒气候，体现了鄂温克族的传统文化。",
      craftsmanship: "鄂温克族服饰制作工艺精湛，特别是皮毛加工工艺，装饰有独特的民族图案。",
      culture: "鄂温克族服饰承载着深厚的森林文化内涵，是鄂温克族文化的重要组成部分。",
      materials: "主要使用鹿皮、犴皮、羊皮等动物皮毛，注重保暖性能。",
      region: "主要分布在内蒙古自治区的鄂温克族自治旗、莫力达瓦达斡尔族自治旗、陈巴尔虎旗等地，以及黑龙江省的部分地区。",
      population: "约34,617人",
      language: "鄂温克语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "鄂温克族服饰开始适应森林生活需要" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "森林服饰工艺成熟" },
        { year: "现代", event: "鄂温克族传统服饰得到保护和传承" }
      ]
    }
  },
  43: {
    id: 43,
    title: "德昂 · 酸茶文化",
    tag: "德昂族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "酸茶文化，融入服饰设计。",
    heroText: "品味酸茶文化，感受德昂族服饰的质朴与自然",
    content: {
      overview: "德昂族服饰体现了山区民族的特色，以黑色为主，装饰银饰品。服饰工艺简朴，体现了德昂族人民的生活方式。",
      history: "德昂族服饰在山区生活中形成，受到傣族等邻近民族文化的影响，形成了独特的风格。",
      craftsmanship: "德昂族服饰制作工艺精湛，女性服饰的银饰工艺尤为突出，图案寓意深刻。",
      culture: "德昂族服饰承载着深厚的文化内涵，是德昂族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以黑色为主，配以银饰。",
      region: "主要分布在云南省的德宏傣族景颇族自治州、保山市、临沧市等地区，以德宏州最为集中。",
      population: "约22,338人",
      language: "德昂语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "德昂族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山区服饰工艺成熟" },
        { year: "现代", event: "德昂族传统服饰得到保护和传承" }
      ]
    }
  },
  44: {
    id: 44,
    title: "保安 · 刀匠精神",
    tag: "保安族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "刀匠文化，体现民族工艺。",
    heroText: "感受刀匠精神，体验保安族服饰的庄重与实用",
    content: {
      overview: "保安族服饰体现了伊斯兰教信仰特色，服饰简洁庄重，体现了保安族人民的宗教信仰和生活传统。",
      history: "保安族服饰在伊斯兰教影响下形成，融合了蒙古族、汉族、回族等文化元素，形成了独特的风格。",
      craftsmanship: "保安族服饰制作工艺注重实用，装饰相对简朴，体现了宗教信仰的要求。",
      culture: "保安族服饰承载着伊斯兰教文化内涵，是保安族文化的重要组成部分。",
      materials: "主要使用棉、毛等天然纤维，以素色为主。",
      region: "主要分布在甘肃省临夏回族自治州的积石山保安族东乡族撒拉族自治县大河家镇等地。",
      population: "约24,406人",
      language: "保安语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "保安族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰风格稳定" },
        { year: "现代", event: "保安族传统服饰得到保护和传承" }
      ]
    }
  },
  45: {
    id: 45,
    title: "裕固 · 草原牧歌",
    tag: "裕固族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "牧歌文化，展现草原风情。",
    heroText: "走进祁连山下，感受裕固族服饰的华丽与温暖",
    content: {
      overview: "裕固族服饰体现了草原游牧民族的特色，色彩鲜艳，装饰华丽。女性服饰的头饰是其显著特色，体现了裕固族的民族特色。",
      history: "裕固族服饰在草原游牧生活中形成，受到蒙古族、藏族等文化的影响，形成了独特的风格。",
      craftsmanship: "裕固族服饰制作工艺精湛，特别是女性的头饰工艺，装饰华丽，工艺复杂。",
      culture: "裕固族服饰承载着深厚的草原文化内涵，是裕固族文化的重要组成部分。",
      materials: "主要使用丝绸、棉布、毛皮等材料，配以珠宝、银饰等装饰。",
      region: "主要分布在甘肃省肃南裕固族自治县，以及酒泉市的黄泥堡裕固族乡等地。",
      population: "约14,706人",
      language: "裕固语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "裕固族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "草原服饰工艺成熟" },
        { year: "现代", event: "裕固族传统服饰得到保护和传承" }
      ]
    }
  },
  46: {
    id: 46,
    title: "京 · 海岛风情",
    tag: "京族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "海岛文化，体现渔家特色。",
    heroText: "漫步海边渔村，感受京族服饰的清新与美丽",
    content: {
      overview: "京族服饰体现了海洋民族的特色，女性服饰优雅清新，体现了京族人民的审美观念。服饰色彩以素雅为主。",
      history: "京族服饰在海洋渔猎生活中形成，受到越南海岛文化的影响，形成了独特的风格。",
      craftsmanship: "京族服饰制作工艺精湛，女性服饰的剪裁合体，体现了海洋民族的审美特色。",
      culture: "京族服饰承载着深厚的海洋文化内涵，是京族文化的重要组成部分。",
      materials: "主要使用丝绸、棉布等材料，色彩以素雅为主。",
      region: "主要分布在中国广西壮族自治区防城港市的东兴市江平镇的万尾、巫头、山心等京族聚居地，被称为'京族三岛'。",
      population: "约33,111人",
      language: "京语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "京族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "海岛服饰工艺成熟" },
        { year: "现代", event: "京族传统服饰得到保护和传承" }
      ]
    }
  },
  47: {
    id: 47,
    title: "塔塔尔 · 花帽精美",
    tag: "塔塔尔族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "花帽工艺，展现民族特色。",
    heroText: "欣赏精美花帽，感受塔塔尔族服饰的精致与优雅",
    content: {
      overview: "塔塔尔族服饰体现了中亚民族的特色，女性服饰精美，特别是花帽工艺精湛。服饰色彩鲜艳，工艺精湛。",
      history: "塔塔尔族服饰在历史发展过程中，受到中亚文化的影响，形成了独特的风格。",
      craftsmanship: "塔塔尔族服饰制作工艺精湛，特别是女性花帽的制作工艺，装饰精美，色彩丰富。",
      culture: "塔塔尔族服饰承载着中亚文化的深厚内涵，是塔塔尔族文化的重要组成部分。",
      materials: "主要使用丝绸、棉布等材料，配以精美刺绣和装饰。",
      region: "主要分布在新疆维吾尔自治区的伊宁、塔城、乌鲁木齐等城市。",
      population: "约3,556人",
      language: "塔塔尔语（现多使用哈萨克语或维吾尔语）",
      timeline: [
        { year: "古代", event: "塔塔尔族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "中亚服饰工艺成熟" },
        { year: "现代", event: "塔塔尔族传统服饰得到保护和传承" }
      ]
    }
  },
  48: {
    id: 48,
    title: "独龙 · 彩纹面颊",
    tag: "独龙族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "彩纹文化，体现民族传统。",
    heroText: "走进独龙江谷，感受独龙族服饰的古朴与神秘",
    content: {
      overview: "独龙族服饰体现了古老的民族特色，以麻布为主要材料，女性面部纹面是其独特的文化传统。服饰简朴自然。",
      history: "独龙族服饰在独龙江流域的自然环境中形成，保持了古老的民族特色，体现了原始的文化传统。",
      craftsmanship: "独龙族服饰制作工艺古朴，主要使用野生麻纤维制作，工艺简单实用。",
      culture: "独龙族服饰承载着古老的民族文化内涵，是独龙族文化的重要组成部分。",
      materials: "主要使用野生麻纤维制作的麻布，以素色为主。",
      region: "主要分布在云南省贡山独龙族怒族自治县的独龙江乡等地。",
      population: "约7,426人",
      language: "独龙语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "独龙族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "古老服饰风格稳定" },
        { year: "现代", event: "独龙族传统服饰得到保护和传承" }
      ]
    }
  },
  49: {
    id: 49,
    title: "鄂伦春 · 剼运之子",
    tag: "鄂伦春族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "狩猎文化，展现森林民族特色。",
    heroText: "走进兴安林海，感受鄂伦春族服饰的温暖与实用",
    content: {
      overview: "鄂伦春族服饰体现了森林狩猎民族的特色，以动物皮毛为主要材料，注重保暖和实用性。服饰体现了鄂伦春族的生存智慧。",
      history: "鄂伦春族服饰在森林狩猎生活中形成，适应严寒气候，体现了鄂伦春族的传统文化。",
      craftsmanship: "鄂伦春族服饰制作工艺精湛，特别是皮毛加工和骨角装饰工艺，体现了狩猎民族的特色。",
      culture: "鄂伦春族服饰承载着深厚的森林文化内涵，是鄂伦春族文化的重要组成部分。",
      materials: "主要使用狍皮、鹿皮等动物皮毛，注重保暖性能。",
      region: "主要分布在内蒙古自治区的呼伦贝尔市鄂伦春自治旗、扎兰屯市，以及黑龙江省的塔河、呼玛、逊克等县。",
      population: "约9,168人",
      language: "鄂伦春语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "鄂伦春族服饰开始适应森林狩猎需要" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "森林服饰工艺成熟" },
        { year: "现代", event: "鄂伦春族传统服饰得到保护和传承" }
      ]
    }
  },
  50: {
    id: 50,
    title: "赫哲 · 鱲皮船歌",
    tag: "赫哲族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "渔猎文化，体现民族特色。",
    heroText: "畅游三江汇流，感受赫哲族服饰的防水与实用",
    content: {
      overview: "赫哲族服饰体现了渔猎民族的特色，以鱼皮为主要材料，具有良好的防水性能。服饰工艺独特，体现了赫哲族的民族智慧。",
      history: "赫哲族服饰在三江流域的渔猎生活中形成，使用鱼皮制作服饰，形成了独特的工艺技术。",
      craftsmanship: "赫哲族服饰制作工艺独特，特别是鱼皮加工和缝制工艺，是世界级的非物质文化遗产。",
      culture: "赫哲族服饰承载着深厚的渔猎文化内涵，是赫哲族文化的重要组成部分。",
      materials: "主要使用各种鱼类的皮制作，具有独特的防水性能。",
      region: "主要分布在黑龙江省的同江市街津口赫哲族乡、饶河县四排赫哲族乡、佳木斯市敖其镇赫哲族村等地。",
      population: "约5,373人",
      language: "赫哲语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "赫哲族开始使用鱼皮制作服饰" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "鱼皮服饰工艺成熟" },
        { year: "现代", event: "赫哲族鱼皮服饰工艺得到保护和传承" }
      ]
    }
  },
  51: {
    id: 51,
    title: "门巴 · 雪域之光",
    tag: "门巴族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "雪域文化，展现高原民族特色。",
    heroText: "走进喜马拉雅，感受门巴族服饰的温暖与朴实",
    content: {
      overview: "门巴族服饰体现了高原民族的特色，注重保暖，工艺简朴实用。服饰色彩以素色为主，体现了门巴族人民的生活方式。",
      history: "门巴族服饰在喜马拉雅山南麓的高原环境中形成，受到藏族文化的影响，形成了独特的风格。",
      craftsmanship: "门巴族服饰制作工艺简朴实用，多使用氆氇等材料，注重保暖功能。",
      culture: "门巴族服饰承载着深厚的高原文化内涵，是门巴族文化的重要组成部分。",
      materials: "主要使用氆氇、毛皮、棉布等材料，注重保暖性能。",
      region: "主要分布在中国西藏自治区的错那市门巴民族乡等地，以及邻近地区。",
      population: "约10,577人",
      language: "门巴语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "门巴族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "高原服饰工艺成熟" },
        { year: "现代", event: "门巴族传统服饰得到保护和传承" }
      ]
    }
  },
  52: {
    id: 52,
    title: "珞巴 · 山地风情",
    tag: "珞巴族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp"
    ],
    description: "山地文化，体现民族特色。",
    heroText: "深入雅鲁藏布大峡谷，感受珞巴族服饰的实用与质朴",
    content: {
      overview: "珞巴族服饰体现了山地民族的特色，注重实用性，工艺简朴。服饰反映了珞巴族人民在山地环境中的生活方式。",
      history: "珞巴族服饰在喜马拉雅山地环境中形成，保持了古老的民族特色，体现了原始的文化传统。",
      craftsmanship: "珞巴族服饰制作工艺简朴实用，多使用兽皮、牛皮等材料，适应山地生活。",
      culture: "珞巴族服饰承载着深厚的山地文化内涵，是珞巴族文化的重要组成部分。",
      materials: "主要使用兽皮、牛皮、氆氇等材料，注重实用性。",
      region: "主要分布在中国西藏自治区的米林、墨脱、察隅等县，以及邻近地区。",
      population: "约6,023人",
      language: "珞巴语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "珞巴族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山地服饰风格稳定" },
        { year: "现代", event: "珞巴族传统服饰得到保护和传承" }
      ]
    }
  },
  53: {
    id: 53,
    title: "基诺 · 太鼓节庆",
    tag: "基诺族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp"
    ],
    description: "大鼓文化，展现民族风情。",
    heroText: "敲响大鼓，感受基诺族服饰的原始与热烈",
    content: {
      overview: "基诺族服饰体现了热带民族的特色，男性服饰简朴，女性服饰色彩鲜艳。服饰反映了基诺族人民的生活方式。",
      history: "基诺族服饰在西双版纳热带雨林环境中形成，保持了原始的民族特色，体现了古老的文化传统。",
      craftsmanship: "基诺族服饰制作工艺简朴，女性服饰的彩色条纹和头饰是其显著特色。",
      culture: "基诺族服饰承载着深厚的文化内涵，是基诺族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，色彩搭配鲜艳。",
      region: "主要分布在云南省西双版纳傣族自治州景洪市基诺山基诺族乡。",
      population: "约26,000人",
      language: "基诺语，属汉藏语系藏缅语族",
      timeline: [
        { year: "古代", event: "基诺族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "热带服饰风格稳定" },
        { year: "现代", event: "基诺族传统服饰得到保护和传承" }
      ]
    }
  },
  54: {
    id: 54,
    title: "高山 · 祭祖之韵",
    tag: "高山族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677210.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733268.jpg?imageMogr2/format/webp"
    ],
    description: "祭祖文化，体现民族传统。",
    heroText: "参加祭祖仪式，感受高山族服饰的庄重与美丽",
    content: {
      overview: "高山族服饰体现了台湾原住民族的特色，各族群服饰风格各异，色彩鲜艳，图案丰富。服饰反映了高山族的传统文化。",
      history: "高山族服饰在台湾岛的自然环境中形成，各族群发展出独特的服饰风格，体现了多元的民族文化。",
      craftsmanship: "高山族服饰制作工艺精湛，特别是刺绣和织布工艺，图案多具有宗教和文化意义。",
      culture: "高山族服饰承载着深厚的传统文化内涵，是高山族文化的重要组成部分。",
      materials: "主要使用棉、麻、毛等天然纤维，配以珠饰、羽毛等装饰。",
      region: "主要分布在台湾省，包括阿美族、泰雅族、排湾族、布农族、鲁凯族、卑南族、邹族、赛夏族、雅美族、邵族、噶玛兰族、太鲁阁族等族群。",
      population: "约581,000人（台湾地区）",
      language: "各族群有不同语言，属南岛语系",
      timeline: [
        { year: "古代", event: "高山族服饰开始形成独特风格" },
        { year: "明清", event: "各族群服饰风格成熟" },
        { year: "近代", event: "服饰文化受到外来文化影响" },
        { year: "现代", event: "高山族传统服饰得到保护和传承" }
      ]
    }
  },
  55: {
    id: 55,
    title: "佤 · 木鼓传音",
    tag: "佤族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "木鼓文化，体现佤族特色。",
    heroText: "聆听木鼓声响，感受佤族服饰的古朴与神秘",
    content: {
      overview: "佤族服饰体现了原始文化特色，以黑色为主，装饰简洁。服饰反映了佤族人民朴实、豪放的民族性格。",
      history: "佤族服饰在原始社会文化影响下形成，体现了佤族的历史传统和文化特色。",
      craftsmanship: "佤族服饰制作工艺相对简朴，多采用天然染料染色，装饰以银饰为主。",
      culture: "佤族服饰承载着深厚的原始文化内涵，是佤族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以黑色为主色调，配以银饰。",
      region: "主要分布在云南省西南部的沧源、西盟、孟连、耿马等县，以及缅甸、泰国等邻近国家。",
      population: "约429,709人",
      language: "佤语，属南亚语系孟高棉语族",
      timeline: [
        { year: "古代", event: "佤族服饰开始形成原始文化特色" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "服饰风格稳定" },
        { year: "现代", event: "佤族传统服饰得到保护和传承" }
      ]
    }
  },
  56: {
    id: 56,
    title: "仫佬 · 依饭节庆",
    tag: "仫佬族",
    category: "ethnicity",
    image: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
    gallery: [
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573733468.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573734669.jpg?imageMogr2/format/webp",
      "https://cdn.wegic.ai/assets/onepage/agent/images/1764573738071.jpg?imageMogr2/format/webp"
    ],
    description: "依饭节庆，体现仫佬特色。",
    heroText: "欢度依饭节庆，感受仫佬族服饰的质朴与庄重",
    content: {
      overview: "仫佬族服饰体现了山区民族的特色，以素色为主，工艺简朴实用。服饰体现了仫佬族人民的生活方式和审美观念。",
      history: "仫佬族服饰在山区生活中形成，受到壮族、汉族等文化的影响，形成了独特的风格。",
      craftsmanship: "仫佬族服饰制作工艺简朴实用，多采用天然染料，装饰简单。",
      culture: "仫佬族服饰承载着山区文化的深厚内涵，是仫佬族文化的重要组成部分。",
      materials: "主要使用棉、麻等天然纤维，以青、蓝、黑色为主。",
      region: "主要分布在广西壮族自治区的罗城仫佬族自治县，以及周边的柳城、忻城、宜州等县市。",
      population: "约189,716人",
      language: "仫佬语（现多使用汉语）",
      timeline: [
        { year: "古代", event: "仫佬族服饰开始形成独特风格" },
        { year: "唐宋", event: "服饰文化进一步发展" },
        { year: "明清", event: "山区服饰风格稳定" },
        { year: "现代", event: "仫佬族传统服饰得到保护和传承" }
      ]
    }
  }
};

export default function EthnicityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const ethnicity = (ETHNICITY_DATA as any)[parseInt(id || '1')];

  useEffect(() => {
    if (!ethnicity) {
      navigate('/gallery');
      return;
    }

    // Scroll progress tracking
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    
    // GSAP animations
    const tl = gsap.timeline();
    
    // Content sections animation
    gsap.utils.toArray('.content-section').forEach((section: any, index) => {
      gsap.from(section, {
        opacity: 0,
        x: index % 2 === 0 ? -50 : 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [ethnicity, navigate]);

  if (!ethnicity) {
    // 如果没有找到对应的民族数据，重定向到画廊页
    useEffect(() => {
      navigate('/gallery');
    }, [navigate]);
    return null;
  }

  return (
    <div className="ethnicity-detail min-h-screen bg-gradient-to-b from-ink-900 to-black">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-ink-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Content Area with 1:2 Layout */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Side - Main Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // 防止触发父元素的点击事件
                  setSelectedImage(0);
                }}>
                <img 
                  src={getEthnicityImage(ethnicity.tag)} 
                  alt={ethnicity.title}
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                  <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information */}
          <div className="lg:col-span-2">
            <div className="detail-content">
              <h1 className="text-4xl md:text-5xl font-serif text-gold-100 mb-4 leading-tight">
                {ethnicity.title}
              </h1>
              <span className="text-gold-500 text-lg uppercase mb-6 block">
                {ethnicity.tag}
              </span>
              <p className="text-xl text-mist-300 mb-8 leading-relaxed">
                {ethnicity.heroText}
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-serif text-gold-100 mb-4">概述</h3>
                  <p className="text-mist-300 leading-relaxed">
                    {ethnicity.content.overview}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-serif text-gold-100 mb-4">历史沿革</h3>
                  <p className="text-mist-300 leading-relaxed">
                    {ethnicity.content.history}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-serif text-gold-100 mb-4">制作工艺</h3>
                  <p className="text-mist-300 leading-relaxed">
                    {ethnicity.content.craftsmanship}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-serif text-gold-100 mb-4">文化内涵</h3>
                  <p className="text-mist-300 leading-relaxed">
                    {ethnicity.content.culture}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-serif text-gold-100 mb-4">材料</h3>
                  <p className="text-mist-300 leading-relaxed">
                    {ethnicity.content.materials}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-serif text-gold-100 mb-2">主要分布</h3>
                    <p className="text-mist-300">
                      {ethnicity.content.region}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-gold-100 mb-2">人口规模</h3>
                    <p className="text-mist-300">
                      {ethnicity.content.population}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-gold-100 mb-2">语言文字</h3>
                    <p className="text-mist-300">
                      {ethnicity.content.language}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-gold-100 mb-2">文化标签</h3>
                    <p className="text-mist-300">
                      {ethnicity.tag}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                {ethnicity.content.timeline && (
                  <div>
                    <h3 className="text-2xl font-serif text-gold-100 mb-4">历史时间线</h3>
                    <div className="space-y-4">
                      {ethnicity.content.timeline.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-4 border-l-2 border-gold-500/30 pl-4 py-1">
                          <div className="flex-shrink-0 text-gold-500 font-medium w-16">
                            {item.year}
                          </div>
                          <div className="text-mist-300">
                            {item.event}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* BACK Button */}
              <div className="mt-12">
                <button 
                  onClick={() => navigate('/gallery')}
                  className="px-8 py-3 bg-gold-500 text-ink-900 font-medium rounded-full hover:bg-gold-300 transition-colors duration-300"
                >
                  BACK
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-2 rounded-full border transition-all",
                    isLiked 
                      ? "bg-gold-500/20 border-gold-500 text-gold-300" 
                      : "border-mist-500/30 text-mist-300 hover:border-gold-500/50 hover:text-gold-300"
                  )}
                >
                  <Heart size={18} className={isLiked ? "fill-current" : ""} />
                  <span>收藏</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-mist-500/30 text-mist-300 hover:border-gold-500/50 hover:text-gold-300 transition-all">
                  <Share2 size={18} />
                  <span>分享</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for images */}
      {selectedImage !== null && selectedImage >= 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/95 backdrop-blur-lg"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={getEthnicityImage(ethnicity.tag)} 
            alt={`${ethnicity.title} ${selectedImage + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <button 
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}