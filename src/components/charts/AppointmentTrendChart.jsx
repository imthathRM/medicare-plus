import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useHospitalData } from '../../context/HospitalDataContext';

const defaultData = [
  { month: 'May', completed: 620, scheduled: 680 },
  { month: 'Jun', completed: 710, scheduled: 750 },
  { month: 'Jul', completed: 780, scheduled: 810 },
  { month: 'Aug', completed: 840, scheduled: 890 },
  { month: 'Sep', completed: 890, scheduled: 930 },
  { month: 'Oct', completed: 940, scheduled: 990 },
];

export const AppointmentTrendChart = ({ data = defaultData, height = 280 }) => {
  const { appSettings } = useHospitalData();
  const isDark = appSettings?.themeMode === 'dark';

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? '#60A5FA' : '#2563EB'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isDark ? '#60A5FA' : '#2563EB'} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? '#2DD4BF' : '#0F766E'} stopOpacity={0.25} />
              <stop offset="95%" stopColor={isDark ? '#2DD4BF' : '#0F766E'} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#CBD5E1' : '#64748B', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '8px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '12px',
              color: isDark ? '#F1F5F9' : '#334155',
            }}
          />
          <Area
            type="monotone"
            dataKey="scheduled"
            name="Scheduled"
            stroke={isDark ? '#2DD4BF' : '#0F766E'}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScheduled)"
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke={isDark ? '#60A5FA' : '#2563EB'}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
