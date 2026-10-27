import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useHospitalData } from '../../context/HospitalDataContext';

const defaultData = [
  { name: 'Cardiology', value: 38, color: '#2563EB', darkColor: '#60A5FA' },
  { name: 'Surgery', value: 24, color: '#0F766E', darkColor: '#2DD4BF' },
  { name: 'Pediatrics', value: 18, color: '#15803D', darkColor: '#4ADE80' },
  { name: 'Orthopedics', value: 12, color: '#B45309', darkColor: '#FBBF24' },
  { name: 'Neurology', value: 8, color: '#6366F1', darkColor: '#818CF8' },
];

export const DepartmentDistributionChart = ({ data = defaultData, height = 280 }) => {
  const { appSettings } = useHospitalData();
  const isDark = appSettings?.themeMode === 'dark';

  return (
    <div className="w-full flex items-center justify-center" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={isDark && entry.darkColor ? entry.darkColor : entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}% Patients`, 'Proportion']}
            contentStyle={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '8px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '12px',
              color: isDark ? '#F1F5F9' : '#334155',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-[#64748B] dark:text-[#CBD5E1] font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
