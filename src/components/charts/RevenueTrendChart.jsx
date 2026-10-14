import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatLKR } from '../../utils/formatters';

const defaultData = [
  { month: 'May', inpatient: 4800000, outpatient: 2100000 },
  { month: 'Jun', inpatient: 5200000, outpatient: 2400000 },
  { month: 'Jul', inpatient: 5600000, outpatient: 2650000 },
  { month: 'Aug', inpatient: 6100000, outpatient: 2800000 },
  { month: 'Sep', inpatient: 6450000, outpatient: 2950000 },
  { month: 'Oct', inpatient: 6900000, outpatient: 3150000 },
];

export const RevenueTrendChart = ({ data = defaultData, height = 280 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          barSize={16}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(val) => `LKR ${(val / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            formatter={(value, name) => [
              formatLKR(value),
              name === 'inpatient' ? 'Inpatient Revenue' : 'Outpatient & Pharmacy',
            ]}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="inpatient"
            name="Inpatient"
            fill="#0284c7"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="outpatient"
            name="Outpatient"
            fill="#0d9488"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
