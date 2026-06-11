import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle2,
  Download,
  Users,
  GraduationCap,
  MapPinCheck,
  Filter,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useAppStore, departments, floors, positions } from '@/store';
import type { EmployeeDetail } from '@/types';
import { cn } from '@/lib/utils';

const RETRAIN_REASON_COLORS = ['#E63946', '#F4A261'];

type ReasonFilter = 'all' | 'passed_fail' | 'checkin_fail';

export default function Retraining() {
  const getRetrainingList = useAppStore((s) => s.getRetrainingList);
  const getEmployeeDetails = useAppStore((s) => s.getEmployeeDetails);
  const setUserRetraining = useAppStore((s) => s.setUserRetraining);
  const getStatSummary = useAppStore((s) => s.getStatSummary);

  const [departmentId, setDepartmentId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all');
  const [notifiedUsers, setNotifiedUsers] = useState<Set<string>>(new Set());
  const [completedUsers, setCompletedUsers] = useState<Set<string>>(new Set());

  const retrainingList = useMemo(() => getRetrainingList(), [getRetrainingList]);
  const summary = useMemo(() => getStatSummary(), [getStatSummary]);

  const getRetrainReason = (e: EmployeeDetail) => {
    if (!e.passed) return { key: 'passed_fail', label: '未通过测验' };
    if (!e.checkedIn) return { key: 'checkin_fail', label: '未完成签到' };
    return { key: 'other', label: '其他原因' };
  };

  const reasonStats = useMemo(() => {
    const passedFail = retrainingList.filter((e) => !e.passed).length;
    const checkinFail = retrainingList.filter((e) => e.passed && !e.checkedIn).length;
    return [
      { name: '未通过测验', value: passedFail },
      { name: '未完成签到', value: checkinFail },
    ];
  }, [retrainingList]);

  const filteredList = useMemo(() => {
    let list = [...retrainingList];
    if (departmentId) list = list.filter((e) => e.departmentId === departmentId);
    if (floorId) list = list.filter((e) => e.floorId === floorId);
    if (positionId) list = list.filter((e) => e.positionId === positionId);
    if (reasonFilter !== 'all') {
      list = list.filter((e) => getRetrainReason(e).key === reasonFilter);
    }
    return list;
  }, [retrainingList, departmentId, floorId, positionId, reasonFilter]);

  const handleNotify = (userId: string) => {
    setNotifiedUsers((prev) => new Set([...prev, userId]));
  };

  const handleNotifyAll = () => {
    const allIds = filteredList.map((e) => e.id);
    setNotifiedUsers((prev) => new Set([...prev, ...allIds]));
  };

  const handleCompleteRetrain = (userId: string) => {
    if (confirm('确定标记该员工已完成复训吗？')) {
      setUserRetraining(userId, 'normal');
      setCompletedUsers((prev) => new Set([...prev, userId]));
    }
  };

  const handleExport = () => {
    const headers = ['工号', '姓名', '部门', '楼层', '岗位', '复训原因', '最近测验分数', '最近一次签到'];
    const rows = filteredList.map((e) => [
      e.employeeNo,
      e.name,
      e.departmentName,
      e.floorName,
      e.positionName,
      getRetrainReason(e).label,
      e.latestScore ?? '-',
      e.checkedIn ? '已完成' : '未完成',
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `复训名单_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRetraining = retrainingList.length;
  const prevMonthEstimate = Math.max(1, Math.round(totalRetraining * 1.15));
  const changeRate = ((totalRetraining - prevMonthEstimate) / prevMonthEstimate) * 100;
  const isPositive = changeRate >= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card animate-fade-in-up stagger-1 lg:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-fire-200/30 to-transparent rounded-full -mr-20 -mt-20 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-fire-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-fire-600" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-slate-500">待复训总人数</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold text-ocean-800 tabular-nums">{totalRetraining}</p>
                  <span className="text-sm text-slate-400">/ {summary.totalUsers} 人</span>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                  isPositive ? 'bg-fire-50 text-fire-600' : 'bg-emerald-50 text-success-600'
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                  ) : (
                    <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
                  )}
                  {Math.abs(changeRate).toFixed(1)}%
                </div>
                <p className="text-xs text-slate-400 mt-2">较上月环比</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-fire-50/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-fire-600" strokeWidth={2} />
                  <span className="text-xs text-slate-500">未通过测验</span>
                </div>
                <p className="text-xl font-bold text-fire-600 tabular-nums">{reasonStats[0]?.value || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-warn-50/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPinCheck className="w-3.5 h-3.5 text-warn-600" strokeWidth={2} />
                  <span className="text-xs text-slate-500">未完成签到</span>
                </div>
                <p className="text-xl font-bold text-warn-600 tabular-nums">{reasonStats[1]?.value || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-fade-in-up stagger-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-ocean-800">复训原因统计</h3>
              <p className="text-sm text-slate-400 mt-0.5">各类复训原因占比分布</p>
            </div>
            <div className="flex items-center gap-4">
              {reasonStats.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RETRAIN_REASON_COLORS[i] }}
                  />
                  <div className="text-sm">
                    <span className="font-bold text-ocean-800 tabular-nums">{r.value}</span>
                    <span className="text-slate-400 ml-1">人</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300" strokeWidth={2} />
                  <span className="text-xs font-medium text-slate-500">
                    {totalRetraining ? ((r.value / totalRetraining) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {RETRAIN_REASON_COLORS.map((c, i) => (
                    <filter key={i} id={`retrain-shadow-${i}`}>
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={reasonStats.filter((r) => r.value > 0)}
                  cx="30%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {reasonStats.filter((r) => r.value > 0).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RETRAIN_REASON_COLORS[index % RETRAIN_REASON_COLORS.length]}
                      filter={`url(#retrain-shadow-${index})`}
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
                    `${value} 人 (${totalRetraining ? ((value / totalRetraining) * 100).toFixed(1) : 0}%)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 13, lineHeight: '32px' }}
                  formatter={(value, entry) => (
                    <span className="text-slate-600">
                      {value}
                      <span className="text-slate-400 ml-2 text-xs">
                        ({((entry.payload.value / (totalRetraining || 1)) * 100).toFixed(0)}%)
                      </span>
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in-up stagger-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Filter className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium">筛选条件:</span>
            </div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="input w-auto py-2 min-w-[130px]"
            >
              <option value="">全部部门</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={floorId}
              onChange={(e) => setFloorId(e.target.value)}
              className="input w-auto py-2 min-w-[130px]"
            >
              <option value="">全部楼层</option>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.building}{f.name}
                </option>
              ))}
            </select>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="input w-auto py-2 min-w-[130px]"
            >
              <option value="">全部岗位</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value as ReasonFilter)}
              className="input w-auto py-2 min-w-[150px]"
            >
              <option value="all">全部原因</option>
              <option value="passed_fail">未通过测验</option>
              <option value="checkin_fail">未完成签到</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleNotifyAll} className="btn-ghost border-fire-200 text-fire-600 hover:bg-fire-50">
              <Bell className="w-4 h-4" strokeWidth={2} />
              批量通知全部
            </button>
            <button onClick={handleExport} className="btn-secondary">
              <Download className="w-4 h-4" strokeWidth={2} />
              导出名单
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 pb-4 mb-4 border-b border-slate-100 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" strokeWidth={2} />
            <span>
              当前筛选: <span className="font-bold text-ocean-700">{filteredList.length}</span> 条记录
            </span>
          </div>
          {filteredList.length > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span>
                已通知: <span className="font-bold text-ocean-700">
                  {filteredList.filter((e) => notifiedUsers.has(e.id)).length}
                </span> 人
              </span>
              <span className="text-slate-300">|</span>
              <span>
                已完成: <span className="font-bold text-success-600">
                  {filteredList.filter((e) => completedUsers.has(e.id)).length}
                </span> 人
              </span>
            </>
          )}
        </div>

        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">工号</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">部门</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">楼层</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">岗位</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">复训原因</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">最近测验分数</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">最近一次签到</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-success-500" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-ocean-700 mb-1">暂无待复训人员</p>
                      <p className="text-xs text-slate-400">所有员工均已完成考核流程</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((emp, idx) => {
                  const reason = getRetrainReason(emp);
                  const notified = notifiedUsers.has(emp.id);
                  const completed = completedUsers.has(emp.id);
                  const isHidden = completed;
                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        'border-b border-slate-50 transition-all animate-fade-in-up',
                        idx % 2 === 1 ? 'bg-slate-50/40' : '',
                        isHidden ? 'opacity-50' : 'hover:bg-ocean-50/30'
                      )}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-ocean-700">{emp.employeeNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0',
                            completed
                              ? 'bg-gradient-to-br from-success-400 to-success-600'
                              : 'bg-gradient-to-br from-fire-400 to-fire-600'
                          )}>
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-ocean-800 text-sm">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{emp.departmentName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{emp.floorName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{emp.positionName}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'badge',
                          reason.key === 'passed_fail' ? 'badge-danger' : 'badge-warn'
                        )}>
                          {reason.key === 'passed_fail' ? (
                            <GraduationCap className="w-3 h-3" strokeWidth={2.5} />
                          ) : (
                            <MapPinCheck className="w-3 h-3" strokeWidth={2.5} />
                          )}
                          {reason.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'badge',
                          emp.latestScore === undefined
                            ? 'bg-slate-100 text-slate-400'
                            : emp.latestScore >= 80
                            ? 'badge-success'
                            : emp.latestScore >= 60
                            ? 'badge-warn'
                            : 'badge-danger'
                        )}>
                          {emp.latestScore === undefined ? '-' : `${emp.latestScore}分`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'badge',
                          emp.checkedIn ? 'badge-success' : 'bg-slate-100 text-slate-400'
                        )}>
                          {emp.checkedIn ? <MapPinCheck className="w-3 h-3" strokeWidth={2.5} /> : null}
                          {emp.checkedIn ? '已完成' : '未完成'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleNotify(emp.id)}
                            disabled={notified || completed}
                            className={cn(
                              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                              notified
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : completed
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-fire-500 text-white hover:bg-fire-600 shadow-sm hover:shadow-md active:scale-95'
                            )}
                          >
                            <Bell className="w-3.5 h-3.5" strokeWidth={2} />
                            {notified ? '已通知' : '一键通知'}
                          </button>
                          <button
                            onClick={() => handleCompleteRetrain(emp.id)}
                            disabled={completed}
                            className={cn(
                              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                              completed
                                ? 'bg-emerald-100 text-success-600 cursor-default'
                                : 'bg-white border border-success-200 text-success-600 hover:bg-emerald-50 hover:border-success-300 active:scale-95'
                            )}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                            {completed ? '已完成' : '完成复训'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


