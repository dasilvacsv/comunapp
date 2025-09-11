'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  'Pendiente': '#F59E0B',
  'Aprobada': '#10B981', 
  'Rechazada': '#EF4444',
  'Entregada': '#3B82F6',
};

interface RequestsStatusChartProps {
  data: Array<{
    name: string;
    value: number;
    fill?: string;
  }>;
  totalRequests: number;
}

export function RequestsStatusChart({ data, totalRequests }: RequestsStatusChartProps) {
  if (totalRequests === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p>No hay solicitudes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full" style={{
      '--color-pending': COLORS.Pendiente,
      '--color-approved': COLORS.Aprobada,
      '--color-rejected': COLORS.Rechazada,
      '--color-delivered': COLORS.Entregada,
    } as React.CSSProperties}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}