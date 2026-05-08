const qs = (selector) => document.querySelector(selector);
const productionOrigin = "http://47.110.49.198";
const isFilePreview = window.location.protocol === "file:";

function apiUrl(path) {
  return isFilePreview ? `${productionOrigin}${path}` : path;
}

function getShareBaseUrl() {
  return isFilePreview ? `${productionOrigin}/` : window.location.href;
}

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
  entryTypeCode: "",
  entryVariant: "",
  questionStartedAt: 0,
  qrDataUrl: "",
  qrImage: null,
  qrUrl: "",
  posterRenderToken: 0,
  isSavingPoster: false,
  reservedPremium: false,
};

const shareQrCache = new Map();
let cityPickerScrollY = 0;

const cityGroups = [
  {
    label: "华北",
    cities: ["北京", "天津", "石家庄", "唐山", "保定", "邯郸", "廊坊", "秦皇岛", "沧州", "邢台", "太原", "呼和浩特", "包头", "鄂尔多斯"],
  },
  {
    label: "东北",
    cities: ["沈阳", "大连", "长春", "哈尔滨", "鞍山", "吉林", "大庆"],
  },
  {
    label: "华东",
    cities: [
      "上海",
      "南京",
      "苏州",
      "杭州",
      "宁波",
      "无锡",
      "常州",
      "南通",
      "徐州",
      "扬州",
      "镇江",
      "泰州",
      "盐城",
      "连云港",
      "宿迁",
      "淮安",
      "嘉兴",
      "绍兴",
      "温州",
      "金华",
      "台州",
      "湖州",
      "丽水",
      "合肥",
      "芜湖",
      "马鞍山",
      "滁州",
      "安庆",
      "福州",
      "厦门",
      "泉州",
      "漳州",
      "莆田",
      "济南",
      "青岛",
      "烟台",
      "潍坊",
      "临沂",
      "济宁",
      "淄博",
      "威海",
      "泰安",
    ],
  },
  {
    label: "华中",
    cities: ["武汉", "郑州", "长沙", "南昌", "洛阳", "新乡", "商丘", "许昌", "南阳", "襄阳", "宜昌", "荆州", "株洲", "岳阳", "衡阳", "常德", "九江", "赣州", "上饶", "宜春"],
  },
  {
    label: "华南",
    cities: ["广州", "深圳", "佛山", "东莞", "珠海", "中山", "惠州", "汕头", "江门", "湛江", "肇庆", "南宁", "桂林", "柳州", "海口", "三亚"],
  },
  {
    label: "西南",
    cities: ["重庆", "成都", "昆明", "贵阳", "绵阳", "南充", "宜宾", "遵义", "曲靖", "大理", "泸州", "德阳", "乐山"],
  },
  {
    label: "西北",
    cities: ["西安", "兰州", "银川", "西宁", "乌鲁木齐", "咸阳", "宝鸡", "榆林", "渭南", "天水"],
  },
];

const popularCities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "武汉", "南京", "苏州", "西安", "长沙"];
const cityPriority = [
  ...popularCities,
  "天津",
  "郑州",
  "东莞",
  "佛山",
  "宁波",
  "青岛",
  "合肥",
  "沈阳",
  "昆明",
  "无锡",
  "厦门",
  "济南",
  "福州",
  "温州",
  "大连",
  "长春",
  "哈尔滨",
  "石家庄",
  "南昌",
  "南宁",
  "贵阳",
  "太原",
  "乌鲁木齐",
  "常州",
  "南通",
  "泉州",
  "徐州",
  "烟台",
  "嘉兴",
  "绍兴",
  "珠海",
  "惠州",
  "中山",
  "台州",
  "金华",
  "兰州",
  "海口",
];

const posterTemplates = {
  classic: "简洁白卡",
  social: "彩虹屁卡",
  xhs: "红色低电卡",
};

const toneOptions = {
  soft: "轻吐槽",
  sharp: "够真实",
  black: "黑化版",
};

const identityAxes = [
  { key: "energy", letters: ["H", "L"], label: "能量", left: "高亮运行", right: "低亮省电" },
  { key: "trigger", letters: ["M", "D"], label: "触发", left: "消息触发", right: "截止触发" },
  { key: "social", letters: ["O", "I"], label: "社交", left: "在线接梗", right: "隐身保命" },
  { key: "recovery", letters: ["S", "R"], label: "回血", left: "睡眠回血", right: "出逃重启" },
  { key: "control", letters: ["P", "F"], label: "控制", left: "计划控场", right: "随缘漂流" },
  { key: "expression", letters: ["T", "N"], label: "表达", left: "吐槽外放", right: "内耗静音" },
  { key: "coping", letters: ["A", "W"], label: "应对", left: "自救行动", right: "等待奇迹" },
];

const identityCoreNames = {
  HMOS: "高亮接梗回血型",
  HMOR: "高亮场控重启型",
  HMIS: "高亮静音观察型",
  HMIR: "高亮边界维护型",
  HDOS: "任务反杀外放型",
  HDOR: "任务冲刺重启型",
  HDIS: "计划低噪幸存型",
  HDIR: "独行赶工重启型",
  LMOS: "低电量接梗型",
  LMOR: "低亮营业重启型",
  LMIS: "通知过敏省电型",
  LMIR: "深夜静音逃生型",
  LDOS: "拖延自嘲回血型",
  LDOR: "截止线边缘型",
  LDIS: "被窝防御型",
  LDIR: "人生后台重启型",
};

const identitySuffixNames = {
  PTA: "控场吐槽自救人",
  PTW: "控场吐槽许愿人",
  PNA: "计划静音自救人",
  PNW: "计划静音许愿人",
  FTA: "随缘吐槽自救人",
  FTW: "随缘吐槽许愿人",
  FNA: "随缘静音自救人",
  FNW: "随缘静音许愿人",
};

const identityVariants = {
  worker: ["工位低亮版", "会议后遗症版", "周报反噬版", "下班幻想版"],
  student: ["DDL 呼吸版", "早八残影版", "宿舍低电量版", "小组作业承重版"],
  solo: ["深夜离线版", "热饭续命版", "房间静音版", "外卖备注版"],
  freelance: ["尾款召唤版", "客户天气版", "自律重启版", "现金流心跳版"],
};

const simpleStatusTypes = {
  high: [
    { code: "A1", name: "发电机", line: "今天不但能转，还能带动一小片现场。" },
    { code: "A2", name: "小太阳", line: "今天亮得刚好，但别把自己晒干。" },
    { code: "A3", name: "稳压器", line: "事情有波动，你还能把自己稳住。" },
    { code: "A4", name: "热水壶", line: "慢慢升温，今天适合把一件事烧开。" },
  ],
  mid: [
    { code: "C1", name: "充电宝", line: "自己电量不多，还在给别人供电。" },
    { code: "C2", name: "小风扇", line: "一直在转，但风力已经调低。" },
    { code: "C3", name: "插线板", line: "一堆事都插在你身上，先拔掉一个。" },
    { code: "C4", name: "保温杯", line: "外面看着稳，里面还留着一点热气。" },
  ],
  low: [
    { code: "D1", name: "红电池", line: "电量已经见红，今天先别硬撑。" },
    { code: "D2", name: "省电灯", line: "还亮着，但已经自动进入省电模式。" },
    { code: "D3", name: "路由器", line: "大家都连着你，你自己的信号很差。" },
    { code: "D4", name: "暖宝宝", line: "还想让别人暖一点，自己快凉了。" },
  ],
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
    revives: ["洗个热水澡", "开灯五分钟", "写下一句废话"],
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
    "今天状态不错，像手机刚充到 86%，但别立刻开十个后台。",
    "你今天还挺能撑，适合处理一件小事，然后早点收工。",
    "今天不是满血，但比昨天更像个人。先别把自己借给所有人。",
  ],
  mid: [
    "你今天还能用，但别太用力。能把该做的做完一半，就算赢。",
    "你不是状态差，是今天的事情太会耗人。先把目标砍小一点。",
    "看得出来你在撑，也看得出来你不想解释。那就少解释一点。",
  ],
  low: [
    "你不是废，是今天真的有点费。先别和世界硬碰硬。",
    "今天适合低亮度营业。消息可以晚点回，人先别烧干。",
    "别急着振作，先吃点东西、喝口水、把通知关十分钟。",
  ],
};

const shareLines = {
  soft: {
    high: "今天状态居然还不错，值得留一张。",
    mid: "今天也算撑住了，允许自己慢慢恢复。",
    low: "今天电量偏低，先别和世界硬碰硬。",
  },
  sharp: {
    high: "今天状态在线，像刚给自己充过电。",
    mid: "今天精神状态没坏透，但已经需要轻拿轻放。",
    low: "今天不是没电，是被生活拔了插头还在假装联网。",
  },
  black: {
    high: "今天没掉线，甚至有点不合群地精神。",
    mid: "人还在服务区，心已经开始省电。",
    low: "本人低亮度运行，请世界先小声一点。",
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
    "别打开招聘软件和前任动态，它们都不属于急救用品。",
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

const themeBriefs = {
  worker: {
    copy: "用睡眠、通勤、会议、余额和下班概率，测你今天的打工状态。",
    tags: ["会议浓度", "通勤损耗", "余额心跳"],
    signals: ["下班幻想升温", "同步一下过敏", "周报反噬预警"],
    railFeed: ["工位观察：今天电量谁最低", "隐藏内容：谁能把你从工位捞出来", "今日话题：杭州打工人轻度冒烟"],
  },
  student: {
    copy: "用作息、DDL、考试、宿舍和生活费，测你今天的校园状态。",
    tags: ["DDL 压强", "早八耐受", "生活费电量"],
    signals: ["早八残影出现", "小组作业气压下降", "手机吞噬时间偏高"],
    railFeed: ["宿舍观察：谁还没开始写", "隐藏内容：谁能陪你一起赶 DDL", "今日话题：大学生精神电量抽检"],
  },
  solo: {
    copy: "用吃饭、房间、开灯、社交和深夜脑内活动，测你今天的独居状态。",
    tags: ["房间静音", "热饭概率", "人类连接"],
    signals: ["外卖备注含人量上升", "开灯延迟偏高", "深夜脑内会议预约中"],
    railFeed: ["今日提醒：先吃顿热的", "隐藏内容：谁最适合陪你沉默", "今日话题：独居人低亮度运行"],
  },
  freelance: {
    copy: "用客户消息、现金流、自律和边界感，测你今天的自由职业状态。",
    tags: ["客户扰动", "现金流心跳", "边界感"],
    signals: ["改稿循环开始发热", "尾款召唤仪式进行中", "自律系统需要重启"],
    railFeed: ["同行观察：今天谁先收款", "隐藏内容：谁能帮你稳住边界", "今日话题：自由职业者边界抽检"],
  },
};

const questionHints = [
  "选择后自动进入下一题，整套题约 10 秒。",
  "不用想太久，第一反应最像今天的你。",
  "题目每天会换，二刷不容易撞同一套。",
  "每个选择都会影响今日状态和电量。",
  "最后会生成一张今日状态小卡。",
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
state.entryTypeCode = normalizeTypeCode(urlParams.get("c") || "");
state.entryVariant = sanitizeParam(urlParams.get("v") || "");
state.shareId = createId("share");

init();

function init() {
  updateViewportHeight();
  mountGlobalOverlays();
  document.documentElement.style.setProperty("--theme-color", themes[state.activeTheme].color);
  renderCityOptions();
  bindCityPickerEvents();
  renderThemeButtons();
  renderAtmosphere();
  hydrateStats();
  qs("#sampleDate").textContent = formatDate(new Date());
  setTopbarStatus("今日可测");
  renderDesktopQr();
  updateRailShare();
  renderEntryChallenge();
  renderIdentityCodeProgress();
  updateThemeBrief();
  updateSampleTheme();
  updatePremiumState();
  sendEvent("view_start", {
    source: state.entryShareId ? "share_link" : "direct",
    action: "page_view",
  });

  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearToast();
    setTopbarStatus("进入测试");
    const submitButton = setupForm.querySelector("[data-testid='start-test']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "正在进入...";
      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = "开始测试";
      }, 700);
    }
    const theme = themes[state.activeTheme];
    state.profile = {
      city: getCityValue(),
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
    state.qrUrl = "";
    state.posterRenderToken += 1;
    state.questionSource = "local";
    state.questions = selectLocalQuestions(state.activeTheme, 5);
    showQuiz();
    hydrateQuestionPool({ applyToCurrentQuiz: false });
  });

  qs("#mood").addEventListener("change", () => {
    updateThemeBrief();
    updateSampleTheme();
    sendEvent("select_mood", { action: qs("#mood").value });
  });

  qs("#prevQuestionBtn").addEventListener("click", goPreviousQuestion);

  qs("#againBtn").addEventListener("click", () => {
    clearToast();
    state.answers = [];
    state.index = 0;
    resetPosterOutput();
    resultView.classList.add("hidden");
    startView.classList.remove("hidden");
    setTopbarStatus("今日可测");
    sendEvent("restart_test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  qs("#copyShareBtn").addEventListener("click", copyShareText);
  qs("#copyStatusCodeBtn")?.addEventListener("click", copyStatusCode);
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

  window.addEventListener("resize", updateViewportHeight);
  window.visualViewport?.addEventListener("resize", updateViewportHeight);
  window.visualViewport?.addEventListener("scroll", updateViewportHeight);
}

function mountGlobalOverlays() {
  ["#cityPicker", "#premiumModal"].forEach((selector) => {
    const node = qs(selector);
    if (node && node.parentElement !== document.body) {
      document.body.appendChild(node);
    }
  });
}

function renderCityOptions() {
  const input = qs("#city");
  if (!input) return;
  const previous = getCityValue();
  input.value = previous || "上海";
  updateCityDisplay();
  renderCityQuickList();
  renderCityResults("");
}

function getCityValue() {
  return (qs("#city")?.value || "").trim() || "上海";
}

function bindCityPickerEvents() {
  qs("#cityTrigger")?.addEventListener("click", openCityPicker);
  qs("#closeCityPickerBtn")?.addEventListener("click", closeCityPicker);
  qs("#cityPicker")?.addEventListener("click", (event) => {
    if (event.target === qs("#cityPicker")) closeCityPicker();
  });
  qs("#citySearch")?.addEventListener("input", (event) => {
    renderCityResults(event.target.value);
  });
  qs("#citySearch")?.addEventListener("focus", () => {
    setCityKeyboardState(shouldUseCityKeyboardLayout());
    updateViewportHeight();
    keepCitySearchVisible();
  });
  qs("#citySearch")?.addEventListener("blur", () => {
    window.setTimeout(() => setCityKeyboardState(false), 120);
  });
  qs("#useTypedCityBtn")?.addEventListener("click", () => {
    selectCity(qs("#citySearch")?.value || "");
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !qs("#cityPicker")?.classList.contains("hidden")) {
      closeCityPicker();
    }
  });
}

function openCityPicker() {
  clearToast();
  updateViewportHeight();
  qs("#cityPicker")?.classList.remove("hidden");
  qs("#cityTrigger")?.setAttribute("aria-expanded", "true");
  lockCityPickerScroll();
  setCityKeyboardState(false);
  const search = qs("#citySearch");
  if (search) {
    search.value = "";
    renderCityResults("");
    if (isDesktopCityPicker()) {
      window.setTimeout(() => {
        try {
          search.focus({ preventScroll: true });
        } catch {
          search.focus();
        }
      }, 80);
    }
  }
  sendEvent("open_city_picker", { city: getCityValue() });
}

function closeCityPicker() {
  if (document.activeElement === qs("#citySearch")) {
    document.activeElement.blur();
  }
  qs("#cityPicker")?.classList.add("hidden");
  qs("#cityTrigger")?.setAttribute("aria-expanded", "false");
  setCityKeyboardState(false);
  unlockCityPickerScroll();
  updateViewportHeight();
  window.setTimeout(updateViewportHeight, 180);
}

function selectCity(value) {
  const city = sanitizeCity(value);
  if (!city) return;
  qs("#city").value = city;
  updateCityDisplay();
  renderCityQuickList();
  updateThemeBrief();
  updateSampleTheme();
  closeCityPicker();
  sendEvent("select_city", { city });
}

function updateCityDisplay() {
  const display = qs("#cityDisplay");
  if (display) display.textContent = getCityValue();
}

function renderCityQuickList() {
  const root = qs("#cityQuickList");
  if (!root) return;
  root.innerHTML = "";
  popularCities.forEach((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `city-chip${city === getCityValue() ? " active" : ""}`;
    button.textContent = city;
    button.addEventListener("click", () => selectCity(city));
    root.appendChild(button);
  });
}

function renderCityResults(query) {
  const root = qs("#cityResultList");
  if (!root) return;
  const city = sanitizeCity(query);
  const entries = getCityEntries();
  const matches = city
    ? entries.filter((entry) => entry.city.includes(city) || entry.group.includes(city))
    : entries;
  const exact = city && entries.some((entry) => entry.city === city);
  const useTyped = qs("#useTypedCityBtn");
  if (useTyped) {
    useTyped.classList.toggle("hidden", !city || exact || matches.length > 0);
    useTyped.textContent = city ? `使用「${city}」` : "";
  }
  setText("#cityResultMeta", city ? `${matches.length} 个匹配` : "全部城市");
  root.innerHTML = "";
  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "city-empty";
    empty.textContent = city ? `没有找到「${city}」，可以直接使用输入内容。` : "暂无城市";
    root.appendChild(empty);
    return;
  }
  matches.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = entry.city === getCityValue() ? "active" : "";
    button.textContent = entry.city;
    button.addEventListener("click", () => selectCity(entry.city));
    root.appendChild(button);
  });
}

function getCityEntries() {
  const entries = cityGroups.flatMap((group) => group.cities.map((city) => ({ city, group: group.label })));
  const priority = new Map(cityPriority.map((city, index) => [city, index]));
  return entries.sort((a, b) => {
    const aRank = priority.has(a.city) ? priority.get(a.city) : 999;
    const bRank = priority.has(b.city) ? priority.get(b.city) : 999;
    if (aRank !== bRank) return aRank - bRank;
    return a.city.localeCompare(b.city, "zh-Hans-CN");
  });
}

function sanitizeCity(value) {
  return String(value || "")
    .replace(/[<>"]/g, "")
    .replace(/\s+/g, "")
    .slice(0, 12);
}

function updateViewportHeight() {
  const viewport = window.visualViewport;
  const height = Math.round(viewport?.height || window.innerHeight || 844);
  const top = Math.round(viewport?.offsetTop || 0);
  const keyboardInset = Math.max(0, Math.round((window.innerHeight || height) - height - top));
  const root = document.documentElement;
  root.style.setProperty("--app-vh", `${height * 0.01}px`);
  root.style.setProperty("--visual-viewport-height", `${height}px`);
  root.style.setProperty("--visual-viewport-top", `${top}px`);
  root.style.setProperty("--keyboard-inset", `${keyboardInset}px`);

  if (!qs("#cityPicker")?.classList.contains("hidden") && document.activeElement === qs("#citySearch")) {
    setCityKeyboardState(shouldUseCityKeyboardLayout());
    keepCitySearchVisible();
  }
}

function lockCityPickerScroll() {
  cityPickerScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add("city-picker-open");
  document.body.classList.add("city-picker-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${cityPickerScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockCityPickerScroll() {
  document.documentElement.classList.remove("city-picker-open");
  document.body.classList.remove("city-picker-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, cityPickerScrollY);
}

function setCityKeyboardState(isOpen) {
  document.documentElement.classList.toggle("city-keyboard-open", Boolean(isOpen));
  qs("#cityPicker")?.classList.toggle("city-keyboard-open", Boolean(isOpen));
}

function keepCitySearchVisible() {
  const search = qs("#citySearch");
  if (!search || qs("#cityPicker")?.classList.contains("hidden") || !shouldUseCityKeyboardLayout()) return;
  window.requestAnimationFrame(() => {
    try {
      search.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
      search.scrollIntoView(false);
    }
  });
}

function isDesktopCityPicker() {
  return window.matchMedia?.("(min-width: 901px)").matches;
}

function shouldUseCityKeyboardLayout() {
  const viewport = window.visualViewport;
  const viewportShrink = viewport ? window.innerHeight - viewport.height - viewport.offsetTop : 0;
  return !isDesktopCityPicker() || viewportShrink > 90;
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
      updateThemeBrief();
      updateSampleTheme();
      sendEvent("select_theme", { theme: id });
    });
    themeGrid.appendChild(button);
  });
}

function updateThemeBrief() {
  const theme = themes[state.activeTheme];
  const content = themeBriefs[state.activeTheme] || themeBriefs.worker;
  const city = getCityValue() || theme.hotLine;
  const mood = qs("#mood")?.value || "低电量运行，还在硬撑";
  setText("#briefTitle", `${city}${theme.label}版`);
  setText("#briefCopy", `${content.copy} 你现在是“${mood}”，测完会生成一张今日状态卡。`);
  const briefTags = qs("#briefTags");
  if (briefTags) {
    briefTags.innerHTML = content.tags.map((tag) => `<span>${tag}</span>`).join("");
  }
  renderDailySignals();
  renderRailContent();
}

function renderDailySignals() {
  const root = qs("#dailySignals");
  if (!root) return;
  const theme = themes[state.activeTheme];
  const content = themeBriefs[state.activeTheme] || themeBriefs.worker;
  const city = getCityValue() || theme.hotLine;
  const seed = hash(`${dateKey}:${state.activeTheme}:${city}:signals`);
  const sample = Number(state.stats.tests || 0);
  const signals = [
    { label: "今日热词", value: pick(content.signals, seed) },
    { label: "今日热度", value: `${city} ${sample || "--"}` },
    { label: "适合查看", value: pick(["下班前", "午休后", "安静几分钟", "睡前别太晚"], seed + 7) },
  ];
  root.innerHTML = signals
    .map(
      (item) => `
        <div>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderRailContent() {
  const nowRoot = qs("#railNow");
  const feedRoot = qs("#railFeed");
  const typeRoot = qs("#railTypeBoard");
  const liveRoot = qs("#railLiveFeed");
  const getRoot = qs("#railGetCard");
  if (!nowRoot || !feedRoot) return;
  const theme = themes[state.activeTheme];
  const content = themeBriefs[state.activeTheme] || themeBriefs.worker;
  const city = getCityValue() || theme.hotLine;
  const average = clamp(Number(state.stats.average || 42), 17, 98);
  const seed = hash(`${dateKey}:${state.activeTheme}:${city}:rail`);
  nowRoot.innerHTML = `
    <span>当前选择</span>
    <strong>${city}${theme.label} / 今日平均 ${average} 分</strong>
    <p>扫码到手机上做 5 道小题，最后留一张今日状态小卡。</p>
  `;
  if (typeRoot) {
    const types = buildRailHotTypes(seed);
    typeRoot.innerHTML = `
      <div class="rail-section-head">
        <span>今日类型观察</span>
        <strong>${city}${theme.label}更容易出现这些状态</strong>
      </div>
      <div class="rail-type-list">
        ${types
          .map(
            (item) => `
              <div>
                <b>${item.code}</b>
                <span>${item.name}</span>
                <i>热度 ${item.count}</i>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }
  if (liveRoot) {
    const lines = buildRailLiveLines(theme, city, seed);
    liveRoot.innerHTML = `
      <div class="rail-section-head">
        <span>今日状态观察</span>
        <strong>这些结果正在变常见</strong>
      </div>
      ${lines
        .map(
          (item) => `
            <div class="rail-live-row">
              <span>${item.time}</span>
              <strong>${item.text}</strong>
            </div>
          `,
        )
        .join("")}
    `;
  }
  if (getRoot) {
    getRoot.innerHTML = `
      <span>手机端包含什么</span>
      <div>
        <strong>今日类型</strong>
        <strong>状态卡片</strong>
        <strong>编号对照</strong>
        <strong>隐藏内容</strong>
      </div>
    `;
  }
  feedRoot.innerHTML = content.railFeed
    .map(
      (line) => `
        <div>
          <span>今日看点</span>
          <strong>${line}</strong>
        </div>
      `,
    )
    .join("");
}

function renderPosterControls() {
  renderSwitch("#templateSwitch", posterTemplates, state.posterTemplate, (id) => {
    state.posterTemplate = id;
    resetPosterOutput();
    updatePosterPreview();
    sendEvent("poster_template_change", { template: id });
  });
  renderSwitch("#toneSwitch", toneOptions, state.tone, (id) => {
    state.tone = id;
    resetPosterOutput();
    updateShareCopy();
    updatePosterPreview();
    sendEvent("tone_change", { tone: id });
  });
}

function resetPosterOutput() {
  qs("#posterOutput")?.classList.add("hidden");
  qs("#posterStudio")?.classList.remove("generated");
}

function renderSwitch(selector, options, activeValue, onSelect) {
  const root = qs(selector);
  root.innerHTML = "";
  Object.entries(options).forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip-button${id === activeValue ? " active" : ""}`;
    button.dataset.option = id;
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
    const response = await fetch(apiUrl("/api/stats"));
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
  const city = getCityValue() || state.stats.activeCity || theme.hotLine;
  const seed = hash(`${dateKey}:${state.activeTheme}:${city}`);
  const sampleScore = clamp(29 + (seed % 43), 17, 88);
  const sampleBeat = clamp(Math.round(sampleScore * 0.72 + (seed % 18)), 8, 96);
  const sampleTitles = ["低电量营业中", "人还在，魂稍后回电", "今日轻度冒烟", "看似正常，实则离线"];
  const sampleTexts = [
    "你今天有点累，但还在努力维持体面。",
    "今日状态适合轻拿轻放，别让通知把你摇醒。",
    "这不是崩，是今天的事太占内存。",
    "看起来还行，细看已经需要一杯热的。",
  ];
  qs("#sampleScore").textContent = sampleScore;
  qs("#sampleTitle").textContent = pick(sampleTitles, seed);
  qs("#sampleText").textContent = pick(sampleTexts, seed + 3);
  qs("#samplePersona").textContent = `${city}${theme.label}`;
  qs("#sampleBeat").textContent = `同城观察值 ${sampleBeat}%`;
}

function renderStats() {
  const displayAverage = clamp(Number(state.stats.average || 42), 17, 98);
  const reservations = Number(state.stats.reservations || 128 + (hash(dateKey) % 260));
  setText("#todayTests", state.stats.tests);
  setText("#todayAverage", displayAverage);
  setText("#hotCity", state.stats.activeCity || themes[state.activeTheme].hotLine);
  setText("#premiumCount", `${reservations}人`);
  setText("#railTests", state.stats.tests);
  setText("#railHotType", buildHotTypeCode());
  setText("#railReservations", state.stats.reservations);
  qs("#sampleNote").textContent =
    state.stats.source === "redis" ? "今日热度会随完成次数变化" : "今日热度每日刷新";
  updateSampleTheme();
  renderDailySignals();
  renderRailContent();
}

function showQuiz() {
  startView.classList.add("hidden");
  resultView.classList.add("hidden");
  quizView.classList.remove("hidden");
  resetPosterOutput();
  qs("#quizMeta").textContent = `${state.profile.city} ${state.profile.persona}版`;
  setTopbarStatus("5 题测试中");
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

async function hydrateQuestionPool({ applyToCurrentQuiz = true } = {}) {
  try {
    const response = await fetch(apiUrl(`/api/questions?theme=${encodeURIComponent(state.activeTheme)}&city=${encodeURIComponent(state.profile.city)}`));
    if (!response.ok) {
      state.questionSource = "local";
      if (!quizView.classList.contains("hidden")) setTopbarStatus("5 题测试中");
      return;
    }
    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length < 5) {
      state.questionSource = "local";
      if (!quizView.classList.contains("hidden")) setTopbarStatus("5 题测试中");
      return;
    }
    const nextQuestions = selectDailyQuestions(data.questions, 5, `${dateKey}:${state.activeTheme}:ai:${state.profile.city}`);
    if (applyToCurrentQuiz && state.answers.length === 0 && state.index === 0) {
      state.questions = nextQuestions;
      state.questionSource = data.source === "cache" ? "ai" : data.source || "ai";
      if (!quizView.classList.contains("hidden")) renderQuestion();
    }
    if (!quizView.classList.contains("hidden")) {
      setTopbarStatus(data.source === "deepseek" ? "题库已更新" : "5 题测试中");
    }
    sendEvent("question_pool_source", { source: state.questionSource });
  } catch {
    state.questionSource = "local";
    if (!quizView.classList.contains("hidden")) setTopbarStatus("5 题测试中");
    sendEvent("question_pool_source", { source: "local" });
  }
}

function renderQuestion() {
  const question = state.questions[state.index];
  questionCounter.textContent = `${state.index + 1}/${state.questions.length}`;
  qs("#prevQuestionBtn").disabled = state.index === 0;
  setTopbarStatus("5 题测试中");
  progressBar.style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  qs("#progressMood").textContent = buildProgressMood();
  questionDimension.textContent = question.dimension;
  setText("#questionFactor", question.dimension);
  setText("#questionHint", questionHints[state.index] || questionHints[0]);
  renderIdentityCodeProgress(question);
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
  setText("#questionHint", buildAxisImpactText(question, option));
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
  }, 320);
}

function goPreviousQuestion() {
  if (state.index === 0) return;
  state.answers = state.answers.slice(0, state.index - 1);
  state.index -= 1;
  sendEvent("answer_choice", { action: "go_previous", question: state.questions[state.index]?.id });
  renderQuestion();
}

function getQuestionSourceLabel() {
  if (state.questionSource === "deepseek") return "题库已更新";
  if (state.questionSource === "ai" || state.questionSource === "cache") return "今日题库";
  return "今日题库";
}

function buildProgressMood() {
  const percent = (state.index + 1) / state.questions.length;
  if (percent <= 0.25) return "按第一反应选";
  if (percent <= 0.5) return "已经有点像了";
  if (percent <= 0.8) return "还差最后几题";
  return "马上出报告";
}

function buildAnswerFeedback(value) {
  if (value >= 12) return `+${value} 电量回升`;
  if (value >= 0) return `+${value} 维持运行`;
  if (value <= -18) return `${value} 高压信号`;
  return `${value} 轻度冒烟`;
}

function showResult() {
  clearToast();
  quizView.classList.add("hidden");
  resultView.classList.remove("hidden");
  state.result = calculateResult();
  setTopbarStatus("报告完成");
  resetPosterOutput();
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
  const identity = buildIdentityResult(profile, state.answers, score, tier, seed);
  const match = buildIdentityMatch(identity.typeCode, state.entryTypeCode, seed);

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
    identity,
    match,
    personaTag: buildPersonaTag(profile, tier, seed),
    riskStamp: score >= 68 ? "状态在线" : score >= 36 ? "轻度耗电" : "电量见红",
    roast: pick(roasts[tier], seed + 3),
    advice: pick(advice[tier], seed + 9),
    cause: pick(profile.theme.causes, seed + 14),
    revive: pick(profile.theme.revives, seed + 20),
    premiumPeek: buildPremiumPeek(profile, seed, identity),
    diagnosis: buildDiagnosis(score, seed),
    resultSlices: buildResultSlices(profile, score, tier, seed, state.answers, identity),
    shareReasons: buildShareReasons(profile, score, tier, seed, identity),
    challenge: buildChallenge(profile, score, tier, seed, identity),
    relations: buildIdentityRelations(identity, state.entryTypeCode, seed),
    shareLine: buildShareLine(score, profile.city, profile.persona, tier, identity),
  };
}

function getScoreColor(score) {
  if (score < 36) return "#ff5b4f";
  if (score < 68) return "#ffd166";
  return "#c7ff4f";
}

function renderResult(result) {
  document.documentElement.style.setProperty("--theme-color", result.theme.color);
  const reportCard = qs("#reportCard");
  const scoreColor = getScoreColor(result.score);
  if (reportCard) {
    reportCard.dataset.scoreTier = result.tier;
    reportCard.style.setProperty("--score-color", scoreColor);
    reportCard.style.setProperty("--battery-fill", `${result.score}%`);
  }
  qs("#reportTheme").textContent = `${result.persona}今日状态小卡`;
  qs("#reportDate").textContent = formatDate(new Date());
  qs("#identityCode").textContent = result.identity.typeCode;
  qs("#identityName").textContent = result.identity.typeName;
  qs("#identityCopy").textContent = result.identity.explanation;
  qs("#identityRarity").textContent = `${result.identity.rarity}%`;
  qs("#identityTwins").textContent = result.identity.sameTypeCount;
  qs("#scoreValue").textContent = `${result.score}%`;
  qs("#scoreRing").style.setProperty("--score-deg", `${result.score * 3.6}deg`);
  qs("#scoreRing").style.setProperty("--score-color", scoreColor);
  qs("#batteryFill")?.style.setProperty("--battery-fill", `${result.score}%`);
  qs("#riskStamp").textContent = result.riskStamp;
  qs("#reportStatus").textContent = result.title;
  qs("#personaTag").textContent = result.personaTag;
  qs("#reportRoast").textContent = result.roast;
  qs("#cityRank").textContent = `${result.cityBeat}%`;
  qs("#cityRankLabel").textContent = `你在${result.city}今天${result.cityBeat >= 58 ? "还算能撑" : "偏低电量"}`;
  qs("#personaRank").textContent = `${result.personaBeat}%`;
  qs("#personaRankLabel").textContent = `${result.persona}里你算${result.personaBeat >= 58 ? "比较在线" : "比较累"}`;
  qs("#rankFootnote").textContent = `今日热度 ${result.rankSample || state.stats.tests || "--"}，只做娱乐参考`;
  qs("#causeText").textContent = result.cause;
  qs("#reviveText").textContent = result.revive;
  qs("#adviceText").textContent = result.advice;
  qs("#premiumPeekText").textContent = result.premiumPeek;
  qs("#tomorrowHook").textContent = result.theme.tomorrow;
  renderDiagnosis(result);
  renderIdentityAxes(result);
  renderRelations(result);
  renderMatch(result);
  renderResultExtras(result);
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

function renderIdentityAxes(result) {
  const root = qs("#identityAxisGrid");
  if (!root) return;
  root.innerHTML = result.identity.axes
    .map(
      (axis) => `
        <div class="identity-axis-item">
          <span>${axis.label}倾向</span>
          <strong>${axis.choice}</strong>
          <div class="identity-axis-row">
            <div><i style="--axis: ${axis.percent}%"></i></div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderRelations(result) {
  const root = qs("#relationPreview");
  if (!root) return;
  root.innerHTML = `
    <div class="relation-head">
      <span>先看一眼</span>
      <strong>${result.relations.free.title}</strong>
      <p>${result.relations.free.copy}</p>
    </div>
    ${result.relations.locked
      .map(
        (item) => `
          <div class="relation-locked">
            <span>${item.label}</span>
            <strong>解锁后查看</strong>
          </div>
        `,
      )
      .join("")}
  `;
}

function renderMatch(result) {
  const root = qs("#matchCard");
  if (!root) return;
  if (!result.match) {
    root.classList.add("hidden");
    root.innerHTML = "";
    return;
  }
  root.classList.remove("hidden");
  root.innerHTML = `
    <span>和朋友对一下</span>
    <strong>${result.match.score}% / ${result.match.title}</strong>
    <p>${result.match.copy}</p>
  `;
}

function renderResultExtras(result) {
  const deepRoot = qs("#resultDeepGrid");
  if (deepRoot) {
    deepRoot.innerHTML = result.resultSlices
      .map(
        (item) => `
          <div>
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <p>${item.copy}</p>
          </div>
        `,
      )
      .join("");
  }

  const reasonsRoot = qs("#shareReasons");
  if (reasonsRoot) {
    reasonsRoot.innerHTML = `
      <div class="insight-head">
        <span>简单看一下</span>
        <strong>${result.identity.coreName} ${result.identity.typeCode}</strong>
      </div>
      ${result.shareReasons
        .map(
          (item) => `
            <div class="insight-item">
              <span>${item.label}</span>
              <strong>${item.value}</strong>
            </div>
          `,
        )
        .join("")}
    `;
  }

  const challengeRoot = qs("#challengeCard");
  if (challengeRoot) {
    challengeRoot.innerHTML = `
      <span>今日编号</span>
      <strong>${result.challenge.title}</strong>
      <p>${result.challenge.copy}</p>
    `;
  }
}

function updateShareCopy() {
  if (!state.result) return;
  state.result.shareLine = getShareLine(state.result);
  qs("#shareCopy").textContent = state.result.shareLine;
}

async function updatePosterPreview() {
  if (!state.result) return;
  const token = ++state.posterRenderToken;
  drawPosterPreview();
  if (!hasCurrentShareQr()) {
    ensureShareQr().then(() => {
      if (token === state.posterRenderToken) drawPosterPreview();
    });
  }
}

function drawPosterPreview() {
  if (!state.result) return;
  const canvas = drawShareCanvas(state.result, state.posterTemplate);
  const preview = qs("#posterPreview");
  const ctx = preview.getContext("2d");
  ctx.clearRect(0, 0, preview.width, preview.height);
  ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
}

function hasCurrentShareQr() {
  const url = buildShareUrl("poster");
  return Boolean(state.qrImage && state.qrUrl === url);
}

async function copyShareText() {
  const text = buildShareText(state.result);
  const copied = await writeClipboard(text);
  if (copied) {
    showToast("今日文案已复制");
    sendEvent("copy_share_success", { template: state.posterTemplate, tone: state.tone });
    sendEvent("result_share_intent", { action: "copy_share" });
  } else {
    showToast(text);
    sendEvent("copy_share_fail", { template: state.posterTemplate, tone: state.tone });
  }
}

async function copyStatusCode() {
  if (!state.result?.identity) return;
  const text = `${state.result.identity.typeName} ${state.result.identity.typeCode}：${state.result.identity.shortLine}`;
  const copied = await writeClipboard(text);
  showToast(copied ? `已复制：${text}` : text);
  sendEvent(copied ? "copy_status_code_success" : "copy_status_code_fail", {
    typeCode: state.result.identity.typeCode,
  });
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
  if (state.isSavingPoster) return;
  const button = qs("#saveImageBtn");
  const originalText = button?.textContent || "保存当前状态卡";
  state.isSavingPoster = true;
  if (button) {
    button.disabled = true;
    button.textContent = "生成中...";
  }
  showToast("正在生成状态卡...");
  try {
    await ensureShareQr();
    const canvas = drawShareCanvas(state.result, state.posterTemplate);
    const url = canvas.toDataURL("image/png");
    qs("#posterImage").src = url;
    qs("#posterOutput").classList.remove("hidden");
    qs("#posterStudio")?.classList.add("generated");
    const link = document.createElement("a");
    link.download = `活着么-${dateKey}-${state.shareId}.png`;
    link.href = url;
    link.click();
    showToast("状态卡已生成");
    sendEvent("save_poster_success", { template: state.posterTemplate, tone: state.tone });
    sendEvent("save_poster", { template: state.posterTemplate, tone: state.tone });
    sendEvent("result_share_intent", { action: "save_poster" });
  } catch {
    showToast("保存受限，已保留预览图，可直接截图保存");
    sendEvent("save_poster_fail", { template: state.posterTemplate, tone: state.tone });
  } finally {
    state.isSavingPoster = false;
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

function openPremiumModal() {
  clearToast();
  premiumModal.classList.remove("hidden");
  sendEvent("open_premium", { score: state.result?.score, scoreBucket: state.result?.scoreBucket });
}

function closePremiumModal() {
  premiumModal.classList.add("hidden");
  clearToast();
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
  showToast("已锁定 9.9 内测价，隐藏内容开放时优先提醒。");
  sendEvent("lock_price_click", { score: state.result?.score, scoreBucket: state.result?.scoreBucket });
  sendEvent("reserve_premium", { score: state.result?.score, scoreBucket: state.result?.scoreBucket });
}

async function copyPremiumCode() {
  const code = `活着么内测口令：${state.shareId.toUpperCase()}，我想看隐藏内容`;
  const copied = await writeClipboard(code);
  showToast(copied ? "内测口令已复制" : code);
  sendEvent("payment_provider_click", { action: "copy_premium_code" });
}

function openPaymentProvider() {
  showToast("已记录提醒，开放微信通道时优先通知你。");
  sendEvent("payment_provider_click", { action: "wechat_reserved", score: state.result?.score });
}

function updatePremiumState() {
  state.reservedPremium = Boolean(localStorage.getItem("huozheme:premium-interest"));
  const premiumBtn = qs("#premiumBtn");
  const reserveBtn = qs("#reservePremiumBtn");
  if (premiumBtn) premiumBtn.textContent = state.reservedPremium ? "已锁定 9.9 内测价" : "9.9 看隐藏内容";
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
  return buildShareLine(result.score, result.city, result.persona, result.tier, result.identity);
}

function buildShareLine(score, city, persona, tier, identity) {
  const base = shareLines[state.tone][tier];
  if (identity) {
    const variants = [
      `我是${identity.typeName} ${identity.typeCode}，${identity.shortLine}`,
      `${city}${persona}今日电量 ${score}%，像一个${identity.typeName}。${base}`,
      `今天像${identity.typeName}：${identity.shortLine}`,
    ];
    return variants[state.copySeed % variants.length];
  }
  const variants = [
    `我今天电量 ${score}%，${base}`,
    `${city}${persona}今日电量 ${score}%。${base}`,
    `今日电量 ${score}%，先轻一点。`,
  ];
  return variants[state.copySeed % variants.length];
}

function buildShareUrl(source = "poster") {
  const url = new URL(getShareBaseUrl());
  url.hash = "";
  url.search = "";
  url.searchParams.set("s", state.shareId);
  if (state.result?.identity?.typeCode) {
    url.searchParams.set("c", state.result.identity.typeCode);
    url.searchParams.set("v", state.result.identity.variantCode);
  }
  url.searchParams.set("from", source);
  return url.toString();
}

function buildDisplayLink() {
  const url = new URL(buildShareUrl("desktop"));
  return `${url.host}${url.pathname}?s=${state.shareId}`;
}

async function ensureShareQr() {
  if (!state.result) return;
  const url = buildShareUrl("poster");
  if (state.qrImage && state.qrUrl === url) return;

  const cached = shareQrCache.get(url);
  if (cached?.image) {
    state.qrUrl = url;
    state.qrDataUrl = cached.dataUrl;
    state.qrImage = cached.image;
    return;
  }

  if (cached?.promise) {
    const loaded = await cached.promise;
    state.qrUrl = url;
    state.qrDataUrl = loaded.dataUrl;
    state.qrImage = loaded.image;
    return;
  }

  const promise = loadShareQr(url);
  shareQrCache.set(url, { promise });
  try {
    const loaded = await promise;
    shareQrCache.set(url, loaded);
    state.qrUrl = url;
    state.qrDataUrl = loaded.dataUrl;
    state.qrImage = loaded.image;
  } catch {
    shareQrCache.delete(url);
    state.qrDataUrl = "";
    state.qrImage = null;
    state.qrUrl = "";
  }
}

async function loadShareQr(url) {
  const response = await fetch(apiUrl(`/api/qr?data=${encodeURIComponent(url)}`));
  if (!response.ok) throw new Error("qr_failed");
  const data = await response.json();
  if (!data.dataUrl) throw new Error("qr_empty");
  const image = await loadImage(data.dataUrl);
  return { dataUrl: data.dataUrl, image };
}

async function renderDesktopQr() {
  const root = qs("#desktopQr");
  renderMiniQr(root, state.shareId);
  try {
    const response = await fetch(apiUrl(`/api/qr?data=${encodeURIComponent(buildShareUrl("desktop"))}`));
    if (!response.ok) return;
    const data = await response.json();
    if (!data.dataUrl) return;
    root.classList.add("has-image");
    root.innerHTML = `<img src="${data.dataUrl}" alt="当前页面二维码" />`;
  } catch {
    renderMiniQr(root, state.shareId);
  }
}

async function copyDesktopLink() {
  const link = buildShareUrl("desktop");
  const copied = await writeClipboard(link);
  showToast(copied ? "当前链接已复制" : link);
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
  try {
    const response = await fetch(apiUrl("/api/generate"), {
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
        identity: {
          typeCode: state.result.identity.typeCode,
          typeName: state.result.identity.typeName,
          axes: state.result.identity.axes.map(({ key, letter, choice }) => ({ key, letter, choice })),
          variant: state.result.identity.variant,
        },
      }),
    });

    if (!response.ok) throw new Error("ai_api_failed");
    const data = await response.json();
    if (!data.result) {
      state.aiStatus = "fallback";
      setTopbarStatus("报告完成");
      sendEvent("ai_result_fallback", { scoreBucket: state.result.scoreBucket });
      return;
    }

    applyAiResult(data.result);
    state.aiStatus = data.source || "deepseek";
    sendEvent("ai_result_applied", { source: state.aiStatus, scoreBucket: state.result.scoreBucket });
    setTopbarStatus("报告完成");
  } catch {
    state.aiStatus = "fallback";
    setTopbarStatus("报告完成");
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
    city: extra.city || state.profile?.city || getCityValue(),
    score: extra.score ?? state.result?.score,
    scoreBucket: extra.scoreBucket ?? state.result?.scoreBucket,
    typeCode: extra.typeCode || state.result?.identity?.typeCode,
    entryTypeCode: extra.entryTypeCode || state.entryTypeCode,
    compatibilityScore: extra.compatibilityScore ?? state.result?.match?.score,
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
      navigator.sendBeacon(apiUrl("/api/event"), blob);
      return;
    }
    fetch(apiUrl("/api/event"), {
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
  return `《活着么》今日状态小卡\n我的状态：${result.identity.typeName} ${result.identity.typeCode}\n今日电量：${result.score}%\n最耗我的事：${result.cause}\n${result.shareLine}\n${shareUrl}`;
}

function drawShareCanvas(result, template = "classic") {
  const canvas = qs("#shareCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const palette =
    template === "classic"
      ? { bg: "#f7f5ee", fg: "#111317", muted: "#6f706c", card: "#ffffff", accent: "#111317" }
      : template === "xhs"
        ? { bg: "#ff5b4f", fg: "#1b1010", muted: "#5b1f1a", card: "#fff2eb", accent: "#1b1010" }
        : { bg: "#78c8ff", fg: "#17130f", muted: "#614a32", card: "#fff5d7", accent: "#ff5b4f" };
  const scoreColor = getScoreColor(result.score);

  if (template === "social") {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#78c8ff");
    gradient.addColorStop(0.55, "#ffd99b");
    gradient.addColorStop(1, "#ff8a72");
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = palette.bg;
  }
  ctx.fillRect(0, 0, w, h);

  if (template === "social") {
    drawGrid(ctx, w, h);
    drawCircle(ctx, 880, 220, 280, "rgba(255,255,255,.28)");
  }

  ctx.fillStyle = palette.muted;
  ctx.font = "800 32px system-ui, sans-serif";
  drawCanvasLogo(ctx, 72, 66, 52);
  ctx.fillText("活着么 / 今日状态小卡", 140, 104);
  ctx.textAlign = "right";
  ctx.fillText(formatDate(new Date()), w - 72, 104);
  ctx.textAlign = "left";

  ctx.fillStyle = palette.fg;
  ctx.font = template === "xhs" ? "950 160px system-ui, sans-serif" : "950 132px system-ui, sans-serif";
  ctx.fillText(result.identity.typeName, 72, 285);
  ctx.fillStyle = palette.accent;
  ctx.font = "950 68px system-ui, sans-serif";
  ctx.fillText(result.identity.typeCode, 72, 370);

  ctx.fillStyle = palette.fg;
  ctx.font = "950 190px system-ui, sans-serif";
  ctx.fillText(`${result.score}%`, 72, 600);
  drawBatteryIcon(ctx, 72, 632, 196, 72, result.score, template === "xhs" ? "#1b1010" : scoreColor);
  ctx.fillStyle = palette.muted;
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText("今日电量", 76, 744);

  ctx.fillStyle = palette.card;
  roundRect(ctx, 72, 800, w - 144, 230, 32);
  ctx.fill();
  ctx.fillStyle = palette.muted;
  ctx.font = "850 30px system-ui, sans-serif";
  ctx.fillText("今天最耗你", 110, 860);
  ctx.fillStyle = palette.fg;
  ctx.font = "950 56px system-ui, sans-serif";
  wrapText(ctx, result.cause, 110, 935, w - 220, 64, 2);
  ctx.fillStyle = palette.muted;
  ctx.font = "800 28px system-ui, sans-serif";
  wrapText(ctx, `先做：${result.revive}`, 110, 1010, w - 220, 40, 1);

  ctx.fillStyle = palette.fg;
  ctx.font = "900 42px system-ui, sans-serif";
  wrapText(ctx, result.shareLine, 72, 1140, w - 320, 56, 3);
  drawQrBox(ctx, w - 250, 1102, 178, palette.accent);

  ctx.fillStyle = palette.muted;
  ctx.font = "750 25px system-ui, sans-serif";
  ctx.fillText(`${result.city}${result.persona} / ${buildDisplayLink()}`, 72, h - 62);

  return canvas;
}

function drawBatteryIcon(ctx, x, y, width, height, score, color) {
  ctx.save();
  ctx.lineWidth = 8;
  ctx.strokeStyle = color;
  ctx.fillStyle = "transparent";
  roundRect(ctx, x, y, width, height, 18);
  ctx.stroke();
  roundRect(ctx, x + width + 8, y + height * 0.27, 18, height * 0.46, 8);
  ctx.fillStyle = color;
  ctx.fill();
  const inset = 12;
  const fillWidth = Math.max(10, (width - inset * 2) * clamp(score, 0, 100) / 100);
  roundRect(ctx, x + inset, y + inset, fillWidth, height - inset * 2, 10);
  ctx.fill();
  ctx.restore();
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
    { label: "可用电量", value: `${score}%`, percent: score },
    { label: "想躲起来", value: `${clamp(103 - score + (seed % 8), 6, 98)}%`, percent: clamp(103 - score + (seed % 8), 6, 98) },
    { label: "恢复概率", value: `${clamp(score - 7 + (seed % 18), 4, 96)}%`, percent: clamp(score - 7 + (seed % 18), 4, 96) },
  ];
}

function buildIdentityResult(profile, answers, score, tier, seed) {
  const scores = Object.fromEntries(identityAxes.map((axis) => [axis.key, 0]));
  const signature = buildAnswerSignature(answers);
  scores.energy += (score - 50) / 9;

  answers.forEach((answer, index) => {
    const text = `${answer.dimension} ${answer.label} ${answer.question}`.toLowerCase();
    const value = Number(answer.value || 0);
    const force = Math.max(1, Math.abs(value) / 7);
    scores.energy += value / 12;

    if (/(消息|通知|老板|客户|社交|回复|群|meeting|微信)/i.test(text)) scores.trigger += force;
    if (/(ddl|截止|考试|作业|kpi|绩效|周报|任务|deadline|汇报)/i.test(text)) scores.trigger -= force;

    if (/(社交|聚|聊|熟人|同学|同事|人类|约饭)/i.test(text)) scores.social += value >= 2 ? force : -force;
    if (/(假装|静音|不回|沉默|天花板|离线|隐身)/i.test(text)) scores.social -= force * 0.8;

    if (/(睡|夜|作息|吃|饭|热饭|休息|被窝|澡)/i.test(text)) scores.recovery += value <= 4 ? force : force * 0.35;
    if (/(跑路|出门|远方|下班|离职|门口|晒太阳)/i.test(text)) scores.recovery -= force;

    if (/(计划|现金|余额|预算|边界|专注|自律|报价|收款)/i.test(text)) scores.control += value >= 2 ? force : -force;
    if (/(随缘|漂|不知道|糊弄|看天|突然)/i.test(text)) scores.control -= force * 0.8;

    if (/(吐槽|催|会议|消息|老板|客户|已读|提醒)/i.test(text)) scores.expression += value >= 0 ? force * 0.45 : -force;
    if (/(沉默|静音|装没看见|假装|脑内|内耗|不说话)/i.test(text)) scores.expression -= force;

    scores.coping += value >= 8 ? force : value <= -8 ? -force : 0;
    if (/(宇宙|奇迹|希望|时间倒流|替我|取消|补偿|突然)/i.test(text)) scores.coping -= force * 0.8;
    if (/(先写|出发|行动|清空|准点|关闭|收定金|拆到)/i.test(text)) scores.coping += force;

    identityAxes.forEach((axis) => {
      scores[axis.key] += ((hash(`${signature}:${axis.key}:${index}:${dateKey}`) % 9) - 4) / 10;
    });
  });

  if (profile.themeId === "student") scores.trigger -= 0.8;
  if (profile.themeId === "solo") scores.social -= 0.7;
  if (profile.themeId === "freelance") scores.control += 0.4;
  identityAxes.forEach((axis) => {
    scores[axis.key] += ((hash(`${signature}:${profile.themeId}:${profile.city}:${axis.key}:spread`) % 61) - 30) / 8;
  });

  const axes = identityAxes.map((axis) => {
    const raw = scores[axis.key] || 0;
    const first = raw >= 0;
    const letter = first ? axis.letters[0] : axis.letters[1];
    const choice = first ? axis.left : axis.right;
    const percent = clamp(Math.round(50 + raw * 8), 12, 88);
    return { ...axis, letter, choice, percent };
  });
  const internalCode = axes.map((axis) => axis.letter).join("");
  const statusType = buildSimpleStatusType(profile, score, tier, seed, axes);
  const typeCode = statusType.code;
  const coreCode = internalCode.slice(0, 4);
  const suffixCode = internalCode.slice(4);
  const coreName = statusType.name;
  const suffixName = statusType.code;
  const variant = pick(identityVariants[profile.themeId] || identityVariants.worker, seed + hash(internalCode));
  const rarity = (8 + (hash(`${dateKey}:${typeCode}:${profile.city}`) % 210) / 10).toFixed(1);
  const sameTypeCount = Math.max(3, Math.round(Number(state.stats.tests || 360) * (Number(rarity) / 100)));
  const shortLine = statusType.line;
  return {
    typeCode,
    internalCode,
    coreCode,
    suffixCode,
    coreName,
    suffixName,
    typeName: coreName,
    variant,
    variantCode: hash(`${typeCode}:${variant}:${dateKey}`).toString(36).slice(0, 5),
    rarity,
    sameTypeCount,
    shortLine,
    explanation: shortLine,
    axes,
  };
}

function buildSimpleStatusType(profile, score, tier, seed, axes) {
  const pool = simpleStatusTypes[tier] || simpleStatusTypes.mid;
  const pressure = axes.find((axis) => axis.key === "trigger")?.letter === "M" ? 1 : 0;
  const socialLow = axes.find((axis) => axis.key === "social")?.letter === "I" ? 1 : 0;
  const base = (seed + pressure * 3 + socialLow * 5 + Math.round(score / 7)) % pool.length;
  const selected = pool[base];
  const themeLine = {
    worker: "别急着证明自己，先把今天过完。",
    student: "先交最小的一步，剩下的晚点再说。",
    solo: "先吃点热的，再决定要不要回消息。",
    freelance: "先守住边界，别把自己赔进去。",
  };
  return {
    ...selected,
    line: selected.line || themeLine[profile.themeId] || "今天先轻一点。",
  };
}

function buildIdentityShortLine(typeCode, coreName, suffixName, profile) {
  const lines = {
    L: "今天正在以最低亮度保护自己。",
    H: "今天看起来像少数仍然在线的人类。",
    M: "不是不想回复，只是通知已经开始冒烟。",
    D: "不是拖延，是截止线在旁边开会。",
    I: "适合隐身保命，不适合被突然点名。",
    O: "适合接梗续命，但别把电量花完。",
    W: "正在等待世界自己变好一点。",
    A: "还能自救，甚至能顺手救一下别人。",
  };
  const selected = [...typeCode].map((letter) => lines[letter]).filter(Boolean);
  return pick(selected, hash(`${typeCode}:${profile.city}:${profile.themeId}`)) || `${coreName}，${suffixName}`;
}

function buildIdentityRelations(identity, entryTypeCode, seed) {
  const sameName = pick(["保温杯", "小风扇", "充电宝", "省电灯"], seed + 2);
  const saviorName = pick(["小太阳", "稳压器", "发电机", "热水壶"], seed + 5);
  const drainName = pick(["插线板", "闹钟", "路由器", "红电池"], seed + 9);
  return {
    free: {
      title: `谁能给你回血：${saviorName}`,
      copy: `${saviorName}不一定能解决所有事，但能让你少耗一点。`,
    },
    locked: [
      { label: "谁最懂你", code: sameName },
      { label: "谁会耗你", code: drainName },
      { label: "今天怎么活", code: "一条回血建议" },
    ],
    entryTypeCode,
  };
}

function buildIdentityMatch(typeCode, entryTypeCode, seed) {
  if (!entryTypeCode || entryTypeCode.length < 2) return null;
  const sameFamily = typeCode[0] === entryTypeCode[0];
  const sameNumber = typeCode.slice(1) === entryTypeCode.slice(1);
  const score = clamp(58 + (sameFamily ? 18 : 7) + (sameNumber ? 9 : 0) + (seed % 11), 42, 96);
  const title = sameFamily ? "今天有点同频" : "一个耗电一个回血";
  const copy = `你是 ${typeCode}，对方是 ${entryTypeCode}。${sameFamily ? "你们今天容易懂彼此为什么累。" : "状态不一样，反而可能互相补一点电。"}`;
  return { score, title, copy };
}

function flipTypeCode(typeCode, axisKeys) {
  const chars = [...typeCode];
  axisKeys.forEach((key) => {
    const index = identityAxes.findIndex((axis) => axis.key === key);
    if (index < 0) return;
    const [left, right] = identityAxes[index].letters;
    chars[index] = chars[index] === left ? right : left;
  });
  return chars.join("");
}

function buildIdentityNameFromCode(typeCode) {
  const simple = Object.values(simpleStatusTypes)
    .flat()
    .find((item) => item.code === typeCode);
  if (simple) return simple.name;
  return `${identityCoreNames[typeCode.slice(0, 4)] || "低亮漂流型"}·${identitySuffixNames[typeCode.slice(4)] || "今日漂流观察人"}`;
}

function renderIdentityCodeProgress(question) {
  const root = qs("#identityCodeProgress");
  if (!root) return;
  const seed = hash(`${dateKey}:${state.activeTheme}:${state.index}:${question?.id || "idle"}`);
  const steps = identityAxes.slice(0, 4);
  root.innerHTML = steps
    .map((axis, index) => {
      const active = question ? (seed + index) % 3 === 0 : false;
      return `<span class="${active ? "active" : ""}">${axis.label}</span>`;
    })
    .join("");
}

function buildAxisImpactText(question, option) {
  const seed = hash(`${question.id}:${option.label}`);
  const first = identityAxes[seed % identityAxes.length];
  const direction = option.value >= 0 ? first.left : first.right;
  return `已记录：这一题主要影响「${first.label}」，更接近“${direction}”。`;
}

function renderEntryChallenge() {
  const root = qs("#entryChallengeCard");
  if (!root || !state.entryTypeCode) return;
  document.body.classList.add("has-entry-challenge");
  root.classList.remove("hidden");
  root.innerHTML = `
    <span>来自朋友的状态编号</span>
    <strong>${state.entryTypeCode}</strong>
    <p>TA 今天是 ${buildIdentityNameFromCode(state.entryTypeCode)}。测完可以对一下今天谁更低电。</p>
  `;
}

function buildHotTypeCode() {
  const samples = Object.values(simpleStatusTypes).flat().map((item) => item.code);
  return pick(samples, hash(`${dateKey}:${state.stats.tests || 0}`));
}

function buildRailHotTypes(seed) {
  const codes = ["D1", "C1", "R1", "B1", "A1", "Y1"];
  return codes.slice(0, 4).map((code, index) => ({
    code,
    name: buildIdentityNameFromCode(code).split("·")[0],
    count: 18 + ((seed + index * 17) % 86),
  }));
}

function buildRailLiveLines(theme, city, seed) {
  const minutes = [2, 5, 8, 12];
  const lines = [
    `${city}${theme.label}常见状态：「低亮营业重启型」`,
    `今日状态卡更偏低电量风格`,
    `${theme.label}今日最常见耗电点：${pick(theme.causes, seed + 3)}`,
    `和朋友对一下，看看谁更低电`,
  ];
  return lines.map((text, index) => ({
    time: `${minutes[index]} 分钟前`,
    text,
  }));
}

function normalizeTypeCode(value) {
  const raw = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const simple = Object.values(simpleStatusTypes)
    .flat()
    .some((item) => item.code === raw);
  if (simple) return raw;
  const text = raw.replace(/[^A-Z]/g, "");
  if (text.length !== 7) return "";
  return identityAxes.every((axis, index) => axis.letters.includes(text[index])) ? text : "";
}

function sanitizeParam(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
}

function buildResultSlices(profile, score, tier, seed, answers, identity) {
  const weakest = [...answers].sort((a, b) => a.value - b.value)[0];
  const strongest = [...answers].sort((a, b) => b.value - a.value)[0];
  const expressionMode = tier === "high" ? "可以小小得意" : tier === "mid" ? "适合认真自嘲" : "适合先别硬撑";
  return [
    {
      label: "今日编号",
      value: identity.typeCode,
      copy: "只是方便保存今天的结果，不需要理解成复杂标签。",
    },
    {
      label: "最耗你的事",
      value: weakest?.dimension || profile.theme.risk,
      copy: weakest ? `今天主要是「${weakest.dimension}」在耗你，所以先别硬扛。` : "今天没有特别明显的短板，整体只是有点波动。",
    },
    {
      label: "今日表达",
      value: expressionMode,
      copy: strongest ? `最能代表你的是「${strongest.dimension}」，所以嘴替句会围着它换。` : `今日电量 ${score}%，先轻一点。`,
    },
  ];
}

function buildShareReasons(profile, score, tier, seed, identity) {
  const content = themeBriefs[profile.themeId] || themeBriefs.worker;
  const reasonByTier = {
    high: "你今天少见地还挺在线，读起来有点欠揍但真实。",
    mid: "分数不高不低，最像大家愿意接梗的真实状态。",
    low: "低电量结果很像一句不用解释的叹气。",
  };
  return [
    { label: "今天像什么", value: `${identity.typeName} ${identity.typeCode}` },
    { label: "最耗你的事", value: pick(content.signals, seed + 11) },
    { label: "读起来像", value: reasonByTier[tier] },
    { label: "编号作用", value: "复制后能保留今天这次状态" },
  ];
}

function buildChallenge(profile, score, tier, seed, identity) {
  const endings = [
    "谁和你更同型，谁获得今天的免打扰名额。",
    "谁和你互补，谁负责把彼此从通知里捞出来。",
    "谁今天更低亮，谁拥有提前下线资格。",
  ];
  return {
    title: `今日编号：${identity.typeCode}`,
    copy: `${profile.city}${profile.persona}今天像${identity.typeName}。${pick(endings, seed + 17)}`,
  };
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
      high: ["准点下班幻想家", "会议免疫体", "工位清醒派"],
      mid: ["轻度冒烟打工人", "工位低亮度运行者", "消息夹缝生存者"],
      low: ["通知过敏人", "工位省电模式", "周报反噬幸存者"],
    },
    student: {
      high: ["DDL 反杀选手", "早八清醒派", "食堂运气持有者"],
      mid: ["课表夹缝生存者", "轻度拖延研究员", "宿舍低电量人"],
      low: ["DDL 堆叠人", "早八省电模式", "小组作业承重墙"],
    },
    solo: {
      high: ["房间秩序维护者", "热饭续命人", "独居高亮度人类"],
      mid: ["房间静音观察员", "外卖备注交流者", "生活低速运行者"],
      low: ["深夜脑内会议主持", "房间省电模式", "开灯延迟人"],
    },
    freelance: {
      high: ["尾款已到账人", "边界感持有者", "报价底气在线"],
      mid: ["客户消息缓冲区", "现金流观察员", "自由但轻度焦虑"],
      low: ["改稿循环人", "边界消失模式", "尾款召唤师"],
    },
  };
  return pick(map[profile.themeId]?.[tier] || map.worker.mid, seed);
}

function buildPremiumPeek(profile, seed, identity) {
  const rescueName = pick(["小太阳", "稳压器", "发电机", "热水壶"], seed + hash(identity?.typeCode || profile.themeId));
  return `隐藏内容会告诉你：谁最懂你的「${identity?.typeName || "今日状态"}」，谁能像${rescueName}一样帮你回血。`;
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
  ctx.fillText("今日电量", x, y + 82);
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
    hideToast();
  }, 2200);
}

function hideToast() {
  window.clearTimeout(showToast.timer);
  toast.classList.remove("show");
  window.setTimeout(() => {
    if (!toast.classList.contains("show")) toast.textContent = "";
  }, 180);
}

function clearToast() {
  window.clearTimeout(showToast.timer);
  toast.classList.remove("show");
  toast.textContent = "";
}
