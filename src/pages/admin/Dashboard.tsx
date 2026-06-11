import { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  MapPinCheck,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Bell,
  Building2,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useAppStore, courses, departments, floors, positions } from '@/store';
import StatCard from '@/components/StatCard';
import type { StatDimension, EmployeeDetail } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_COLORS = [
  '#94A3B8',
  '#4EA8C4',
  '#F4A261',
  '#86C7DA',
  '#2A9D8F',
  '#E63946',
];

const STATUS_NAMES = ['未开始', '学习中', '考试中', '待签到', '已完成', '待复训'];

export default function Dashboard() {
  const getStatSummary = useAppStore((s) => s.getStatSummary);
  const getDimensionStats = useAppStore((s) => s.getDimensionStats);
  const getRetrainingList = useAppStore((s) => s.getRetrainingList);
  const getEmployeeDetails = useAppStore((s) => s.getEmployeeDetails);
  const setUserRetraining = useAppStore((s) => s.setUserRetraining);

  const [dimension, setDimension] = useState<StatDimension>('department');
  const [notifiedUsers, setNotifiedUsers] = useState<Set<string>>(new Set());

  const summary = useMemo(() => getStatSummary(), [getStatSummary]);
  const dimensionStats = useMemo(() => getDimensionStats(dimension), [getDimensionStats, dimension]);
  const retrainingList = useMemo(() => getRetrainingList(), [getRetrainingList]);
  const allEmployees = useMemo(() => getEmployeeDetails({}), [getEmployeeDetails]);

  const chartData = useMemo(
    () =>
      dimensionStats.map((d) => ({
        name: d.dimensionName,
        已学习: d.learned,
        已通过: d.passed,
        已签到: d.checkedIn,
      })),
    [dimensionStats]
  );

  const statusDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    allEmployees.forEach((e) => {
      if (e.status === 'retraining') {
        counts[5]++;
      } else if (e.learned && e.passed && e.checkedIn) {
        counts[4]++;
      } else if (e.learned && e.passed && !e.checkedIn) {
        counts[3]++;
      } else if (e.learned && !e.passed) {
        counts[2]++;
      } else if (!e.learned) {
        const hasAnyProgress = e.learned === false;
        if (hasAnyProgress) {
          counts[1]++;
        } else {
          counts[0]++;
        }
      } else {
        counts[1]++;
      }
    });
    return STATUS_NAMES.map((name, i) => ({ name, value: counts[i] }));
  }, [allEmployees]);

  const trendData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const base = 50 + (7 - i) * 5;
      days.push({
        date: dateStr,
        学习完成率: Math.min(100, base + Math.round(Math.random() * 10)),
        测验通过率: Math.min(100, base - 5 + Math.round(Math.random() * 8)),
        签到完成率: Math.min(100, base - 10 + Math.round(Math.random() * 6)),
      });
    }
    return days;
  }, []);

  const handleNotify = (userId: string) => {
    setNotifiedUsers((prev) => new Set([...prev, userId]));
  };

  const handleRetrainReason = (e: EmployeeDetail) => {
    if (!e.passed) return '未通过测验';
    if (!e.checkedIn) return '未完成签到';
    return '未达标';
  };

  const kpiItems = [
    {
      title: '总人数',
      value: summary.totalUsers,
      icon: Users,
      color: 'ocean',
      rate: 2.5,
      suffix: '人',
      progress: 100,
    },
    {
      title: '已学习',
      value: summary.learnedUsers,
      icon: BookOpen,
      color: 'fire',
      rate: 5.2,
      suffix: '人',
      progress: summary.completionRate,
    },
    {
      title: '已通过测验',
      value: summary.passedUsers,
      icon: GraduationCap,
      color: 'success',
      rate: 3.8,
      suffix: '人',
      progress: summary.passRate,
    },
    {
      title: '已签到',
      value: summary.checkedInUsers,
      icon: MapPinCheck,
      color: 'ocean',
      rate: 4.1,
      suffix: '人',
      progress: summary.checkinRate,
    },
    {
      title: '待复训',
      value: summary.retrainingUsers,
      icon: AlertTriangle,
      color: 'warn',
      rate: -1.2,
      suffix: '人',
      progress: summary.totalUsers ? Math.round((summary.retrainingUsers / summary.totalUsers) * 100) : 0,
    },
  ];

  const dimensionButtons: { key: StatDimension; label: string; icon: typeof Building2 }[] = [
    { key: 'department', label: '部门', icon: Building2 },
    { key: 'floor', label: '楼层', icon: Layers },
    { key: 'position', label: '岗位', icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpiItems.map((item, idx) => (
          <div
            key={item.title}
            className={cn('animate-fade-in-up', `stagger-${idx + 1}`)}
          >
            <StatCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              rate={item.rate}
              suffix={item.suffix}
              delay={idx * 50}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-ocean-800">维度统计分析</h3>
              <p className="text-sm text-slate-400 mt-0.5">按不同维度查看学习完成情况</p>
            </div>
            <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100">
              {dimensionButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setDimension(btn.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                    dimension === btn.key
                      ? 'bg-white text-fire-600 shadow-sm'
                      : 'text-slate-500 hover:text-ocean-600'
                  )}
                >
                  <btn.icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="learnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4EA8C4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1D3557" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="passedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3DB4A4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2A9D8F" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="checkedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E63946" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: 13,
                  }}
                  cursor={{ fill: 'rgba(29,53,87,0.04)' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                />
                <Bar
                  dataKey="已学习"
                  fill="url(#learnedGrad)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="已通过"
                  fill="url(#passedGrad)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1400}
                />
                <Bar
                  dataKey="已签到"
                  fill="url(#checkedGrad)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-ocean-800">学习状态分布</h3>
              <p className="text-sm text-slate-400 mt-0.5">全体人员当前状态占比</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-ocean-800">{summary.totalUsers}</p>
              <p className="text-xs text-slate-400">总人数</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {STATUS_COLORS.map((c, i) => (
                    <filter key={i} id={`shadow-${i}`}>
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      filter={`url(#shadow-${index})`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: 13,
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} 人 (${summary.totalUsers ? ((value / summary.totalUsers) * 100).toFixed(1) : 0}%)`,
                    name,
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: 12, lineHeight: '24px' }}
                  formatter={(value) => <span className="text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-ocean-800">完成率趋势</h3>
              <p className="text-sm text-slate-400 mt-0.5">最近7天各项指标变化</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-ocean-400 to-ocean-500" />
                <span className="text-slate-500">学习完成率</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-success-400 to-success-500" />
                <span className="text-slate-500">测验通过率</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-fire-400 to-fire-500" />
                <span className="text-slate-500">签到完成率</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="learnedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4EA8C4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4EA8C4" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="passedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3DB4A4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3DB4A4" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="checkedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F87171" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [`${value}%`]}
                  cursor={{ stroke: '#E2E8F0', strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="学习完成率"
                  stroke="#1D3557"
                  strokeWidth={2.5}
                  fill="url(#learnedArea)"
                  animationDuration={1800}
                  dot={{ r: 4, fill: '#1D3557', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="测验通过率"
                  stroke="#2A9D8F"
                  strokeWidth={2.5}
                  fill="url(#passedArea)"
                  animationDuration={2000}
                  dot={{ r: 4, fill: '#2A9D8F', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="签到完成率"
                  stroke="#E63946"
                  strokeWidth={2.5}
                  fill="url(#checkedArea)"
                  animationDuration={2200}
                  dot={{ r: 4, fill: '#E63946', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 card animate-fade-in-up stagger-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-ocean-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warn-500" strokeWidth={2} />
                待复训人员
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">共 {retrainingList.length} 人需要复训</p>
            </div>
            <span className="badge-danger">
              <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
              {retrainingList.length}
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2">
            {retrainingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">暂无待复训人员</p>
              </div>
            ) : (
              retrainingList.map((emp, idx) => {
                const notified = notifiedUsers.has(emp.id);
                const reason = handleRetrainReason(emp);
                return (
                  <div
                    key={emp.id}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-fire-50/50 to-transparent border border-fire-100/60 hover:border-fire-200 hover:shadow-sm transition-all duration-200 animate-fade-in-up'
                    )}
                    style={{ animationDelay: `${idx * 60 + 300}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fire-400 to-fire-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ocean-800 text-sm truncate">{emp.name}</p>
                        <span className={cn(
                          'badge shrink-0',
                          reason === '未通过测验' ? 'badge-warn' : 'badge-danger'
                        )}>
                          {reason}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {emp.departmentName} · {emp.positionName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotify(emp.id)}
                      disabled={notified}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0',
                        notified
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-fire-500 text-white hover:bg-fire-600 shadow-sm hover:shadow-md active:scale-95'
                      )}
                    >
                      <Bell className="w-3.5 h-3.5" strokeWidth={2} />
                      {notified ? '已通知' : '通知'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

void courses;
void departments;
void floors;
void positions;
