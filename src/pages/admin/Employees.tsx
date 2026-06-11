import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Filter,
  Users,
  BookOpen,
  GraduationCap,
  MapPinCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAppStore, departments, floors, positions } from '@/store';
import type { EmployeeDetail } from '@/types';
import { cn } from '@/lib/utils';

type StatusTab = 'all' | 'learned' | 'passed' | 'checkedin' | 'retraining';

const STATUS_TABS: { key: StatusTab; label: string; icon: typeof Users }[] = [
  { key: 'all', label: '全部', icon: Users },
  { key: 'learned', label: '已学习', icon: BookOpen },
  { key: 'passed', label: '已通过', icon: GraduationCap },
  { key: 'checkedin', label: '已签到', icon: MapPinCheck },
  { key: 'retraining', label: '待复训', icon: AlertTriangle },
];

const PAGE_SIZE = 10;

export default function Employees() {
  const getEmployeeDetails = useAppStore((s) => s.getEmployeeDetails);
  const setUserRetraining = useAppStore((s) => s.setUserRetraining);

  const [keyword, setKeyword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);
  const [detailEmployee, setDetailEmployee] = useState<EmployeeDetail | null>(null);

  const employees = useMemo(
    () =>
      getEmployeeDetails({
        keyword: keyword || undefined,
        departmentId: departmentId || undefined,
        floorId: floorId || undefined,
        positionId: positionId || undefined,
        status: statusTab,
      }),
    [getEmployeeDetails, keyword, departmentId, floorId, positionId, statusTab]
  );

  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageData = employees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = employees.length;
    const learned = employees.filter((e) => e.learned).length;
    const passed = employees.filter((e) => e.passed).length;
    const checkedIn = employees.filter((e) => e.checkedIn).length;
    const retraining = employees.filter((e) => e.status === 'retraining').length;
    return {
      total,
      learned,
      passed,
      checkedIn,
      retraining,
      learnRate: total ? Math.round((learned / total) * 100) : 0,
      passRate: total ? Math.round((passed / total) * 100) : 0,
      checkinRate: total ? Math.round((checkedIn / total) * 100) : 0,
      retrainRate: total ? Math.round((retraining / total) * 100) : 0,
    };
  }, [employees]);

  const handleResetStatus = (emp: EmployeeDetail) => {
    if (confirm(`确定要重置 ${emp.name} 的状态吗？`)) {
      setUserRetraining(emp.id, 'normal');
    }
  };

  const handleExport = () => {
    alert('导出成功');
  };

  const getOverallBadge = (e: EmployeeDetail) => {
    if (e.status === 'retraining') {
      return { text: '待复训', className: 'badge-danger' };
    }
    if (e.learned && e.passed && e.checkedIn) {
      return { text: '已完成', className: 'badge-success' };
    }
    if (e.learned && e.passed) {
      return { text: '待签到', className: 'badge-info' };
    }
    if (e.learned) {
      return { text: '考试中', className: 'badge-warn' };
    }
    return { text: '学习中', className: 'badge-info' };
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return { text: '-', className: 'badge bg-slate-100 text-slate-400' };
    if (score >= 80) return { text: `${score}分`, className: 'badge-success' };
    if (score >= 60) return { text: `${score}分`, className: 'badge-warn' };
    return { text: `${score}分`, className: 'badge-danger' };
  };

  return (
    <div className="space-y-6">
      <div className="card animate-fade-in-up stagger-1">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="搜索姓名或工号..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="input pl-10 pr-10"
            />
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Filter className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium">筛选:</span>
            </div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setFloorId(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setPositionId(e.target.value);
                setPage(1);
              }}
              className="input w-auto py-2 min-w-[130px]"
            >
              <option value="">全部岗位</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="btn-ghost ml-auto"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              导出
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.key === 'all'
                ? stats.total
                : tab.key === 'learned'
                ? stats.learned
                : tab.key === 'passed'
                ? stats.passed
                : tab.key === 'checkedin'
                ? stats.checkedIn
                : stats.retraining;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusTab(tab.key);
                  setPage(1);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  statusTab === tab.key
                    ? tab.key === 'retraining'
                      ? 'bg-fire-500 text-white shadow-fire'
                      : 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-ocean-700'
                )}
              >
                <tab.icon className="w-4 h-4" strokeWidth={2} />
                {tab.label}
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold min-w-[24px] text-center',
                    statusTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-slate-500'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up stagger-2">
        <div className="card !p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-ocean-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-ocean-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-bold text-ocean-800 tabular-nums">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-0.5">筛选后总人数</p>
          </div>
        </div>
        <div className="card !p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-fire-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-fire-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-bold text-ocean-800 tabular-nums">
              {stats.learned}
              <span className="text-sm font-normal text-slate-400 ml-1">/ {stats.learnRate}%</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">学习完成率</p>
          </div>
        </div>
        <div className="card !p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-success-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-bold text-ocean-800 tabular-nums">
              {stats.passed}
              <span className="text-sm font-normal text-slate-400 ml-1">/ {stats.passRate}%</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">测验通过率</p>
          </div>
        </div>
        <div className="card !p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-warn-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-bold text-ocean-800 tabular-nums">
              {stats.retraining}
              <span className="text-sm font-normal text-slate-400 ml-1">/ {stats.retrainRate}%</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">待复训占比</p>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in-up stagger-3 !p-0 overflow-hidden">
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">测验状态</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">签到状态</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">整体状态</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
                    <p className="text-sm">暂无匹配的员工数据</p>
                  </td>
                </tr>
              ) : (
                pageData.map((emp, idx) => {
                  const overall = getOverallBadge(emp);
                  const scoreBadge = getScoreBadge(emp.latestScore);
                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        'border-b border-slate-50 hover:bg-ocean-50/30 transition-colors animate-fade-in-up',
                        idx % 2 === 1 ? 'bg-slate-50/40' : ''
                      )}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-ocean-700">{emp.employeeNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetailEmployee(emp)}
                            className="p-2 rounded-lg text-ocean-600 hover:bg-ocean-50 transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2} />
                          </button>
                          {emp.status === 'retraining' && (
                            <button
                              onClick={() => handleResetStatus(emp)}
                              className="p-2 rounded-lg text-warn-600 hover:bg-amber-50 transition-colors"
                              title="重置状态"
                            >
                              <RotateCcw className="w-4 h-4" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {employees.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              共 <span className="font-semibold text-ocean-700">{employees.length}</span> 条记录，
              第 <span className="font-semibold text-ocean-700">{currentPage}</span> / {totalPages} 页
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-white hover:border-ocean-200 hover:text-ocean-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                    currentPage === p
                      ? 'bg-gradient-to-r from-fire-500 to-fire-600 text-white shadow-fire'
                      : 'border border-slate-200 text-slate-500 hover:bg-white hover:border-ocean-200 hover:text-ocean-600'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-white hover:border-ocean-200 hover:text-ocean-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>

      {detailEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setDetailEmployee(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-ocean-600 to-ocean-700 px-6 py-8 text-white">
              <button
                onClick={() => setDetailEmployee(null)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold shadow-lg">
                  {detailEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{detailEmployee.name}</h3>
                  <p className="text-ocean-200 text-sm mt-0.5 font-mono">{detailEmployee.employeeNo}</p>
                  <p className="text-ocean-200 text-sm mt-1">
                    {detailEmployee.departmentName} · {detailEmployee.positionName}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 mb-1">楼层</p>
                  <p className="font-semibold text-ocean-800">{detailEmployee.floorName}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 mb-1">岗位</p>
                  <p className="font-semibold text-ocean-800">{detailEmployee.positionName}</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: '课程学习', value: detailEmployee.learned, text: detailEmployee.learned ? '已完成全部课程' : '未完成全部课程' },
                  { label: '知识测验', value: detailEmployee.passed, text: detailEmployee.latestScore !== undefined ? `最近成绩: ${detailEmployee.latestScore}分` : '未参加测验' },
                  { label: '现场签到', value: detailEmployee.checkedIn, text: detailEmployee.checkedIn ? '已完成签到' : '未签到' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    <span className={cn(
                      'badge',
                      item.value ? 'badge-success' : 'badge-danger'
                    )}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-ocean-50 to-fire-50/50 border border-ocean-100 mt-4">
                <span className="text-sm font-medium text-ocean-700">整体状态评估</span>
                <span className={cn('badge', getOverallBadge(detailEmployee).className)}>
                  {getOverallBadge(detailEmployee).text}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
