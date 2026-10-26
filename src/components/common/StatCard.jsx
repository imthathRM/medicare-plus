import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_THEMES = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-[#2563EB]',
    border: 'border-blue-100',
    ring: 'ring-blue-500/20',
  },
  sky: {
    bg: 'bg-blue-50',
    text: 'text-[#2563EB]',
    border: 'border-blue-100',
    ring: 'ring-blue-500/20',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-[#0F766E]',
    border: 'border-teal-100',
    ring: 'ring-teal-500/20',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-[#15803D]',
    border: 'border-emerald-100',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-[#B45309]',
    border: 'border-amber-100',
    ring: 'ring-amber-500/20',
  },
  rose: {
    bg: 'bg-red-50',
    text: 'text-[#B91C1C]',
    border: 'border-red-100',
    ring: 'ring-red-500/20',
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  trendText,
  colorTheme = 'blue',
  subtext,
  onClick,
}) => {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs transition-colors hover:border-slate-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-[#1E3A5F] mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || trendText || subtext) && (
        <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
          {trend && (
            <div className="flex items-center gap-1 font-medium">
              {trendDirection === 'up' && (
                <span className="inline-flex items-center gap-0.5 text-[#15803D]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {trend}
                </span>
              )}
              {trendDirection === 'down' && (
                <span className="inline-flex items-center gap-0.5 text-[#B91C1C]">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {trend}
                </span>
              )}
              {trendDirection === 'neutral' && (
                <span className="inline-flex items-center gap-0.5 text-[#64748B]">
                  <Minus className="w-3.5 h-3.5" />
                  {trend}
                </span>
              )}
              {trendText && <span className="text-[#64748B] ml-1">{trendText}</span>}
            </div>
          )}
          {subtext && !trend && <span className="text-[#64748B] font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
