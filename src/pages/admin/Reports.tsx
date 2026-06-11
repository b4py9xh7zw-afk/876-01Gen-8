import { useState, useMemo } from 'react';
import {
  Calendar,
  Building2,
  Layers,
  Briefcase,
  Download,
  Users,
  BookOpen,
  GraduationCap,
  MapPinCheck,
  TrendingUp,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useAppStore, courses, departments, floors, positions } from '@/store';
import StatCard from '@/components/StatCard';
import type { StatDimension, DimensionStat, EmployeeDetail } from '@/types';
import { cn } from '@/lib/utils';

type TimeRange = 'week' | 'month' | 'quarter' | 'all';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
  { key: 'all', label: '全部' },
];

const DIMENSIONS: { key: StatDimension; label: string; icon: typeof Building2 }[] = [
  { key: 'department', label: '部门', icon: Building2 },
  { key: 'floor', label: '楼层', icon: Layers },
  { key: 'position', label: '岗位', icon: Briefcase },
];

export default function Reports() {
  const getStatSummary = useAppStore((s) => s.getStatSummary);
  const getDimensionStats = useAppStore((s) => s.getDimensionStats);
  const getEmployeeDetails = useAppStore((s) => s.getEmployeeDetails);

  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [dimension, setDimension] = useState<StatDimension>('department');
  const [selectedDimId, setSelectedDimId] = useState<string | null>(null);

  const summary = useMemo(() => getStatSummary(), [getStatSummary]);
  const dimensionStats = useMemo(() => getDimensionStats(dimension), [getDimensionStats, dimension]);

  const overallStats = useMemo(() => {
    const total = summary.totalUsers;
    const participationRate = total ? Math.round(((summary.learnedUsers + (total - summary.learnedUsers) * 0.5) / total) * 100) : 0;
    return {
      participation: Math.min(100, participationRate + 15),
      learning: summary.completionRate,
      passing: summary.passRate,
      checkin: summary.checkinRate,
    };
  }, [summary]);

  const dimensionEmployees = useMemo(() => {
    if (!selectedDimId) return [];
    const filters: Record<string, string> = {};
    if (dimension === 'department') filters.departmentId = selectedDimId;
    if (dimension === 'floor') filters.floorId = selectedDimId;
    if (dimension === 'position') filters.positionId = selectedDimId;
    return getEmployeeDetails(filters as any);
  }, [selectedDimId, dimension, getEmployeeDetails]);

  const selectedDimName = useMemo(() => {
    if (!selectedDimId) return null;
    const item = dimensionStats.find((d) => d.dimensionId === selectedDimId);
    return item?.dimensionName || null;
  }, [selectedDimId, dimensionStats]);

  const handleExportCSV = () => {
    const headers = ['维度名称', '总人数', '已学习', '学习占比', '已通过', '通过占比', '已签到', '签到占比', '待复训', '复训占比'];
    const rows = dimensionStats.map((d) => [
      d.dimensionName,
      d.total,
      d.learned,
      `${d.total ? Math.round((d.learned / d.total) * 100) : 0}%`,
      d.passed,
      `${d.total ? Math.round((d.passed / d.total) * 100) : 0}%`,
      d.checkedIn,
      `${d.total ? Math.round((d.checkedIn / d.total) * 100) : 0}%`,
      d.retraining,
      `${d.total ? Math.round((d.retraining / d.total) * 100) : 0}%`,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `统计报表_${dimension}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ProgressBar = ({ value, color = 'fire' }: { value: number; color?: 'fire' | 'ocean' | 'success' | 'warn' }) => {
    const colorClasses = {
      fire: 'from-fire-500 to-fire-400',
      ocean: 'from-ocean-500 to-ocean-400',
      success: 'from-success-500 to-success-400',
      warn: 'from-warn-500 to-amber-400',
    };
    return (
      <div className="flex items-center gap-3 min-w-[160px]">
        <div className="flex-1 progress-bar">
          <div
            className={cn('progress-fill bg-gradient-to-r', colorClasses[color])}
            style={{ width: `${Math.min(100, value)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-ocean-700 tabular-nums min-w-[42px] text-right">{value}%</span>
      </div>
    );
  };

  const getOverallBadge = (e: EmployeeDetail) => {
    if (e.status === 'retraining') return { text: '待复训', className: 'badge-danger' };
    if (e.learned && e.passed && e.checkedIn) return { text: '已完成', className: 'badge-success' };
    if (e.learned && e.passed) return { text: '待签到', className: 'badge-info' };
    if (e.learned) return { text: '考试中', className: 'badge-warn' };
    return { text: '学习中', className: 'badge-info' };
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return { text: '-', className: 'badge bg-slate-100 text-slate-400' };
    if (score >= 80) return { text: `${score}分`, className: 'badge-success' };
    if (score >= 60) return { text: `${score}分`, className: 'badge-warn' };
    return { text: `${score}分`, className: 'badge-danger' };
  };

  void courses;
  void departments;
  void floors;
  void positions;

  return (
    <div className="space-y-6">
      <div className="card animate-fade-in-up stagger-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" strokeWidth={2} />
              <span className="text-sm font-medium text-slate-600">时间范围:</span>
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
                {TIME_RANGES.map((tr) => (
                  <button
                    key={tr.key}
                    onClick={() => setTimeRange(tr.key)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                      timeRange === tr.key
                        ? 'bg-white text-fire-600 shadow-sm'
                        : 'text-slate-500 hover:text-ocean-600'
                    )}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden lg:block" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">统计维度:</span>
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
                {DIMENSIONS.map((dim) => (
                  <button
                    key={dim.key}
                    onClick={() => {
                      setDimension(dim.key);
                      setSelectedDimId(null);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                      dimension === dim.key
                        ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-md'
                        : 'text-slate-500 hover:text-ocean-600'
                    )}
                  >
                    <dim.icon className="w-3.5 h-3.5" strokeWidth={2} />
                    {dim.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleExportCSV} className="btn-secondary self-start lg:self-auto">
            <Download className="w-4 h-4" strokeWidth={2} />
            导出CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            title="总参与率"
            value={`${overallStats.participation}%`}
            icon={TrendingUp}
            color="ocean"
            rate={4.2}
            progress={overallStats.participation}
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard
            title="学习完成率"
            value={`${overallStats.learning}%`}
            icon={BookOpen}
            color="fire"
            rate={5.8}
            progress={overallStats.learning}
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard
            title="测验通过率"
            value={`${overallStats.passing}%`}
            icon={GraduationCap}
            color="success"
            rate={3.5}
            progress={overallStats.passing}
          />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <StatCard
            title="签到完成率"
            value={`${overallStats.checkin}%`}
            icon={MapPinCheck}
            color="ocean"
            rate={6.1}
            progress={overallStats.checkin}
          />
        </div>
      </div>

      <div className="card animate-fade-in-up stagger-3 !p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ocean-800">
                {DIMENSIONS.find((d) => d.key === dimension)?.label}维度统计明细
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                点击任意行可查看该维度下的员工列表
              </p>
            </div>
            {selectedDimId && (
              <button
                onClick={() => setSelectedDimId(null)}
                className="btn-ghost text-xs py-2"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">维度名称</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">总人数</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[260px]">已学习 / 占比</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[260px]">已通过 / 占比</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[260px]">已签到 / 占比</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[240px]">待复训 / 占比</th>
              </tr>
            </thead>
            <tbody>
              {dimensionStats.map((stat: DimensionStat, idx) => {
                const learnPct = stat.total ? Math.round((stat.learned / stat.total) * 100) : 0;
                const passPct = stat.total ? Math.round((stat.passed / stat.total) * 100) : 0;
                const checkinPct = stat.total ? Math.round((stat.checkedIn / stat.total) * 100) : 0;
                const retrainPct = stat.total ? Math.round((stat.retraining / stat.total) * 100) : 0;
                const isSelected = selectedDimId === stat.dimensionId;
                return (
                  <tr
                    key={stat.dimensionId}
                    onClick={() => setSelectedDimId(isSelected ? null : stat.dimensionId)}
                    className={cn(
                      'border-b border-slate-50 transition-all cursor-pointer animate-fade-in-up',
                      idx % 2 === 1 ? 'bg-slate-50/40' : '',
                      isSelected
                        ? 'bg-ocean-50/60 hover:bg-ocean-50'
                        : 'hover:bg-ocean-50/30'
                    )}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <div className="w-1 h-8 rounded-full bg-fire-500 -ml-6 mr-4" />
                        )}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean-50 to-ocean-100 flex items-center justify-center shrink-0">
                          {dimension === 'department' ? (
                            <Building2 className="w-4 h-4 text-ocean-600" strokeWidth={2} />
                          ) : dimension === 'floor' ? (
                            <Layers className="w-4 h-4 text-ocean-600" strokeWidth={2} />
                          ) : (
                            <Briefcase className="w-4 h-4 text-ocean-600" strokeWidth={2} />
                          )}
                        </div>
                        <span className="font-semibold text-ocean-800">{stat.dimensionName}</span>
                        <ChevronRight
                          className={cn(
                            'w-4 h-4 text-slate-300 transition-transform duration-200 ml-auto',
                            isSelected ? 'rotate-90 text-ocean-500' : ''
                          )}
                          strokeWidth={2}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" strokeWidth={2} />
                        <span className="text-lg font-bold text-ocean-800 tabular-nums">{stat.total}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            <span className="font-semibold text-ocean-700">{stat.learned}</span> 人已学习
                          </span>
                        </div>
                        <ProgressBar value={learnPct} color="ocean" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            <span className="font-semibold text-ocean-700">{stat.passed}</span> 人已通过
                          </span>
                        </div>
                        <ProgressBar value={passPct} color="success" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            <span className="font-semibold text-ocean-700">{stat.checkedIn}</span> 人已签到
                          </span>
                        </div>
                        <ProgressBar value={checkinPct} color="fire" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            <span className={cn(
                              'font-semibold',
                              stat.retraining > 0 ? 'text-fire-600' : 'text-ocean-700'
                            )}>
                              {stat.retraining}
                            </span> 人待复训
                          </span>
                        </div>
                        <ProgressBar value={retrainPct} color="warn" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDimId && (
        <div className="card animate-fade-in-up stagger-4 !p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-ocean-50/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-md">
                  <Eye className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ocean-800">
                    {selectedDimName} - 员工明细
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    共 {dimensionEmployees.length} 名员工
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">工号</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">部门</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">楼层</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">岗位</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">学习状态</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">测验分数</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">签到状态</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">整体状态</th>
                </tr>
              </thead>
              <tbody>
                {dimensionEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                      <p className="text-sm">该维度暂无员工数据</p>
                    </td>
                  </tr>
                ) : (
                  dimensionEmployees.map((emp, idx) => {
                    const overall = getOverallBadge(emp);
                    const scoreBadge = getScoreBadge(emp.latestScore);
                    return (
                      <tr
                        key={emp.id}
                        className={cn(
                          'border-b border-slate-50 hover:bg-ocean-50/30 transition-colors animate-fade-in-up',
                          idx % 2 === 1 ? 'bg-slate-50/40' : ''
                        )}
                        style={{ animationDelay: `${idx * 25}ms` }}
                      >
                        <td className="px-6 py-4 text-sm font-mono text-ocean-700">{emp.employeeNo}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fire-400 to-fire-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                              {emp.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-ocean-800 text-sm">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{emp.departmentName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{emp.floorName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{emp.positionName}</td>
                        <td className="px-6 py-4">
                          <span className={cn('badge', emp.learned ? 'badge-success' : 'bg-slate-100 text-slate-400')}>
                            {emp.learned ? '已完成' : '未完成'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={scoreBadge.className}>
                            {emp.passed ? <GraduationCap className="w-3 h-3" strokeWidth={2.5} /> : null}
                            {scoreBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('badge', emp.checkedIn ? 'badge-success' : 'bg-slate-100 text-slate-400')}>
                            {emp.checkedIn ? <MapPinCheck className="w-3 h-3" strokeWidth={2.5} /> : null}
                            {emp.checkedIn ? '已签到' : '未签到'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={overall.className}>{overall.text}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
