const qs = (selector) => document.querySelector(selector);

const state = {
  profile: {},
  answers: [],
  index: 0,
  result: null,
  activeTheme: "worker",
  questions: [],
  questionSource: "local",
  posterTemplate: "classic",
  tone: "sharp",
  copySeed: 0,
  aiStatus: "idle",
  stats: {},
  sessionId: createId("sess"),
  shareId: "",
  entryShareId: "",
  questionStartedAt: 0,
  qrDataUrl: "",
  qrImage: null,
  reservedPremium: false,
};

const posterTemplates = {
  classic: "报告卡",
  social: "朋友圈",
  xhs: "小红书",
};

const toneOptions = {
  soft: "轻吐槽",
  sharp: "够真实",
  black: "黑化版",
};

const themes = {
  worker: {
    label: "打工人",
    short: "工位运行模式",
    color: "#c7ff4f",
    meta: "会议、通勤、余额",
    risk: "职场过载",
    hotLine: "杭州",
    tomorrow: "明天检测：老板消息免疫力",
    causes: ["会议后遗症", "通勤损耗", "周报反噬"],
    revives: ["准点下班", "关闭工位通知", "喝一杯真的想喝的"],
    questions: [
      {
        id: "sleep",
        dimension: "睡眠电量",
        title: "昨晚睡了多久？",
        options: [
          { label: "8 小时以上，像个人类", value: 18 },
          { label: "6 小时，勉强开机", value: 8 },
          { label: "4 小时，灵魂加载中", value: -8 },
          { label: "不知道，闭眼算睡吗", value: -18 },
        ],
      },
      {
        id: "quit",
        dimension: "跑路冲动",
        title: "今天想离职几次？",
        options: [
          { label: "0 次，甚至有点热爱", value: 15 },
          { label: "3 次以内，常规波动", value: 4 },
          { label: "10 次左右，工位渡劫", value: -10 },
          { label: "已经在看远方的票", value: -20 },
        ],
      },
      {
        id: "money",
        dimension: "余额防线",
        title: "余额能让你安心几天？",
        options: [
          { label: "一个月以上，心率正常", value: 14 },
          { label: "两周，还能演", value: 4 },
          { label: "三天，呼吸变轻", value: -12 },
          { label: "别问，问就是精神富豪", value: -22 },
        ],
      },
      {
        id: "social",
        dimension: "社交响应",
        title: "现在有人喊你下班聚一下，你会？",
        options: [
          { label: "立刻出发，电量充足", value: 14 },
          { label: "看是谁，再装没看见", value: 1 },
          { label: "身体拒绝，嘴上答应", value: -10 },
          { label: "自动回复：本人低电量", value: -17 },
        ],
      },
      {
        id: "hope",
        dimension: "明日预期",
        title: "明天最可能发生什么？",
        options: [
          { label: "一觉醒来，宇宙补偿我", value: 16 },
          { label: "继续营业，问题不大", value: 5 },
          { label: "闹钟响起，人生暂停", value: -9 },
          { label: "打开手机，坏消息刷新", value: -18 },
        ],
      },
    ],
  },
  student: {
    label: "大学生",
    short: "DDL 呼吸模式",
    color: "#54d6d1",
    meta: "熬夜、考试、社交",
    risk: "DDL 堆叠",
    hotLine: "武汉",
    tomorrow: "明天检测：早八幸存概率",
    causes: ["ddl 追尾", "早八压制", "小组作业内耗"],
    revives: ["点开课表前深呼吸", "先写 200 字", "找个能一起沉默的人"],
    questions: [
      {
        id: "sleep",
        dimension: "作息漂移",
        title: "昨晚几点才放过手机？",
        options: [
          { label: "12 点前，像个传说", value: 18 },
          { label: "1 点多，还能抢救", value: 8 },
          { label: "3 点后，灵魂夜跑", value: -10 },
          { label: "天亮了，手机赢了", value: -20 },
        ],
      },
      {
        id: "ddl",
        dimension: "任务压强",
        title: "DDL 离你有多近？",
        options: [
          { label: "还远，我甚至有计划", value: 14 },
          { label: "本周内，开始装稳", value: 4 },
          { label: "今晚，空气变薄", value: -12 },
          { label: "已经过了，别念", value: -22 },
        ],
      },
      {
        id: "exam",
        dimension: "考试预感",
        title: "面对考试/汇报，你现在像？",
        options: [
          { label: "知识点本人", value: 16 },
          { label: "选择题随缘派", value: 3 },
          { label: "翻书像考古", value: -11 },
          { label: "准备和命运谈判", value: -19 },
        ],
      },
      {
        id: "social",
        dimension: "社交能量",
        title: "舍友/同学突然约饭，你会？",
        options: [
          { label: "走，顺便复活", value: 13 },
          { label: "看预算和距离", value: 2 },
          { label: "说去，实际躺着", value: -9 },
          { label: "假装睡了", value: -16 },
        ],
      },
      {
        id: "hope",
        dimension: "明日幻想",
        title: "明天你最需要什么？",
        options: [
          { label: "自然醒和好运", value: 16 },
          { label: "老师临时取消", value: 5 },
          { label: "小组成员上线", value: -7 },
          { label: "时间倒流三天", value: -18 },
        ],
      },
    ],
  },
  solo: {
    label: "独居人",
    short: "深夜离线模式",
    color: "#ff6b57",
    meta: "外卖、沉默、房间",
    risk: "生活静音",
    hotLine: "成都",
    tomorrow: "明天检测：冰箱文明程度",
    causes: ["外卖盒堆叠", "房间静音", "深夜脑内会议"],
    revives: ["洗个热水澡", "开灯五分钟", "给朋友发一句废话"],
    questions: [
      {
        id: "sleep",
        dimension: "夜间状态",
        title: "昨晚房间几点安静下来？",
        options: [
          { label: "很早，生活有边界", value: 18 },
          { label: "1 点左右，正常漂移", value: 6 },
          { label: "3 点后，脑子开会", value: -11 },
          { label: "没安静过，连梦都吵", value: -20 },
        ],
      },
      {
        id: "food",
        dimension: "进食系统",
        title: "今天吃饭状态如何？",
        options: [
          { label: "正经吃了两顿", value: 16 },
          { label: "外卖但完整", value: 5 },
          { label: "零食冒充晚饭", value: -12 },
          { label: "想起来时已经很晚", value: -20 },
        ],
      },
      {
        id: "room",
        dimension: "房间秩序",
        title: "你房间现在像什么？",
        options: [
          { label: "可直接见人", value: 14 },
          { label: "局部可见地面", value: 4 },
          { label: "生活证据展览", value: -10 },
          { label: "请勿考古", value: -18 },
        ],
      },
      {
        id: "social",
        dimension: "人类连接",
        title: "今天和人类有效对话了吗？",
        options: [
          { label: "聊得还挺开心", value: 15 },
          { label: "有，主要是谢谢和好的", value: 2 },
          { label: "和外卖备注交流了", value: -10 },
          { label: "没有，但和天花板熟了", value: -18 },
        ],
      },
      {
        id: "hope",
        dimension: "复活概率",
        title: "现在最能救你的是？",
        options: [
          { label: "一次出门晒太阳", value: 16 },
          { label: "一顿热饭", value: 8 },
          { label: "一场不被打扰的睡眠", value: -5 },
          { label: "有人替我整理人生", value: -18 },
        ],
      },
    ],
  },
  freelance: {
    label: "自由职业",
    short: "自我驱动模式",
    color: "#ffd166",
    meta: "客户、现金流、自律",
    risk: "边界消失",
    hotLine: "深圳",
    tomorrow: "明天检测：客户消息耐受度",
    causes: ["客户临时改需求", "现金流心跳", "自律系统掉线"],
    revives: ["先收定金", "关掉一个通知", "把任务拆到 25 分钟"],
    questions: [
      {
        id: "sleep",
        dimension: "昼夜边界",
        title: "今天你的上下班边界在哪里？",
        options: [
          { label: "清楚，像个公司", value: 16 },
          { label: "大概有，偶尔漂", value: 6 },
          { label: "客户醒着我就醒着", value: -12 },
          { label: "没有边界，只有消息", value: -20 },
        ],
      },
      {
        id: "client",
        dimension: "客户扰动",
        title: "客户今天给你什么感觉？",
        options: [
          { label: "付款爽快，人间值得", value: 18 },
          { label: "正常沟通，可持续", value: 6 },
          { label: "反复横跳，开始缺氧", value: -12 },
          { label: "需求像连续剧", value: -22 },
        ],
      },
      {
        id: "money",
        dimension: "现金流",
        title: "现金流现在像什么？",
        options: [
          { label: "小河流淌", value: 15 },
          { label: "水龙头滴答", value: 3 },
          { label: "看天吃饭", value: -12 },
          { label: "精神融资中", value: -21 },
        ],
      },
      {
        id: "focus",
        dimension: "专注能力",
        title: "今天你能连续专注多久？",
        options: [
          { label: "90 分钟，状态很野", value: 16 },
          { label: "半小时，够用了", value: 5 },
          { label: "十分钟就想换赛道", value: -10 },
          { label: "打开文档即下线", value: -18 },
        ],
      },
      {
        id: "hope",
        dimension: "明日订单",
        title: "明天最希望出现什么？",
        options: [
          { label: "老客户直接打款", value: 18 },
          { label: "需求一次说清", value: 6 },
          { label: "没人半夜找我", value: -6 },
          { label: "我突然学会自律", value: -16 },
        ],
      },
    ],
  },
};

const extraQuestionBank = {
  worker: [
    {
      id: "commute",
      dimension: "通勤损耗",
      title: "今天通勤像什么？",
      options: [
        { label: "一路顺风，像被城市放过", value: 15 },
        { label: "正常拥挤，灵魂贴边站", value: 3 },
        { label: "人贴人，开始怀疑人生密度", value: -11 },
        { label: "到公司时已经下班心态", value: -20 },
      ],
    },
    {
      id: "meeting",
      dimension: "会议浓度",
      title: "今天会议含量如何？",
      options: [
        { label: "几乎没有，耳朵自由", value: 16 },
        { label: "一两个，还能呼吸", value: 5 },
        { label: "连环会，脑子排队下线", value: -12 },
        { label: "会中会，像被 PPT 腌入味", value: -22 },
      ],
    },
    {
      id: "message",
      dimension: "通知压力",
      title: "工作消息今天怎么响？",
      options: [
        { label: "很克制，像文明社会", value: 15 },
        { label: "断断续续，可以忍", value: 4 },
        { label: "一直亮，像催债灯", value: -12 },
        { label: "静音也能听见幻觉", value: -21 },
      ],
    },
    {
      id: "lunch",
      dimension: "午饭质量",
      title: "今天午饭拯救你了吗？",
      options: [
        { label: "拯救了，甚至想续命", value: 14 },
        { label: "正常吃完，能量回升", value: 5 },
        { label: "随便糊弄，胃在抗议", value: -9 },
        { label: "忙到忘吃，靠咖啡续航", value: -18 },
      ],
    },
    {
      id: "boss",
      dimension: "老板天气",
      title: "今天老板像什么天气？",
      options: [
        { label: "晴朗，甚至有人性", value: 16 },
        { label: "多云，偶有消息", value: 4 },
        { label: "雷阵雨，随机劈人", value: -13 },
        { label: "台风登陆，全员抱头", value: -22 },
      ],
    },
    {
      id: "overtime",
      dimension: "下班概率",
      title: "今晚准点下班概率？",
      options: [
        { label: "很高，我已看见门口", value: 17 },
        { label: "一半一半，命运摇骰", value: 2 },
        { label: "偏低，椅子在留我", value: -12 },
        { label: "别问，今晚属于公司", value: -22 },
      ],
    },
    {
      id: "kpi",
      dimension: "绩效阴影",
      title: "KPI 今天离你多近？",
      options: [
        { label: "很远，暂时阳光明媚", value: 13 },
        { label: "在旁边坐着，不说话", value: 2 },
        { label: "贴脸输出，无法忽略", value: -13 },
        { label: "已经开始替我写检讨", value: -22 },
      ],
    },
    {
      id: "weekend",
      dimension: "周末幻想",
      title: "你现在对周末的想象是？",
      options: [
        { label: "安排满了，生活在线", value: 14 },
        { label: "睡觉为主，娱乐为辅", value: 4 },
        { label: "只想静音两天", value: -9 },
        { label: "周末也像工作缓冲区", value: -18 },
      ],
    },
  ],
  student: [
    {
      id: "class",
      dimension: "课堂在线",
      title: "今天上课灵魂在场吗？",
      options: [
        { label: "人在魂也在，罕见同步", value: 16 },
        { label: "听了一半，够意思了", value: 5 },
        { label: "人在教室，魂在被窝", value: -11 },
        { label: "点名时才短暂复活", value: -20 },
      ],
    },
    {
      id: "assignment",
      dimension: "作业库存",
      title: "作业库存现在多满？",
      options: [
        { label: "清爽，像刚删缓存", value: 15 },
        { label: "有几项，还能排队", value: 4 },
        { label: "堆起来了，开始压迫", value: -12 },
        { label: "已经形成地质层", value: -22 },
      ],
    },
    {
      id: "canteen",
      dimension: "食堂运气",
      title: "今天吃饭运气如何？",
      options: [
        { label: "吃到想吃的，人生回暖", value: 14 },
        { label: "正常填饱，问题不大", value: 4 },
        { label: "排队太久，热情冷却", value: -8 },
        { label: "饭比课还难抢", value: -17 },
      ],
    },
    {
      id: "group",
      dimension: "小组作业",
      title: "小组成员今天像什么？",
      options: [
        { label: "全员上线，值得载入史册", value: 17 },
        { label: "有人回复，已经感恩", value: 5 },
        { label: "已读不回，空气凝固", value: -13 },
        { label: "我像一个人组队", value: -22 },
      ],
    },
    {
      id: "wallet",
      dimension: "生活费电量",
      title: "生活费还能撑多久？",
      options: [
        { label: "月底前稳稳的", value: 15 },
        { label: "精打细算可活", value: 3 },
        { label: "开始和余额谈判", value: -12 },
        { label: "钱包进入省电模式", value: -21 },
      ],
    },
    {
      id: "roommate",
      dimension: "宿舍气候",
      title: "宿舍今天气氛如何？",
      options: [
        { label: "和谐得像样板间", value: 14 },
        { label: "正常，各活各的", value: 4 },
        { label: "有点微妙，空气会说话", value: -9 },
        { label: "耳机是最后的墙", value: -18 },
      ],
    },
    {
      id: "future",
      dimension: "未来焦虑",
      title: "想到未来，你的反应是？",
      options: [
        { label: "有方向，甚至想行动", value: 16 },
        { label: "有点慌，但能稳住", value: 4 },
        { label: "脑内打开十个岔路口", value: -12 },
        { label: "直接切换到睡眠模式", value: -20 },
      ],
    },
    {
      id: "phone",
      dimension: "手机吞噬",
      title: "今天被手机吃掉多久？",
      options: [
        { label: "控制得住，像个高手", value: 15 },
        { label: "一会儿一会儿，不算输", value: 3 },
        { label: "刷完才发现天黑了", value: -13 },
        { label: "手机才是我的专业课", value: -21 },
      ],
    },
  ],
  solo: [
    {
      id: "light",
      dimension: "开灯意愿",
      title: "回家后你会先开灯吗？",
      options: [
        { label: "会，房间立刻有人气", value: 14 },
        { label: "会，但先瘫一会儿", value: 3 },
        { label: "懒得开，黑暗很懂事", value: -11 },
        { label: "我和房间一起待机", value: -19 },
      ],
    },
    {
      id: "laundry",
      dimension: "家务堆积",
      title: "脏衣篓现在什么状态？",
      options: [
        { label: "清空了，文明延续", value: 16 },
        { label: "有一点，能控制", value: 5 },
        { label: "快满了，开始沉默", value: -10 },
        { label: "已经有自己的生态", value: -20 },
      ],
    },
    {
      id: "delivery",
      dimension: "外卖依赖",
      title: "今天外卖软件打开几次？",
      options: [
        { label: "0 次，自己做饭了", value: 18 },
        { label: "1 次，合理补给", value: 5 },
        { label: "3 次，选择困难", value: -9 },
        { label: "像在和外卖谈恋爱", value: -18 },
      ],
    },
    {
      id: "silence",
      dimension: "沉默浓度",
      title: "房间安静到什么程度？",
      options: [
        { label: "刚好舒服，脑子变慢", value: 14 },
        { label: "有点安静，但还行", value: 2 },
        { label: "能听见自己的焦虑", value: -13 },
        { label: "安静得像系统后台", value: -20 },
      ],
    },
    {
      id: "plants",
      dimension: "生活证据",
      title: "你最近照顾过什么吗？",
      options: [
        { label: "有，植物/宠物/自己都还行", value: 16 },
        { label: "勉强照顾了自己", value: 5 },
        { label: "水杯都忘了洗", value: -10 },
        { label: "别问，万物自生自灭", value: -19 },
      ],
    },
    {
      id: "weeknight",
      dimension: "深夜脑内",
      title: "深夜脑子最爱播放什么？",
      options: [
        { label: "明天计划，挺健康", value: 14 },
        { label: "随机回忆，正常波动", value: 2 },
        { label: "人生复盘，越盘越乱", value: -13 },
        { label: "所有尴尬瞬间合集", value: -21 },
      ],
    },
    {
      id: "trash",
      dimension: "垃圾袋预警",
      title: "垃圾袋现在提醒你了吗？",
      options: [
        { label: "已经扔了，轻盈", value: 14 },
        { label: "还好，明天也行", value: 3 },
        { label: "在门口无声控诉", value: -10 },
        { label: "快成为室友了", value: -18 },
      ],
    },
    {
      id: "call",
      dimension: "联系外界",
      title: "现在有人给你打电话，你会？",
      options: [
        { label: "接，正好说说话", value: 15 },
        { label: "看是谁再决定", value: 4 },
        { label: "等它自己停", value: -10 },
        { label: "手机和我都静音", value: -19 },
      ],
    },
  ],
  freelance: [
    {
      id: "invoice",
      dimension: "收款进度",
      title: "最近一笔款到哪了？",
      options: [
        { label: "已到账，空气都甜", value: 18 },
        { label: "流程中，还能等", value: 5 },
        { label: "对方说快了，我也快没了", value: -13 },
        { label: "我在给甲方做慈善", value: -22 },
      ],
    },
    {
      id: "brief",
      dimension: "需求清晰度",
      title: "客户需求像什么？",
      options: [
        { label: "像说明书，清楚", value: 16 },
        { label: "像聊天记录，能猜", value: 3 },
        { label: "像谜语，需要通灵", value: -13 },
        { label: "像许愿池，什么都想要", value: -22 },
      ],
    },
    {
      id: "workspace",
      dimension: "工作空间",
      title: "你的工作区现在如何？",
      options: [
        { label: "整洁，像要赚钱", value: 15 },
        { label: "可用，有点乱", value: 4 },
        { label: "文件和杯子混战", value: -10 },
        { label: "桌面像项目废墟", value: -20 },
      ],
    },
    {
      id: "pricing",
      dimension: "报价底气",
      title: "这次报价你敢加价吗？",
      options: [
        { label: "敢，我值这个价", value: 17 },
        { label: "小加一点试试", value: 5 },
        { label: "怕跑单，先忍", value: -10 },
        { label: "客户还没砍，我先自砍", value: -21 },
      ],
    },
    {
      id: "pipeline",
      dimension: "机会储备",
      title: "潜在客户池现在有多满？",
      options: [
        { label: "很满，安全感在线", value: 16 },
        { label: "有几个，还能周转", value: 4 },
        { label: "快见底，开始刷新", value: -12 },
        { label: "全靠玄学推荐", value: -21 },
      ],
    },
    {
      id: "revision",
      dimension: "修改次数",
      title: "今天被改稿了吗？",
      options: [
        { label: "没有，世界和平", value: 16 },
        { label: "小改，能接受", value: 5 },
        { label: "改了几轮，眼神变空", value: -12 },
        { label: "改到不认识自己作品", value: -22 },
      ],
    },
    {
      id: "rest",
      dimension: "休息合法性",
      title: "你休息时会愧疚吗？",
      options: [
        { label: "不会，休息也是生产力", value: 15 },
        { label: "有一点，但能放下", value: 4 },
        { label: "躺着也像欠进度", value: -12 },
        { label: "自由职业，自由焦虑", value: -21 },
      ],
    },
    {
      id: "tool",
      dimension: "工具依赖",
      title: "今天工具帮到你了吗？",
      options: [
        { label: "帮大忙，效率起飞", value: 14 },
        { label: "有点用，还行", value: 4 },
        { label: "工具很多，开始分心", value: -9 },
        { label: "我在管理工具，不是工作", value: -18 },
      ],
    },
  ],
};

const roasts = {
  high: [
    "你今天的精神状态不像活着，像刚完成系统升级。请珍惜，这种版本不常见。",
    "你的灵魂不仅在线，还开了会员。建议低调一点，别刺激旁边的人。",
    "你像一杯没有冰化掉的奶茶，稀有、完整、暂时未被生活摇匀。",
  ],
  mid: [
    "你今天属于可用状态，虽然风扇有点响，但机器还没冒烟。",
    "你的精神电量很普通，普通到适合继续被安排一点不普通的事。",
    "看得出来你在努力活着，也看得出来努力本身快把你耗没了。",
  ],
  low: [
    "你不是没电，你是被生活拔了插头还在假装蓝牙连接。",
    "你今天的状态像会议里的摄像头：显示在线，实际人早走了。",
    "系统检测到你正在以最低亮度运行人生，建议先别打开余额和聊天记录。",
  ],
};

const shareLines = {
  soft: {
    high: "今天状态居然还不错，值得截图纪念一下。",
    mid: "今天也算撑住了，允许自己慢慢恢复。",
    low: "今天电量偏低，先别和世界硬碰硬。",
  },
  sharp: {
    high: "今天精神存活指数在线，像刚升级过的人类样本。",
    mid: "今天精神状态没坏透，但已经需要轻拿轻放。",
    low: "今天不是没电，是被生活拔了插头还在假装联网。",
  },
  black: {
    high: "今日检测：本人暂未掉线，甚至有点冒犯命运。",
    mid: "今日检测：肉体仍在服务区，灵魂正在排队补票。",
    low: "今日检测：本人低亮度运行，请世界先小声一点。",
  },
};

const advice = {
  high: [
    "趁状态还行，处理一件拖了最久的小事，然后立刻奖励自己。",
    "今天适合推进计划，不适合替所有人承担世界。",
    "保持这个能量，但别把自己借给太多人使用。",
  ],
  mid: [
    "少开一个群，少回一句废话，多喝一口真正有用的水。",
    "把今天目标砍半，完成后就算赢。人生不是 KPI 周报。",
    "别急着证明自己正常，能正常吃饭已经很有含金量。",
  ],
  low: [
    "先睡、先吃、先洗澡。重大人生决定请推迟到血糖恢复后。",
    "今天不适合硬刚世界，适合把手机静音 20 分钟。",
    "别打开招聘软件和前任朋友圈，它们都不属于急救用品。",
  ],
};

const titles = [
  "肉体上班，灵魂请假",
  "看似正常，实则离线",
  "心态稳定地崩着",
  "人还在，魂稍后回电",
  "低电量营业中",
  "今日未掉线，但有划痕",
];

const dateKey = formatDateKey(new Date());

const startView = qs("#startView");
const quizView = qs("#quizView");
const resultView = qs("#resultView");
const setupForm = qs("#setupForm");
const questionCounter = qs("#questionCounter");
const progressBar = qs("#progressBar");
const questionTitle = qs("#questionTitle");
const questionDimension = qs("#questionDimension");
const optionGrid = qs("#optionGrid");
const toast = qs("#toast");
const premiumModal = qs("#premiumModal");
const answerFeedback = qs("#answerFeedback");

const urlParams = new URLSearchParams(window.location.search);
state.entryShareId = urlParams.get("s") || urlParams.get("shareId") || "";
state.shareId = createId("share");

init();

function init() {
  document.documentElement.style.setProperty("--theme-color", themes[state.activeTheme].color);
  renderThemeButtons();
  renderAtmosphere();
  hydrateStats();
  qs("#sampleDate").textContent = formatDate(new Date());
  setTopbarStatus("今日题库待生成");
  renderDesktopQr();
  updateRailShare();
  updateSampleTheme();
  updatePremiumState();
  sendEvent("view_start", {
    source: state.entryShareId ? "share_link" : "direct",
    action: "page_view",
  });

  setupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setTopbarStatus("题库准备中");
    const theme = themes[state.activeTheme];
    state.profile = {
      city: qs("#city").value,
      mood: qs("#mood").value,
      themeId: state.activeTheme,
      persona: theme.label,
      theme,
    };
    state.answers = [];
    state.index = 0;
    state.copySeed = 0;
    state.result = null;
    state.aiStatus = "idle";
    state.qrDataUrl = "";
    state.qrImage = null;
    state.questionSource = "local";
    state.questions = selectLocalQuestions(state.activeTheme, 5);
    await hydrateQuestionPool();
    showQuiz();
  });

  qs("#city").addEventListener("change", () => {
    updateSampleTheme();
    sendEvent("select_city", { city: qs("#city").value });
  });

  qs("#mood").addEventListener("change", () => {
    updateSampleTheme();
    sendEvent("select_mood", { action: qs("#mood").value });
  });

  qs("#prevQuestionBtn").addEventListener("click", goPreviousQuestion);

  qs("#againBtn").addEventListener("click", () => {
    state.answers = [];
    state.index = 0;
    resultView.classList.add("hidden");
    startView.classList.remove("hidden");
    setTopbarStatus("今日题库已准备");
    sendEvent("restart_test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  qs("#copyShareBtn").addEventListener("click", copyShareText);
  qs("#desktopCopyBtn").addEventListener("click", copyDesktopLink);
  qs("#saveImageBtn").addEventListener("click", saveShareImage);
  qs("#premiumBtn").addEventListener("click", openPremiumModal);
  qs("#closePremiumBtn").addEventListener("click", closePremiumModal);
  qs("#reservePremiumBtn").addEventListener("click", reservePremium);
  qs("#copyCodeBtn").addEventListener("click", copyPremiumCode);
  qs("#wechatPayBtn").addEventListener("click", openPaymentProvider);
  qs("#refreshCopyBtn").addEventListener("click", () => {
    state.copySeed += 1;
    updateShareCopy();
    updatePosterPreview();
    sendEvent("result_share_intent", { action: "refresh_copy" });
  });

  premiumModal.addEventListener("click", (event) => {
    if (event.target === premiumModal) closePremiumModal();
  });

  window.addEventListener("beforeunload", () => {
    if (!quizView.classList.contains("hidden") && state.answers.length < state.questions.length) {
      sendEvent("quiz_abandon", {
        question: state.questions[state.index]?.id,
        elapsedMs: Date.now() - state.questionStartedAt,
      });
    }
  });
}

function renderThemeButtons() {
  const themeGrid = qs("#themeGrid");
  themeGrid.innerHTML = "";
  Object.entries(themes).forEach(([id, theme]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `theme-button${id === state.activeTheme ? " active" : ""}`;
    button.style.setProperty("--theme-color", theme.color);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", id === state.activeTheme ? "true" : "false");
    button.innerHTML = `<strong>${theme.label}</strong><span>${theme.short}</span>`;
    button.addEventListener("click", () => {
      state.activeTheme = id;
      document.documentElement.style.setProperty("--theme-color", theme.color);
      renderThemeButtons();
      updateSampleTheme();
      sendEvent("select_theme", { theme: id });
    });
    themeGrid.appendChild(button);
  });
}

function renderPosterControls() {
  renderSwitch("#templateSwitch", posterTemplates, state.posterTemplate, (id) => {
    state.posterTemplate = id;
    qs("#posterOutput").classList.add("hidden");
    updatePosterPreview();
    sendEvent("poster_template_change", { template: id });
  });
  renderSwitch("#toneSwitch", toneOptions, state.tone, (id) => {
    state.tone = id;
    qs("#posterOutput").classList.add("hidden");
    updateShareCopy();
    updatePosterPreview();
    sendEvent("tone_change", { tone: id });
  });
}

function renderSwitch(selector, options, activeValue, onSelect) {
  const root = qs(selector);
  root.innerHTML = "";
  Object.entries(options).forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip-button${id === activeValue ? " active" : ""}`;
    button.setAttribute("aria-pressed", id === activeValue ? "true" : "false");
    button.textContent = label;
    button.addEventListener("click", () => {
      onSelect(id);
      renderPosterControls();
    });
    root.appendChild(button);
  });
}

function renderAtmosphere() {
  const seed = hash(dateKey);
  state.stats = {
    source: "baseline",
    tests: 320 + (seed % 620),
    average: 39 + (seed % 23),
    activeCity: themes.worker.hotLine,
    saves: 26 + (seed % 80),
    reservations: 8 + (seed % 32),
  };
  renderStats();
}

async function hydrateStats() {
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) return;
    const data = await response.json();
    state.stats = { ...state.stats, ...data };
    renderStats();
  } catch {
    // Keep the local daily baseline if stats are unavailable.
  }
}

function updateSampleTheme() {
  const theme = themes[state.activeTheme];
  const city = qs("#city")?.value || state.stats.activeCity || theme.hotLine;
  const seed = hash(`${dateKey}:${state.activeTheme}:${city}`);
  const sampleScore = clamp(29 + (seed % 43), 17, 88);
  const sampleBeat = clamp(Math.round(sampleScore * 0.72 + (seed % 18)), 8, 96);
  const sampleTitles = ["低电量营业中", "人还在，魂稍后回电", "今日轻度冒烟", "看似正常，实则离线"];
  const sampleTexts = [
    "系统检测到你正在以低亮度运行人生。",
    "今日状态适合轻拿轻放，别让通知把你摇醒。",
    "这不是崩，这是生活后台占用太高。",
    "看起来还行，细看已经需要一杯热的。",
  ];
  qs("#sampleScore").textContent = sampleScore;
  qs("#sampleTitle").textContent = pick(sampleTitles, seed);
  qs("#sampleText").textContent = pick(sampleTexts, seed + 3);
  qs("#samplePersona").textContent = `${city}${theme.label}`;
  qs("#sampleBeat").textContent = `今日同城样本击败 ${sampleBeat}%`;
}

function renderStats() {
  setText("#todayTests", state.stats.tests);
  setText("#todayAverage", state.stats.average);
  setText("#hotCity", state.stats.activeCity || themes[state.activeTheme].hotLine);
  setText("#premiumCount", state.stats.reservations || 128 + (hash(dateKey) % 260));
  setText("#railTests", state.stats.tests);
  setText("#railSaves", state.stats.saves);
  setText("#railReservations", state.stats.reservations);
  qs("#sampleNote").textContent =
    state.stats.source === "redis" ? "今日样本 = 冷启动基数 + 真实完成量" : "今日样本使用本地冷启动基数";
  updateSampleTheme();
}

function showQuiz() {
  startView.classList.add("hidden");
  resultView.classList.add("hidden");
  quizView.classList.remove("hidden");
  qs("#posterOutput").classList.add("hidden");
  qs("#quizMeta").textContent = `${state.profile.city} / ${state.profile.persona} / ${getQuestionSourceLabel()}`;
  setTopbarStatus(getQuestionSourceLabel());
  document.documentElement.style.setProperty("--theme-color", state.profile.theme.color);
  renderQuestion();
  sendEvent("start_test", { source: state.questionSource });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectLocalQuestions(themeId, count) {
  const base = themes[themeId]?.questions || themes.worker.questions;
  const extras = extraQuestionBank[themeId] || [];
  return selectDailyQuestions([...base, ...extras], count, `${dateKey}:${themeId}:local`);
}

function selectDailyQuestions(pool, count, seedText) {
  const copy = pool.map((question) => ({
    ...question,
    options: [...question.options].sort((a, b) => hash(`${seedText}:${question.id}:${a.label}`) - hash(`${seedText}:${question.id}:${b.label}`)),
  }));
  copy.sort((a, b) => hash(`${seedText}:${a.id}`) - hash(`${seedText}:${b.id}`));
  return copy.slice(0, count);
}

async function hydrateQuestionPool() {
  try {
    const response = await fetch(`/api/questions?theme=${encodeURIComponent(state.activeTheme)}&city=${encodeURIComponent(state.profile.city)}`);
    if (!response.ok) {
      state.questionSource = "local";
      setTopbarStatus("本地题库兜底");
      return;
    }
    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length < 5) {
      state.questionSource = "local";
      setTopbarStatus("本地题库兜底");
      return;
    }
    state.questions = selectDailyQuestions(data.questions, 5, `${dateKey}:${state.activeTheme}:ai:${state.profile.city}`);
    state.questionSource = data.source === "cache" ? "ai" : data.source || "ai";
    setTopbarStatus(data.source === "deepseek" ? "今日题库已更新" : "今日题库已准备");
    sendEvent("question_pool_source", { source: state.questionSource });
  } catch {
    state.questionSource = "local";
    setTopbarStatus("本地题库兜底");
    sendEvent("question_pool_source", { source: "local" });
  }
}

function renderQuestion() {
  const question = state.questions[state.index];
  questionCounter.textContent = `${state.index + 1}/${state.questions.length}`;
  qs("#prevQuestionBtn").disabled = state.index === 0;
  setTopbarStatus(getQuestionSourceLabel());
  progressBar.style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  qs("#progressMood").textContent = buildProgressMood();
  questionDimension.textContent = question.dimension;
  questionTitle.textContent = question.title;
  optionGrid.innerHTML = "";
  answerFeedback.classList.add("hidden");
  state.questionStartedAt = Date.now();
  sendEvent("question_view", { question: question.id, action: `${state.index + 1}/${state.questions.length}` });

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      handleAnswer(question, option);
    });
    optionGrid.appendChild(button);
  });
}

function handleAnswer(question, option) {
  const elapsedMs = Date.now() - state.questionStartedAt;
  state.answers[state.index] = { question: question.id, dimension: question.dimension, ...option };
  answerFeedback.textContent = buildAnswerFeedback(option.value);
  answerFeedback.classList.remove("hidden");
  [...optionGrid.querySelectorAll("button")].forEach((button) => {
    button.disabled = true;
  });
  sendEvent("answer_choice", {
    question: question.id,
    answer: option.label,
    score: option.value,
    elapsedMs,
  });
  window.setTimeout(() => {
    if (state.index === state.questions.length - 1) {
      showResult();
    } else {
      state.index += 1;
      renderQuestion();
    }
  }, 520);
}

function goPreviousQuestion() {
  if (state.index === 0) return;
  state.answers = state.answers.slice(0, state.index - 1);
  state.index -= 1;
  sendEvent("answer_choice", { action: "go_previous", question: state.questions[state.index]?.id });
  renderQuestion();
}

function getQuestionSourceLabel() {
  if (state.questionSource === "deepseek") return "今日题库已更新";
  if (state.questionSource === "ai" || state.questionSource === "cache") return "今日题库已准备";
  return "本地题库兜底";
}

function buildProgressMood() {
  const percent = (state.index + 1) / state.questions.length;
  if (percent <= 0.25) return "正在扫描今日电量";
  if (percent <= 0.5) return "系统开始闻到一点冒烟";
  if (percent <= 0.8) return "报告正在成形";
  return "马上生成可分享报告";
}

function buildAnswerFeedback(value) {
  if (value >= 12) return `+${value} 电量回升`;
  if (value >= 0) return `+${value} 维持运行`;
  if (value <= -18) return `${value} 高压信号`;
  return `${value} 轻度冒烟`;
}

function showResult() {
  quizView.classList.add("hidden");
  resultView.classList.remove("hidden");
  state.result = calculateResult();
  setTopbarStatus("报告完成");
  renderResult(state.result);
  renderPosterControls();
  updatePosterPreview();
  persistVisit(state.result);
  sendEvent("result_view", { score: state.result.score, scoreBucket: state.result.scoreBucket });
  sendEvent("complete_test", { score: state.result.score, scoreBucket: state.result.scoreBucket });
  hydrateAiResult();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setTopbarStatus(text) {
  const target = qs("#topbarStatus");
  if (target) target.textContent = text;
}

function calculateResult() {
  const profile = state.profile;
  const signature = buildAnswerSignature(state.answers);
  const dailySalt = hash(`${dateKey}-${profile.city}-${profile.persona}`) % 17;
  const weighted = state.answers.reduce((sum, item, index) => {
    const weight = 0.88 + (hash(`${dateKey}:${item.question}:${index}`) % 25) / 100;
    return sum + Math.round(item.value * weight);
  }, 48);
  const rawScore = clamp(weighted + dailySalt - 8 + buildCombinationModifier(state.answers), 3, 98);
  const score = clamp(rawScore, 17, 98);
  const tier = score >= 68 ? "high" : score >= 36 ? "mid" : "low";
  const seed = hash(`${dateKey}-${profile.city}-${profile.persona}-${score}-${signature}`);
  const rankSample = Number(state.stats.tests || 0);
  const cityBeat = clamp(Math.round(score * 0.72 + (seed % 19) - 4), 3, 97);
  const personaBeat = clamp(Math.round(score * 0.67 + (seed % 23) - 7), 3, 97);
  const title = score < 30 ? pick(titles.slice(2), seed) : profile.mood;

  return {
    ...profile,
    rawScore,
    score,
    scoreBucket: Math.floor(score / 10) * 10,
    answerSignature: signature,
    tier,
    title,
    cityBeat,
    personaBeat,
    rankSample,
    personaTag: buildPersonaTag(profile, tier, seed),
    riskStamp: score >= 68 ? "状态在线" : score >= 36 ? "轻度冒烟" : profile.theme.risk,
    roast: pick(roasts[tier], seed + 3),
    advice: pick(advice[tier], seed + 9),
    cause: pick(profile.theme.causes, seed + 14),
    revive: pick(profile.theme.revives, seed + 20),
    premiumPeek: buildPremiumPeek(profile, seed),
    diagnosis: buildDiagnosis(score, seed),
    shareLine: buildShareLine(score, profile.city, profile.persona, tier),
  };
}

function renderResult(result) {
  document.documentElement.style.setProperty("--theme-color", result.theme.color);
  qs("#reportTheme").textContent = `${result.persona}精神存活报告`;
  qs("#reportDate").textContent = formatDate(new Date());
  qs("#scoreValue").textContent = result.score;
  qs("#scoreRing").style.setProperty("--score-deg", `${result.score * 3.6}deg`);
  qs("#riskStamp").textContent = result.riskStamp;
  qs("#reportStatus").textContent = result.title;
  qs("#personaTag").textContent = result.personaTag;
  qs("#reportRoast").textContent = result.roast;
  qs("#cityRank").textContent = `${result.cityBeat}%`;
  qs("#cityRankLabel").textContent = `${result.city}今日同城样本击败`;
  qs("#personaRank").textContent = `${result.personaBeat}%`;
  qs("#personaRankLabel").textContent = `${result.persona}今日同类样本击败`;
  qs("#rankFootnote").textContent = `今日样本 ${result.rankSample || state.stats.tests || "--"} 份，排名仅作娱乐比较`;
  qs("#causeText").textContent = result.cause;
  qs("#reviveText").textContent = result.revive;
  qs("#adviceText").textContent = result.advice;
  qs("#premiumPeekText").textContent = result.premiumPeek;
  qs("#tomorrowHook").textContent = result.theme.tomorrow;
  renderDiagnosis(result);
  updateShareCopy();
}

function renderDiagnosis(result) {
  qs("#diagnosisGrid").innerHTML = result.diagnosis
    .map(
      (item) => `
        <div class="diagnosis-item">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <div class="diagnosis-meter"><i style="--meter: ${item.percent}%"></i></div>
        </div>
      `,
    )
    .join("");
}

function updateShareCopy() {
  if (!state.result) return;
  state.result.shareLine = getShareLine(state.result);
  qs("#shareCopy").textContent = state.result.shareLine;
}

async function updatePosterPreview() {
  if (!state.result) return;
  await ensureShareQr();
  const canvas = drawShareCanvas(state.result, state.posterTemplate);
  const preview = qs("#posterPreview");
  const ctx = preview.getContext("2d");
  ctx.clearRect(0, 0, preview.width, preview.height);
  ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
}

async function copyShareText() {
  const text = buildShareText(state.result);
  const copied = await writeClipboard(text);
  if (copied) {
    showToast("分享文案已复制");
    sendEvent("copy_share_success", { template: state.posterTemplate, tone: state.tone });
    sendEvent("result_share_intent", { action: "copy_share" });
  } else {
    showToast(text);
    sendEvent("copy_share_fail", { template: state.posterTemplate, tone: state.tone });
  }
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy copy path for browsers with stricter permissions.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-999px";
  textarea.style.left = "-999px";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

async function saveShareImage() {
  try {
    await ensureShareQr();
    const canvas = drawShareCanvas(state.result, state.posterTemplate);
    const url = canvas.toDataURL("image/png");
    qs("#posterImage").src = url;
    qs("#posterOutput").classList.remove("hidden");
    const link = document.createElement("a");
    link.download = `活着么-${dateKey}-${state.shareId}.png`;
    link.href = url;
    link.click();
    showToast("报告图已生成，已打开长按保存图");
    sendEvent("save_poster_success", { template: state.posterTemplate, tone: state.tone });
    sendEvent("save_poster", { template: state.posterTemplate, tone: state.tone });
    sendEvent("result_share_intent", { action: "save_poster" });
  } catch {
    showToast("保存受限，已保留预览图，可截图分享");
    sendEvent("save_poster_fail", { template: state.posterTemplate, tone: state.tone });
  }
}

function openPremiumModal() {
  premiumModal.classList.remove("hidden");
  sendEvent("open_premium", { score: state.result?.score, scoreBucket: state.result?.scoreBucket });
}

function closePremiumModal() {
  premiumModal.classList.add("hidden");
}

function reservePremium() {
  if (state.reservedPremium) return;
  state.reservedPremium = true;
  localStorage.setItem("huozheme:premium-interest", new Date().toISOString());
  const nextReservations = Number(state.stats.reservations || 0) + 1;
  state.stats = { ...state.stats, reservations: nextReservations };
  renderStats();
  updatePremiumState();
  closePremiumModal();
  showToast("已锁定 9.9 内测价，隐藏结局候补资格保留。");
  sendEvent("lock_price_click", { score: state.result?.score, scoreBucket: state.result?.scoreBucket });
  sendEvent("reserve_premium", { score: state.result?.score, scoreBucket: state.result?.scoreBucket });
}

async function copyPremiumCode() {
  const code = `活着么内测口令：${state.shareId.toUpperCase()}，我想解锁年度精神账单`;
  const copied = await writeClipboard(code);
  showToast(copied ? "内测口令已复制" : code);
  sendEvent("payment_provider_click", { action: "copy_premium_code" });
}

function openPaymentProvider() {
  showToast("微信 9.9 通道已预留，先为你锁定今日内测价。");
  sendEvent("payment_provider_click", { action: "wechat_reserved", score: state.result?.score });
}

function updatePremiumState() {
  state.reservedPremium = Boolean(localStorage.getItem("huozheme:premium-interest"));
  const premiumBtn = qs("#premiumBtn");
  const reserveBtn = qs("#reservePremiumBtn");
  if (premiumBtn) premiumBtn.textContent = state.reservedPremium ? "已锁定 9.9 内测价" : "9.9 解锁隐藏结局";
  if (reserveBtn) {
    reserveBtn.textContent = state.reservedPremium ? "已锁定今日内测价" : "锁定 9.9 内测价";
    reserveBtn.disabled = state.reservedPremium;
  }
}

function getShareLine(result) {
  const aiLines = result.aiShareLines?.[state.tone];
  if (Array.isArray(aiLines) && aiLines.length) {
    return aiLines[state.copySeed % aiLines.length];
  }
  return buildShareLine(result.score, result.city, result.persona, result.tier);
}

function buildShareLine(score, city, persona, tier) {
  const base = shareLines[state.tone][tier];
  const variants = [
    `我今天精神存活指数 ${score}，${base}`,
    `${city}${persona}今日样本：精神存活指数 ${score}。${base}`,
    `刚测完《活着么》：${score}/100。${base}`,
  ];
  return variants[state.copySeed % variants.length];
}

function buildShareUrl(source = "poster") {
  const url = new URL(location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("s", state.shareId);
  url.searchParams.set("from", source);
  return url.toString();
}

function buildDisplayLink() {
  const url = new URL(buildShareUrl("desktop"));
  return `${url.host}${url.pathname}?s=${state.shareId}`;
}

async function ensureShareQr() {
  if (state.qrImage || !state.result) return;
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1400);
    const response = await fetch(`/api/qr?data=${encodeURIComponent(buildShareUrl("poster"))}`, {
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (!response.ok) return;
    const data = await response.json();
    if (!data.dataUrl) return;
    state.qrDataUrl = data.dataUrl;
    state.qrImage = await loadImage(data.dataUrl);
  } catch {
    state.qrDataUrl = "";
    state.qrImage = null;
  }
}

async function renderDesktopQr() {
  const root = qs("#desktopQr");
  renderMiniQr(root, state.shareId);
  try {
    const response = await fetch(`/api/qr?data=${encodeURIComponent(buildShareUrl("desktop"))}`);
    if (!response.ok) return;
    const data = await response.json();
    if (!data.dataUrl) return;
    root.classList.add("has-image");
    root.innerHTML = `<img src="${data.dataUrl}" alt="当前页面分享二维码" />`;
  } catch {
    renderMiniQr(root, state.shareId);
  }
}

async function copyDesktopLink() {
  const link = buildShareUrl("desktop");
  const copied = await writeClipboard(link);
  showToast(copied ? "链接已复制，可以发给朋友了" : link);
  sendEvent(copied ? "copy_share_success" : "copy_share_fail", {
    action: "desktop_copy_link",
    source: "desktop_rail",
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function hydrateAiResult() {
  if (!state.result || state.aiStatus === "loading") return;
  state.aiStatus = "loading";
  showToast("正在请求 AI 生成更细的报告…");
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          city: state.profile.city,
          persona: state.profile.persona,
          themeId: state.profile.themeId,
          mood: state.profile.mood,
        },
        answers: state.answers.map(({ question, dimension, label, value }) => ({
          question,
          dimension,
          label,
          value,
        })),
        baseResult: {
          score: state.result.score,
          rawScore: state.result.rawScore,
          tier: state.result.tier,
          title: state.result.title,
          cause: state.result.cause,
          revive: state.result.revive,
          answerSignature: state.result.answerSignature,
        },
      }),
    });

    if (!response.ok) throw new Error("ai_api_failed");
    const data = await response.json();
    if (!data.result) {
      state.aiStatus = "fallback";
      sendEvent("ai_result_fallback", { scoreBucket: state.result.scoreBucket });
      return;
    }

    applyAiResult(data.result);
    state.aiStatus = data.source || "deepseek";
    sendEvent("ai_result_applied", { source: state.aiStatus, scoreBucket: state.result.scoreBucket });
    showToast(data.source === "cache" ? "已加载今日 AI 内容池" : "AI 报告已刷新");
  } catch {
    state.aiStatus = "fallback";
    sendEvent("ai_result_fallback", { scoreBucket: state.result?.scoreBucket });
  }
}

function applyAiResult(aiResult) {
  state.result = {
    ...state.result,
    title: aiResult.title || state.result.title,
    roast: aiResult.roast || state.result.roast,
    advice: aiResult.advice || state.result.advice,
    cause: aiResult.cause || state.result.cause,
    revive: aiResult.revive || state.result.revive,
    premiumPeek: aiResult.premiumPeek || state.result.premiumPeek,
    aiShareLines: aiResult.shareLines || state.result.aiShareLines,
  };
  renderResult(state.result);
  updatePosterPreview();
}

function sendEvent(type, extra = {}) {
  const payload = {
    type,
    sessionId: state.sessionId,
    shareId: state.shareId,
    entryShareId: state.entryShareId,
    theme: extra.theme || state.profile?.themeId || state.activeTheme,
    city: extra.city || state.profile?.city || qs("#city")?.value,
    score: extra.score ?? state.result?.score,
    scoreBucket: extra.scoreBucket ?? state.result?.scoreBucket,
    template: extra.template,
    tone: extra.tone,
    source: extra.source,
    action: extra.action,
    question: extra.question,
    answer: extra.answer,
    elapsedMs: extra.elapsedMs,
    referrer: document.referrer,
    path: location.pathname,
    clientTime: new Date().toISOString(),
  };

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/event", blob);
      return;
    }
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics should never interrupt play.
  }
}

function buildShareText(result) {
  const shareUrl = buildShareUrl();
  return `《活着么》今日精神存活报告\n指数：${result.score}/100\n人设：${result.personaTag}\n今日故障点：${result.cause}\n${result.shareLine}\n${shareUrl}`;
}

function drawShareCanvas(result, template = "classic") {
  const canvas = qs("#shareCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, template === "xhs" ? "#2a1e26" : "#202329");
  gradient.addColorStop(0.58, template === "social" ? "#142024" : "#111317");
  gradient.addColorStop(1, "#0c0d0f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  drawGrid(ctx, w, h);
  drawCircle(ctx, 920, 190, 260, "rgba(255,107,87,.25)");
  drawCircle(ctx, 80, 990, 330, "rgba(84,214,209,.18)");
  drawCircle(ctx, 740, 1060, 210, hexToRgba(result.theme.color, 0.14));

  if (template === "xhs") {
    drawXhsRibbon(ctx, result.theme.color);
  }

  ctx.fillStyle = "#a7a8aa";
  ctx.font = "700 34px system-ui, sans-serif";
  drawCanvasLogo(ctx, 72, 66, 52);
  ctx.fillText(`${result.persona}精神存活报告`, 140, 104);
  ctx.textAlign = "right";
  ctx.fillText(`${formatDate(new Date())} #${state.shareId.toUpperCase()}`, w - 72, 104);
  ctx.textAlign = "left";

  ctx.fillStyle = "#f5f2e8";
  ctx.font = template === "social" ? "950 76px system-ui, sans-serif" : "950 86px system-ui, sans-serif";
  wrapText(ctx, result.title, 72, 245, w - 144, 98, 2);

  drawPill(ctx, 76, 342, result.personaTag, result.theme.color);

  drawScore(ctx, result.score, 540, 510, 158, result.theme.color);
  drawStamp(ctx, result.riskStamp, 710, 360);

  ctx.fillStyle = "#ddd7c7";
  ctx.font = "500 40px system-ui, sans-serif";
  wrapText(ctx, result.roast, 110, 780, w - 220, 58, 3);

  drawMetric(ctx, 92, 955, 420, 170, `${result.cityBeat}%`, `${result.city}同城样本击败`, result.theme.color);
  drawMetric(ctx, 568, 955, 420, 170, `${result.personaBeat}%`, `${result.persona}同类样本击败`, result.theme.color);

  drawInfoBox(ctx, 92, 1140, 420, 118, "今日故障点", result.cause);
  drawInfoBox(ctx, 568, 1140, 420, 118, "复活方式", result.revive);

  ctx.fillStyle = result.theme.color;
  ctx.font = "900 34px system-ui, sans-serif";
  ctx.fillText("适合发出去的那句", 72, 1300);
  ctx.fillStyle = "#f2efd7";
  ctx.font = "800 32px system-ui, sans-serif";
  wrapText(ctx, result.shareLine, 72, 1344, 690, 40, 2);
  drawQrBox(ctx, 824, 1264, 164, result.theme.color);

  ctx.fillStyle = "#a7a8aa";
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillText(buildDisplayLink(), 72, h - 24);
  ctx.textAlign = "right";
  ctx.fillText("扫码回测：活着么", w - 72, h - 24);
  ctx.textAlign = "left";

  return canvas;
}

function drawCanvasLogo(ctx, x, y, size) {
  ctx.save();
  roundRect(ctx, x, y, size, size, size * 0.24);
  ctx.fillStyle = "#101114";
  ctx.fill();
  ctx.lineWidth = Math.max(3, size * 0.055);
  ctx.strokeStyle = "#c7ff4f";
  ctx.stroke();

  ctx.strokeStyle = "#c7ff4f";
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.18);
  ctx.lineTo(x + size * 0.5, y + size * 0.36);
  ctx.stroke();

  ctx.strokeStyle = "#f5f2e8";
  ctx.lineWidth = size * 0.075;
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y + size * 0.54, size * 0.27, Math.PI * 0.72, Math.PI * 2.28);
  ctx.stroke();

  ctx.strokeStyle = "#54d6d1";
  ctx.lineWidth = size * 0.052;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y + size * 0.58);
  ctx.lineTo(x + size * 0.3, y + size * 0.58);
  ctx.lineTo(x + size * 0.38, y + size * 0.45);
  ctx.lineTo(x + size * 0.49, y + size * 0.68);
  ctx.lineTo(x + size * 0.58, y + size * 0.52);
  ctx.lineTo(x + size * 0.66, y + size * 0.58);
  ctx.lineTo(x + size * 0.86, y + size * 0.58);
  ctx.stroke();

  ctx.fillStyle = "#ff6b57";
  ctx.beginPath();
  ctx.arc(x + size * 0.78, y + size * 0.22, size * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawXhsRibbon(ctx, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(1080, 0);
  ctx.lineTo(1080, 92);
  ctx.lineTo(0, 34);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function buildDiagnosis(score, seed) {
  return [
    { label: "精神电量", value: `${score}%`, percent: score },
    { label: "离线风险", value: `${clamp(103 - score + (seed % 8), 6, 98)}%`, percent: clamp(103 - score + (seed % 8), 6, 98) },
    { label: "复活概率", value: `${clamp(score - 7 + (seed % 18), 4, 96)}%`, percent: clamp(score - 7 + (seed % 18), 4, 96) },
  ];
}

function buildAnswerSignature(answers) {
  return answers.map((item) => `${item.question}:${item.value}`).join("|");
}

function buildCombinationModifier(answers) {
  const negatives = answers.filter((item) => item.value <= -10).length;
  const positives = answers.filter((item) => item.value >= 12).length;
  const dimensions = answers
    .filter((item) => item.value <= -10)
    .map((item) => item.dimension)
    .join("|");
  let modifier = 0;
  if (negatives >= 4) modifier -= 6;
  if (positives >= 4) modifier += 5;
  if (/睡|夜|作息|昼夜/.test(dimensions) && /余额|现金|生活费|收款/.test(dimensions)) modifier -= 4;
  if (/社交|人类|联系/.test(dimensions) && negatives >= 3) modifier -= 3;
  return modifier;
}

function buildPersonaTag(profile, tier, seed) {
  const map = {
    worker: {
      high: ["准点下班幻想家", "会议免疫样本", "工位清醒派"],
      mid: ["轻度冒烟打工人", "工位低亮度运行者", "消息夹缝生存者"],
      low: ["通知过敏样本", "工位省电模式", "周报反噬幸存者"],
    },
    student: {
      high: ["DDL 反杀样本", "早八清醒派", "食堂运气持有者"],
      mid: ["课表夹缝生存者", "轻度拖延研究员", "宿舍低电量样本"],
      low: ["DDL 堆叠样本", "早八省电模式", "小组作业承重墙"],
    },
    solo: {
      high: ["房间秩序维护者", "热饭续命样本", "独居高亮度人类"],
      mid: ["房间静音观察员", "外卖备注交流者", "生活低速运行者"],
      low: ["深夜脑内会议主持", "房间省电模式", "开灯延迟样本"],
    },
    freelance: {
      high: ["尾款已到账样本", "边界感持有者", "报价底气在线"],
      mid: ["客户消息缓冲区", "现金流观察员", "自由但轻度焦虑"],
      low: ["改稿循环样本", "边界消失模式", "尾款召唤师"],
    },
  };
  return pick(map[profile.themeId]?.[tier] || map.worker.mid, seed);
}

function buildPremiumPeek(profile, seed) {
  const times = ["周一 10:30", "周三 23:40", "周五 18:02", "周日 02:16"];
  const symptoms = ["通知过敏", "余额心跳", "社交掉线", "ddl 追尾"];
  return `你的年度崩溃高峰可能出现在${pick(times, seed)}，主要症状是${pick(symptoms, seed + 5)}。`;
}

function drawGrid(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = "#ffffff";
  for (let x = 0; x < w; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCircle(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawScore(ctx, score, x, y, radius, color) {
  ctx.lineWidth = 34;
  ctx.strokeStyle = "rgba(255,255,255,.13)";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (score / 100));
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.textAlign = "center";
  ctx.fillStyle = "#f5f2e8";
  ctx.font = "950 138px system-ui, sans-serif";
  ctx.fillText(String(score), x, y + 26);
  ctx.fillStyle = "#a7a8aa";
  ctx.font = "900 30px system-ui, sans-serif";
  ctx.fillText("存活指数", x, y + 82);
  ctx.textAlign = "left";
}

function drawStamp(ctx, text, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.08);
  ctx.strokeStyle = "rgba(255,107,87,.68)";
  ctx.fillStyle = "rgba(255,107,87,.1)";
  roundRect(ctx, 0, 0, 230, 82, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ff6b57";
  ctx.font = "950 34px system-ui, sans-serif";
  ctx.fillText(text, 22, 52);
  ctx.restore();
}

function drawMetric(ctx, x, y, width, height, value, label, color) {
  roundRect(ctx, x, y, width, height, 20);
  ctx.fillStyle = "rgba(255,255,255,.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.15)";
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "950 70px system-ui, sans-serif";
  ctx.fillText(value, x + 34, y + 78);
  ctx.fillStyle = "#a7a8aa";
  ctx.font = "800 30px system-ui, sans-serif";
  ctx.fillText(label, x + 34, y + 126);
}

function drawInfoBox(ctx, x, y, width, height, label, value) {
  roundRect(ctx, x, y, width, height, 20);
  ctx.fillStyle = "rgba(255,255,255,.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.15)";
  ctx.stroke();
  ctx.fillStyle = "#a7a8aa";
  ctx.font = "800 26px system-ui, sans-serif";
  ctx.fillText(label, x + 28, y + 38);
  ctx.fillStyle = "#f5f2e8";
  ctx.font = "900 32px system-ui, sans-serif";
  wrapText(ctx, value, x + 28, y + 88, width - 56, 38, 1);
}

function drawPill(ctx, x, y, text, color) {
  ctx.save();
  ctx.font = "900 30px system-ui, sans-serif";
  const width = Math.min(520, ctx.measureText(text).width + 48);
  roundRect(ctx, x, y, width, 56, 28);
  ctx.fillStyle = hexToRgba(color, 0.16);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, 0.7);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, x + 24, y + 37);
  ctx.restore();
}

function drawQrBox(ctx, x, y, size, color) {
  ctx.save();
  roundRect(ctx, x, y, size, size, 20);
  ctx.fillStyle = "#f8f4e8";
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, 0.72);
  ctx.lineWidth = 6;
  ctx.stroke();
  if (state.qrImage) {
    ctx.drawImage(state.qrImage, x + 16, y + 16, size - 32, size - 32);
  } else {
    drawPseudoQr(ctx, x + 18, y + 18, size - 36, state.shareId);
  }
  ctx.restore();
}

function drawPseudoQr(ctx, x, y, size, seedText) {
  const cells = 13;
  const cell = size / cells;
  ctx.fillStyle = "#111317";
  drawFinder(ctx, x, y, cell);
  drawFinder(ctx, x + cell * 9, y, cell);
  drawFinder(ctx, x, y + cell * 9, cell);
  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const inFinder =
        (row < 4 && col < 4) ||
        (row < 4 && col > 8) ||
        (row > 8 && col < 4);
      if (inFinder) continue;
      if (hash(`${seedText}:${row}:${col}`) % 3 === 0) {
        ctx.fillRect(x + col * cell + 1, y + row * cell + 1, cell - 2, cell - 2);
      }
    }
  }
}

function drawFinder(ctx, x, y, cell) {
  ctx.fillRect(x, y, cell * 4, cell * 4);
  ctx.fillStyle = "#f8f4e8";
  ctx.fillRect(x + cell, y + cell, cell * 2, cell * 2);
  ctx.fillStyle = "#111317";
  ctx.fillRect(x + cell * 1.45, y + cell * 1.45, cell * 1.1, cell * 1.1);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const chars = [...text];
  let line = "";
  let lines = 1;
  chars.forEach((char) => {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
      lines += 1;
      if (lines > maxLines) {
        line = "";
      }
    } else if (lines <= maxLines) {
      line = testLine;
    }
  });
  if (line && lines <= maxLines) ctx.fillText(line, x, y);
}

function persistVisit(result) {
  const key = `huozheme:${dateKey}`;
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push({
    score: result.score,
    city: result.city,
    persona: result.persona,
    time: Date.now(),
  });
  localStorage.setItem(key, JSON.stringify(list.slice(-20)));
}

function updateRailShare() {
  setText("#railShareId", state.shareId.toUpperCase());
  setText("#railShortLink", buildDisplayLink());
}

function renderMiniQr(root, seedText) {
  if (!root) return;
  root.classList.remove("has-image");
  root.innerHTML = "";
  for (let index = 0; index < 81; index += 1) {
    const dot = document.createElement("i");
    const row = Math.floor(index / 9);
    const col = index % 9;
    const finder = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
    if (finder || hash(`${seedText}:${index}`) % 3 === 0) dot.className = "on";
    root.appendChild(dot);
  }
}

function setText(selector, value) {
  const target = qs(selector);
  if (target && value !== undefined && value !== null && value !== "") {
    target.textContent = String(value);
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${hash(`${prefix}:${new Date().toISOString()}:${Math.random()}`).toString(36).slice(0, 5)}`;
}

function pick(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hash(input) {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value << 5) - value + input.charCodeAt(index);
    value |= 0;
  }
  return Math.abs(value);
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatDate(date) {
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}
