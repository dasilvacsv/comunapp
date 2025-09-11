// components/dashboard/request-priority-chart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const COLORS = {
  'Alta': '#EF4444',  // red-500
  'Media': '#F59E0B', // amber-500
  'Baja': '#3B82F6',  // blue-500
};

interface RequestPriorityChartProps {
  data: Array<{
    name: 'Alta' | 'Media' | 'Baja';
    value: number;
    fill?: string;
  }>;
}

export function RequestPriorityChart({ data }: RequestPriorityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No hay datos de prioridad para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full" style={{
        '--color-priority-high': COLORS.Alta,
        '--color-priority-medium': COLORS.Media,
        '--color-priority-low': COLORS.Baja,
      } as React.CSSProperties}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}/>
          <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
             {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}