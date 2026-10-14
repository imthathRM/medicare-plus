import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_THEMES = {
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-100',
    ring: 'ring-sky-500/20',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'border-teal-100',
    ring: 'ring-teal-500/20',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    ring: 'ring-amber-500/20',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    ring: 'ring-rose-500/20',
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  trendText,
  colorTheme = 'sky',
  subtext,
  onClick,
}) => {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.sky;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 border ${theme.border}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || trendText || subtext) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <div className="flex items-center gap-1 font-medium">
              {trendDirection === 'up' && (
                <span className="inline-flex items-center gap-0.5 text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {trend}
                </span>
              )}
              {trendDirection === 'down' && (
                <span className="inline-flex items-center gap-0.5 text-rose-600">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {trend}
                </span>
              )}
              {trendDirection === 'neutral' && (
                <span className="inline-flex items-center gap-0.5 text-slate-500">
                  <Minus className="w-3.5 h-3.5" />
                  {trend}
                </span>
              )}
              {trendText && <span className="text-slate-400 ml-1">{trendText}</span>}
            </div>
          )}
          {subtext && !trend && <span className="text-slate-500 font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
