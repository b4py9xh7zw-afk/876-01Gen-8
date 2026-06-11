import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import ProgressRing from './ProgressRing';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon | ReactNode;
  color?: 'fire' | 'ocean' | 'warn' | 'success' | string;
  progress?: number;
  subtitle?: string;
  className?: string;
  delay?: number;
  rate?: number;
  trend?: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const colorMap = {
  fire: {
    border: 'before:bg-gradient-to-r before:from-fire-500 before:to-orange-500',
    iconBg: 'bg-fire-50 text-fire-600',
    ring: '#E63946',
  },
  ocean: {
    border: 'before:bg-gradient-to-r before:from-ocean-500 before:to-cyan-500',
    iconBg: 'bg-ocean-50 text-ocean-600',
    ring: '#1D3557',
  },
  warn: {
    border: 'before:bg-gradient-to-r before:from-warn-500 before:to-amber-500',
    iconBg: 'bg-amber-50 text-warn-600',
    ring: '#F4A261',
  },
  success: {
    border: 'before:bg-gradient-to-r before:from-success-500 before:to-emerald-500',
    iconBg: 'bg-emerald-50 text-success-600',
    ring: '#2A9D8F',
  },
};

const COLOR_MAP_LEGACY: Record<string, { bar: string; iconBg: string; iconText: string; up: string; down: string }> = {
  fire: {
    bar: 'bg-fire-500',
    iconBg: 'bg-fire-50',
    iconText: 'text-fire-600',
    up: 'text-fire-600',
    down: 'text-success-500',
  },
  ocean: {
    bar: 'bg-ocean-500',
    iconBg: 'bg-ocean-50',
    iconText: 'text-ocean-600',
    up: 'text-ocean-600',
    down: 'text-fire-500',
  },
  success: {
    bar: 'bg-success-500',
    iconBg: 'bg-success-50',
    iconText: 'text-success-600',
    up: 'text-success-600',
    down: 'text-fire-500',
  },
  warn: {
    bar: 'bg-warn-500',
    iconBg: 'bg-warn-50',
    iconText: 'text-warn-600',
    up: 'text-warn-600',
    down: 'text-success-500',
  },
};

export default function StatCard({
  title,
  value,
  icon,
  color = 'fire',
  progress,
  subtitle,
  className,
  delay = 0,
  rate,
  trend,
  suffix,
  prefix,
  duration = 1500,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const isStringValue = typeof value === 'string';
  const numericValue = isStringValue ? 0 : (value as number);
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.fire;
  const colorConfig = COLOR_MAP_LEGACY[color];
  const isCustomColor = !COLOR_MAP_LEGACY[color];

  useEffect(() => {
    if (isStringValue) return;
    setDisplayValue(0);
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const prog = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setDisplayValue(Math.round(numericValue * eased));

      if (prog < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [numericValue, duration, isStringValue]);

  const isPositive = (rate ?? 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const formatNumber = (num: number) => num.toLocaleString('zh-CN');
  const getDefaultTrend = () => {
    if (rate === undefined) return '';
    const absRate = Math.abs(rate).toFixed(1);
    return isPositive ? `较上期增长 ${absRate}%` : `较上期下降 ${absRate}%`;
  };
  const trendText = trend ?? getDefaultTrend();

  const renderIcon = () => {
    if (!icon) return null;
    const IconComponent = icon as LucideIcon;
    if (typeof IconComponent === 'function') {
      return <IconComponent className="w-6 h-6" />;
    }
    return icon as ReactNode;
  };

  if (progress !== undefined || isStringValue) {
    return (
      <div
        className={cn('stat-card', colors.border, className)}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-ocean-800">{value}</p>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          {progress !== undefined ? (
            <ProgressRing percent={progress} size={64} strokeWidth={6} color={colors.ring} />
          ) : (
            icon && (
              <div className={cn('p-3 rounded-xl', colors.iconBg)}>
                {renderIcon()}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn('absolute top-0 left-0 right-0 h-1', colorConfig?.bar)}
        style={isCustomColor ? { backgroundColor: color as string } : undefined}
      />

      <div className="p-6 pt-7">
        <div className="flex items-start justify-between mb-5">
          {icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
                colorConfig?.iconBg
              )}
              style={
                isCustomColor
                  ? { backgroundColor: `${color}10` }
                  : undefined
              }
            >
              <div
                className={cn(colorConfig?.iconText)}
                style={isCustomColor ? { color: color as string } : undefined}
              >
                {renderIcon()}
              </div>
            </div>
          )}

          {rate !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-xs font-medium">
              <TrendIcon
                className={cn('w-3.5 h-3.5', isPositive ? colorConfig?.up : colorConfig?.down)}
                strokeWidth={2.5}
              />
              <span className={cn(isPositive ? colorConfig?.up : colorConfig?.down)}>
                {Math.abs(rate).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 font-medium mb-1.5">{title}</p>

        <div className="flex items-baseline gap-0.5">
          {prefix && <span className="text-lg font-semibold text-slate-400">{prefix}</span>}
          <span
            className={cn(
              'text-3xl font-bold tracking-tight tabular-nums transition-colors duration-300',
              colorConfig?.iconText
            )}
            style={isCustomColor ? { color: color as string } : undefined}
          >
            {formatNumber(displayValue)}
          </span>
          {suffix && <span className="text-base font-semibold text-slate-400 ml-0.5">{suffix}</span>}
        </div>

        {trendText && (
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">{trendText}</p>
        )}
      </div>
    </div>
  );
}
