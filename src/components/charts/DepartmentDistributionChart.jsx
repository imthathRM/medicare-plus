import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const defaultData = [
  { name: 'Cardiology', value: 38, color: '#2563EB' },
  { name: 'Surgery', value: 24, color: '#0F766E' },
  { name: 'Pediatrics', value: 18, color: '#15803D' },
  { name: 'Orthopedics', value: 12, color: '#B45309' },
  { name: 'Neurology', value: 8, color: '#6366F1' },
];

export const DepartmentDistributionChart = ({ data = defaultData, height = 280 }) => {
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
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}% Patients`, 'Proportion']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              fontSize: '12px',
              color: '#334155',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-[#64748B] font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
