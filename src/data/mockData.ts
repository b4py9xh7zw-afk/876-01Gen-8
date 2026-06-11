import type {
  Department,
  Floor,
  Position,
  User,
  Course,
  Question,
  LearningRecord,
  QuizResult,
  CheckinRecord,
} from '@/types';

export const departments: Department[] = [
  { id: 'd1', name: '技术研发部' },
  { id: 'd2', name: '市场运营部' },
  { id: 'd3', name: '人力资源部' },
  { id: 'd4', name: '财务管理部' },
  { id: 'd5', name: '行政管理部' },
];

export const floors: Floor[] = [
  { id: 'f1', name: '1楼', building: 'A栋' },
  { id: 'f2', name: '2楼', building: 'A栋' },
  { id: 'f3', name: '3楼', building: 'A栋' },
  { id: 'f4', name: '4楼', building: 'A栋' },
  { id: 'f5', name: '5楼', building: 'A栋' },
];

export const positions: Position[] = [
  { id: 'p1', name: '部门经理', level: 1 },
  { id: 'p2', name: '主管', level: 2 },
  { id: 'p3', name: '高级工程师', level: 3 },
  { id: 'p4', name: '工程师', level: 4 },
  { id: 'p5', name: '专员', level: 5 },
  { id: 'p6', name: '实习生', level: 6 },
];

const employeeNames = [
  '张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '黄磊', '周敏',
  '吴强', '徐丽', '孙浩', '朱琳', '马超', '胡婷', '郭鹏', '林雪',
  '何军', '高云', '罗斌', '郑梅', '梁勇', '谢丽', '宋涛', '唐燕',
  '许凯', '韩雪', '冯刚', '邓华', '曹磊', '彭珍', '曾威', '田野',
  '董璇', '袁博', '潘婷', '于飞', '蒋磊', '蔡琳', '余波', '杜娟',
];

export const users: User[] = [
  {
    id: 'admin-1',
    employeeNo: 'ADMIN001',
    name: '安全管理员',
    password: 'admin123',
    departmentId: 'd5',
    floorId: 'f1',
    positionId: 'p1',
    role: 'admin',
    status: 'normal',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  ...employeeNames.map((name, i) => ({
    id: `emp-${i + 1}`,
    employeeNo: `EMP${String(i + 1).padStart(4, '0')}`,
    name,
    password: '123456',
    departmentId: departments[i % departments.length].id,
    floorId: floors[i % floors.length].id,
    positionId: positions[i % positions.length].id,
    role: 'employee' as const,
    status: 'normal' as const,
    createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
  })),
];

export const courses: Course[] = [
  {
    id: 'c1',
    title: '灭火器的正确使用方法',
    type: 'extinguisher',
    duration: 15,
    description: '学习不同类型灭火器的使用场景与操作步骤，掌握"提拔握压"四字诀',
    icon: 'Flame',
    color: 'from-fire-500 to-orange-500',
    chapters: [
      {
        id: 'c1-ch1',
        title: '灭火器的种类与适用范围',
        content: '灭火器是常见的消防器材之一，不同类型的灭火器内装填的成分不同，适用的火灾类型也不同。\n\n常见灭火器分类：\n• 干粉灭火器：适用于扑救一般火灾及油、气等引起的火灾\n• 二氧化碳灭火器：适用于扑救电器精密仪器、图书档案火灾\n• 泡沫灭火器：适用于扑救油类及木材、纸张等固体火灾\n• 清水灭火器：适用于扑救木材、纸张等固体可燃物火灾',
        keyPoints: [
          'ABCD四类火灾对应不同灭火器',
          '电器火灾应使用二氧化碳或干粉灭火器',
          '油类火灾严禁使用清水灭火器',
        ],
      },
      {
        id: 'c1-ch2',
        title: '提：正确提起灭火器',
        content: '使用灭火器的第一步是"提"——正确提起灭火器。\n\n操作要点：\n1. 检查压力表是否在绿色区域（正常压力）\n2. 检查铅封、保险销是否完好\n3. 站在火源上风方向，距离火源2-3米处\n4. 用右手握住提把，左手托住底部，将灭火器竖直提起\n\n⚠️ 注意：切勿横握或倒置灭火器（除二氧化碳灭火器外）',
        keyPoints: [
          '压力表绿色区域为正常',
          '站在上风方向，距离2-3米',
          '保持灭火器竖直',
        ],
      },
      {
        id: 'c1-ch3',
        title: '拔：拔掉保险销',
        content: '第二步"拔"——拔掉保险销。\n\n操作要点：\n1. 用一只手握住压把和提把\n2. 另一只手拉住保险销拉环，用力向外拔出\n3. 保险销拔出后，压把即可按下\n\n💡 小贴士：部分灭火器还有塑料铅封，需要先用力压破铅封才能拔出保险销。',
        keyPoints: [
          '拉环要用力向外拉',
          '铅封需先压破',
          '拔出后立即进行下一步',
        ],
      },
      {
        id: 'c1-ch4',
        title: '握：握住喷管对准火源',
        content: '第三步"握"——握住喷管对准火源根部。\n\n操作要点：\n1. 左手握住喷管前端（注意：二氧化碳灭火器喷管有冻伤危险，需握住绝缘手柄）\n2. 将喷嘴对准火源根部，而非火焰顶部\n3. 身体保持侧立，避免正对火焰\n\n🔥 关键：灭火的关键是喷向燃烧物（根部），而不是喷火焰本身！',
        keyPoints: [
          '对准火源根部而非火焰',
          '身体侧立，保持安全距离',
          '二氧化碳灭火器注意防冻伤',
        ],
      },
      {
        id: 'c1-ch5',
        title: '压：压下压把扫射灭火',
        content: '第四步"压"——压下压把，由近及远扫射灭火。\n\n操作要点：\n1. 右手用力压下压把，使灭火剂喷出\n2. 由近及远、左右扫射，直至火焰全部熄灭\n3. 灭火后继续喷射几秒，防止复燃\n4. 如为室外，始终保持在上风方向\n\n⚠️ 注意事项：\n• 火势较大时，应边灭火边呼叫支援\n• 电器火灾先断电再灭火\n• 灭火后注意通风换气',
        keyPoints: [
          '由近及远，左右扫射',
          '灭火后防止复燃',
          '电器火灾先断电',
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: '楼层疏散路线与逃生要点',
    type: 'evacuation',
    duration: 12,
    description: '熟悉办公楼层疏散路线，掌握火灾逃生的正确姿势与注意事项',
    icon: 'Navigation',
    color: 'from-ocean-500 to-cyan-500',
    chapters: [
      {
        id: 'c2-ch1',
        title: '疏散路线与安全出口',
        content: '熟悉工作场所的疏散路线是火灾逃生的首要前提。\n\n疏散三要素：\n• 安全出口：本楼层至少有2个独立安全出口\n• 疏散通道：保持通道畅通，严禁堆放杂物\n• 应急照明：楼道配备应急灯和疏散指示标志\n\n请牢记：\n1. 离你工位最近的安全出口位置\n2. 至少两条不同方向的逃生路线\n3. 楼层消防通道（楼梯间）位置\n4. 室外集合点位置',
        keyPoints: [
          '熟记至少两条逃生路线',
          '安全出口标识为绿色"安全出口"',
          '消防楼梯间是最安全的逃生通道',
        ],
      },
      {
        id: 'c2-ch2',
        title: '正确的逃生姿势',
        content: '火灾中80%的死亡是因吸入有毒烟雾造成的，掌握正确姿势至关重要。\n\n正确姿势：\n1. 弯腰低姿前行：浓烟自上而下扩散，近地面30-60cm空气相对清洁\n2. 用湿毛巾捂住口鼻：折叠8层的湿毛巾可过滤60%的烟雾\n3. 靠墙逃生：沿墙壁摸行，可避免被掉落物砸伤，不易迷路\n4. 匍匐前进：烟雾浓密时，应采用匍匐姿势前进\n\n🚫 严禁：\n• 乘坐电梯（断电会被困，电梯井形成烟囱效应）\n• 直立奔跑（吸入大量有毒烟雾）\n• 大声喊叫（吸入烟雾+浪费体力）',
        keyPoints: [
          '弯腰低姿，贴近地面',
          '湿毛巾捂口鼻（叠8层）',
          '沿墙壁逃生不迷路',
        ],
      },
      {
        id: 'c2-ch3',
        title: '不同场景的逃生策略',
        content: '根据火情位置和实际情况选择正确的逃生策略。\n\n场景一：所在楼层起火\n• 火势较小：穿戴好衣物，沿疏散楼梯向下逃生\n• 火势较大：关紧门缝塞湿布，退到窗边求救\n\n场景二：上层起火\n• 沿疏散楼梯向下层撤离\n• 注意：如楼梯间充满浓烟，返回房间等待救援\n\n场景三：下层起火且火势猛烈\n• 切勿向下冲，退回房间关紧门窗\n• 用水泼洒房门降温\n• 到阳台或窗口用鲜艳衣物挥动求救',
        keyPoints: [
          '下层起火猛烈时不要硬冲',
          '退回房间等待救援也是正确选择',
          '用湿布条塞门缝防烟进入',
        ],
      },
      {
        id: 'c2-ch4',
        title: '集合清点与注意事项',
        content: '成功撤离后，到指定集合点集合，配合管理人员清点人数。\n\n集合点要求：\n• 远离建筑物（至少50米以上）\n• 不影响消防车通行\n• 位于建筑物上风方向\n• 有明显的标识便于寻找\n\n📋 撤离后注意：\n1. 立即到集合点报到，不擅自离开\n2. 向部门负责人或安全员报到\n3. 如发现有同事未撤离，立即告知消防人员\n4. 切勿因财物返回火场\n5. 保持秩序，服从指挥',
        keyPoints: [
          '到指定集合点报到',
          '发现有人被困立即告知消防员',
          '绝不因财物重返火场',
        ],
      },
    ],
  },
  {
    id: 'c3',
    title: '火警报警与应急处置流程',
    type: 'alarm',
    duration: 10,
    description: '掌握火警报警的正确流程，学习"发现-确认-报警-疏散"四步处置法',
    icon: 'Phone',
    color: 'from-warn-500 to-amber-500',
    chapters: [
      {
        id: 'c3-ch1',
        title: '第一步：发现火情',
        content: '及时发现火情是减少损失的关键。\n\n火情的发现途径：\n• 视觉：看到烟雾、火光\n• 听觉：听到火灾报警器鸣响、他人呼喊\n• 嗅觉：闻到烧焦味、烟味、天然气味\n• 触觉：触摸到门、墙壁发烫\n\n发现异常后的第一反应：\n1. 立即停止手中工作\n2. 确认自身位置与最近的安全出口\n3. 保持冷静，不要惊慌\n4. 迅速进入下一步：确认火情',
        keyPoints: [
          '保持冷静，不慌乱',
          '立即确认逃生方向',
          '火情初期最容易控制',
        ],
      },
      {
        id: 'c3-ch2',
        title: '第二步：确认火情',
        content: '在确保自身安全的前提下，快速确认火情大小与位置。\n\n确认要点：\n1. 火源位置：哪里起火？\n2. 燃烧物质：什么在燃烧？（纸张/电器/油料？）\n3. 火势大小：初期小火/已蔓延？\n4. 人员情况：现场有无人员被困？\n5. 有无爆炸/毒气风险？\n\n⚠️ 开门查看前先试温度：\n用手背触摸门把手：\n• 温度正常 → 可小心开门查看\n• 温度较高 → 说明门外已有火或烟，切勿开门！',
        keyPoints: [
          '用手背试门温，用手心会烫伤',
          '门热不要开，说明火势已大',
          '确认是否有人员被困',
        ],
      },
      {
        id: 'c3-ch3',
        title: '第三步：拨打119报警',
        content: '任何时候都应第一时间拨打119报警，切勿因认为"火小"而延误！\n\n📞 报警七要素（说清楚）：\n1. 起火详细地址（区/路/号/栋/层）\n2. 起火物是什么（电器/木材/油料等）\n3. 火势大小（冒烟/明火/蔓延情况）\n4. 有无人员被困\n5. 报警人姓名和电话\n6. 约定接车地点（如路口）\n7. 耐心回答接警员问题\n\n🏢 企业内部还应：\n• 按下手动火灾报警按钮\n• 通知公司安全管理部门\n• 大声呼喊提醒周边同事',
        keyPoints: [
          '报警要说清地址和起火物',
          '留下手机号保持畅通',
          '小火灾也要报警，安全第一',
        ],
      },
      {
        id: 'c3-ch4',
        title: '第四步：组织疏散',
        content: '报警后立即组织人员疏散，不要贪恋财物。\n\n疏散原则：\n• 先人后物：人命永远是第一位的\n• 有序撤离：按楼层、按区域，避免拥挤踩踏\n• 照顾弱者：帮助老弱病残孕同事\n• 边撤边喊：边走边提醒其他办公室人员\n\n如果你是第一个发现火情的人：\n1. 大声呼喊"起火了！"\n2. 按下最近的手动报警按钮\n3. 拨打119并通知安全管理员\n4. 在确保安全的前提下，尝试使用灭火器灭火初期小火\n5. 如火势无法控制，立即撤离',
        keyPoints: [
          '先人后物，绝不返回取财物',
          '有序撤离防止踩踏',
          '初期小火可尝试用灭火器',
        ],
      },
      {
        id: 'c3-ch5',
        title: '模拟报警对话练习',
        content: '下面是一段标准的119报警对话，请熟悉流程。\n\n👮 接警员：您好，119指挥中心。\n\n👤 报警人：您好！XX大厦A栋15楼起火了！\n\n👮 接警员：请说一下具体地址？\n\n👤 报警人：XX市XX区XX路888号XX大厦A栋15楼1503室。\n\n👮 接警员：什么东西在燃烧？火势大不大？\n\n👤 报警人：好像是办公桌和文件柜，现在有明火和浓烟，我看到有人员被困在里面了！\n\n👮 接警员：有没有人员受伤？请留下您的姓名和手机号。\n\n👤 报警人：目前不清楚有没有受伤的，我叫张三，手机号13800138000。我们在楼下路口接消防车！\n\n👮 接警员：好的，消防车已经派出，请保持电话畅通，注意安全。',
        keyPoints: [
          '沉着冷静回答每个问题',
          '主动提供关键信息',
          '约定接车地点很重要',
        ],
      },
    ],
  },
];

export const questions: Question[] = [
  {
    id: 'q1',
    type: 'single',
    content: '使用灭火器灭火时，应该对准火焰的哪个部位喷射？',
    options: [
      { key: 'A', text: '火焰的顶部' },
      { key: 'B', text: '火焰的中部' },
      { key: 'C', text: '火源的根部（燃烧物）' },
      { key: 'D', text: '随便哪里都可以' },
    ],
    answer: 'C',
    category: 'extinguisher',
    score: 10,
    explanation: '灭火的关键是扑灭燃烧物，因此应对准火源根部喷射。',
  },
  {
    id: 'q2',
    type: 'single',
    content: '灭火器使用的正确操作顺序是？',
    options: [
      { key: 'A', text: '拔→提→握→压' },
      { key: 'B', text: '提→拔→握→压' },
      { key: 'C', text: '握→提→拔→压' },
      { key: 'D', text: '压→拔→握→提' },
    ],
    answer: 'B',
    category: 'extinguisher',
    score: 10,
    explanation: '四字诀：提拔握压——提起、拔销、握管、压把。',
  },
  {
    id: 'q3',
    type: 'judge',
    content: '电器设备着火时，可以使用清水灭火器进行灭火。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    answer: 'B',
    category: 'extinguisher',
    score: 10,
    explanation: '电器火灾严禁使用清水，应使用二氧化碳或干粉灭火器，且必须先断电再灭火。',
  },
  {
    id: 'q4',
    type: 'multiple',
    content: '发生火灾时，正确的逃生姿势包括？（多选）',
    options: [
      { key: 'A', text: '弯腰低姿前行' },
      { key: 'B', text: '用湿毛巾捂住口鼻' },
      { key: 'C', text: '直立快速奔跑' },
      { key: 'D', text: '沿墙壁一侧逃生' },
    ],
    answer: ['A', 'B', 'D'],
    category: 'evacuation',
    score: 10,
    explanation: '直立奔跑会吸入大量有毒烟雾，应弯腰低姿，贴近地面空气相对清洁区域前进。',
  },
  {
    id: 'q5',
    type: 'single',
    content: '火灾逃生时应该乘坐什么交通工具？',
    options: [
      { key: 'A', text: '乘坐电梯快速下楼' },
      { key: 'B', text: '从窗户直接跳下' },
      { key: 'C', text: '从疏散楼梯间撤离' },
      { key: 'D', text: '乘坐货梯' },
    ],
    answer: 'C',
    category: 'evacuation',
    score: 10,
    explanation: '火灾时严禁乘坐电梯（可能断电被困，电梯井是烟囱效应通道），必须走消防楼梯。',
  },
  {
    id: 'q6',
    type: 'judge',
    content: '火灾逃生时，如果发现贵重物品遗忘在办公室，应该立即返回取出。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    answer: 'B',
    category: 'evacuation',
    score: 10,
    explanation: '生命第一，任何情况下都不能因财物返回火场！',
  },
  {
    id: 'q7',
    type: 'single',
    content: '发现火灾后，应该在什么时间拨打119报警？',
    options: [
      { key: 'A', text: '等火势大了再报' },
      { key: 'B', text: '确认火情后立即报警' },
      { key: 'C', text: '先自己灭火，灭不了再报' },
      { key: 'D', text: '等领导批准后再报' },
    ],
    answer: 'B',
    category: 'alarm',
    score: 10,
    explanation: '任何火情都应第一时间报警，初起火灾虽好扑灭，但切勿因"以为火小"而延误报警时机。',
  },
  {
    id: 'q8',
    type: 'multiple',
    content: '拨打119报警时，需要说清哪些信息？（多选）',
    options: [
      { key: 'A', text: '详细的起火地址' },
      { key: 'B', text: '燃烧物质和火势大小' },
      { key: 'C', text: '报警人姓名和联系电话' },
      { key: 'D', text: '有无人员被困' },
    ],
    answer: ['A', 'B', 'C', 'D'],
    category: 'alarm',
    score: 10,
    explanation: '报警七要素都要说清楚，便于消防部门快速准确地派出救援力量。',
  },
  {
    id: 'q9',
    type: 'single',
    content: '打开房门查看火情前，应如何检查门外情况？',
    options: [
      { key: 'A', text: '直接迅速开门查看' },
      { key: 'B', text: '用手心触摸门把手感受温度' },
      { key: 'C', text: '用手背触摸门把手感受温度' },
      { key: 'D', text: '趴在地上从门缝看' },
    ],
    answer: 'C',
    category: 'alarm',
    score: 10,
    explanation: '用手背试温，因为手心对温度不敏感且如果门把手很烫，手心被烫会本能抓握造成二次伤害。',
  },
  {
    id: 'q10',
    type: 'single',
    content: '使用灭火器时，人应站在火源的什么位置？',
    options: [
      { key: 'A', text: '下风方向' },
      { key: 'B', text: '上风方向' },
      { key: 'C', text: '正对着火源' },
      { key: 'D', text: '任意位置都可以' },
    ],
    answer: 'B',
    category: 'extinguisher',
    score: 10,
    explanation: '站在上风方向，灭火剂会被风吹向火源，同时避免自己被烟雾和火焰侵袭。',
  },
];

function generateLearningRecords(): LearningRecord[] {
  const records: LearningRecord[] = [];
  users.filter(u => u.role === 'employee').forEach((user, ui) => {
    courses.forEach((course, ci) => {
      const rand = Math.random();
      const completed = ui < 30 || (ui < 35 && ci < 2);
      records.push({
        id: `lr-${ui}-${ci}`,
        userId: user.id,
        courseId: course.id,
        completed,
        progress: completed ? 100 : Math.floor(rand * 80),
        completedChapters: completed ? course.chapters.map(c => c.id) : course.chapters.slice(0, Math.floor(rand * course.chapters.length)).map(c => c.id),
        completedAt: completed ? `2026-06-${String((ui % 10) + 1).padStart(2, '0')}T10:00:00.000Z` : undefined,
        startedAt: `2026-06-${String(((ui + ci) % 10) + 1).padStart(2, '0')}T09:00:00.000Z`,
      });
    });
  });
  return records;
}

function generateQuizResults(): QuizResult[] {
  const results: QuizResult[] = [];
  users.filter(u => u.role === 'employee').forEach((user, ui) => {
    const hasResult = ui < 32;
    if (!hasResult) return;
    const score = 50 + Math.floor(Math.random() * 51);
    const passed = score >= 80;
    results.push({
      id: `qr-${ui}`,
      userId: user.id,
      score,
      totalScore: 100,
      passed,
      attemptNo: passed ? 1 : 1 + (ui % 2),
      timeUsed: 180 + Math.floor(Math.random() * 300),
      takenAt: `2026-06-${String((ui % 10) + 2).padStart(2, '0')}T14:00:00.000Z`,
      answers: questions.slice(0, 10).map(q => {
        const isCorrect = Math.random() < (score / 100);
        const userAns = isCorrect
          ? q.answer
          : (Array.isArray(q.answer)
              ? q.options.slice(0, Math.floor(Math.random() * 3) + 1).map(o => o.key)
              : q.options[Math.floor(Math.random() * q.options.length)].key);
        return {
          questionId: q.id,
          userAnswer: userAns,
          correct: isCorrect,
          scoreGot: isCorrect ? q.score : 0,
          questionContent: q.content,
          correctAnswer: q.answer,
        };
      }),
    });
  });
  return results;
}

function generateCheckinRecords(): CheckinRecord[] {
  const records: CheckinRecord[] = [];
  users.filter(u => u.role === 'employee').forEach((user, ui) => {
    const hasCheckin = ui < 26;
    if (!hasCheckin) return;
    records.push({
      id: `cr-${ui}`,
      userId: user.id,
      checkinCode: 'FIRE2026',
      success: true,
      location: 'A栋1楼大厅',
      checkinAt: `2026-06-${String((ui % 8) + 3).padStart(2, '0')}T09:30:00.000Z`,
    });
  });
  return records;
}

export const learningRecords: LearningRecord[] = generateLearningRecords();
export const quizResults: QuizResult[] = generateQuizResults();
export const checkinRecords: CheckinRecord[] = generateCheckinRecords();

export const CHECKIN_CODE = 'FIRE2026';
export const PASS_SCORE = 80;
export const QUIZ_DURATION = 600;
