import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 环形进度图组件 Props
 */
interface ProgressRingProps {
  /** 进度百分比 0-100 */
  percent: number;
  /** 进度条颜色，默认消防红 */
  color?: string;
  /** 环形容器尺寸（正方形边长），默认 80 */
  size?: number;
  /** 轨道宽度，默认 8 */
  strokeWidth?: number;
  /** 轨道底色，默认浅灰 */
  trackColor?: string;
  /** 是否显示中心文字，默认 true */
  showLabel?: boolean;
  /** 中心文字样式覆盖 */
  labelClassName?: string;
  /** 动画持续时间（毫秒），默认 1000 */
  duration?: number;
}

/**
 * 环形进度图组件（SVG 实现）
 * 特点：带平滑动画效果、支持自定义尺寸和颜色
 */
export default function ProgressRing({
  percent,
  color = '#E63946',
  size = 80,
  strokeWidth = 8,
  trackColor = '#E2E8F0',
  showLabel = true,
  labelClassName,
  duration = 1000,
}: ProgressRingProps) {
  // 动画状态：从 0 过渡到目标 percent
  const [displayPercent, setDisplayPercent] = useState(0);

  // 限制 percent 范围
  const clampedPercent = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    // 重置动画起点
    setDisplayPercent(0);
    // 使用 requestAnimationFrame 触发过渡动画
    const timer = setTimeout(() => {
      setDisplayPercent(clampedPercent);
    }, 50);
    return () => clearTimeout(timer);
  }, [clampedPercent]);

  // SVG 几何参数
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (displayPercent / 100) * circumference;
  const center = size / 2;

  // 根据百分比决定文字颜色
  const getLabelColor = () => {
    if (clampedPercent >= 80) return 'text-fire-600';
    if (clampedPercent >= 50) return 'text-warn-500';
    return 'text-ocean-600';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG 环形图 */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        {/* 背景轨道 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* 进度弧 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            filter:
              color === '#E63946' || color.includes('fire')
                ? 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.4))'
                : 'none',
          }}
        />
      </svg>

      {/* 中心百分比文字 */}
      {showLabel && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold',
            getLabelColor(),
            labelClassName
          )}
          style={{ fontSize: size * 0.28 }}
        >
          <span style={{ transition: `color ${duration}ms ease` }}>
            {Math.round(displayPercent)}%
          </span>
        </div>
      )}
    </div>
  );
}
