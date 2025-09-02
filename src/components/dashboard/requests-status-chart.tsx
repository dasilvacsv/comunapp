'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

// Configuración de colores y etiquetas para el gráfico.
// Usamos variables CSS para que se adapte al tema (claro/oscuro).
const chartConfig = {
  requests: {
    label: 'Solicitudes',
  },
  Pendiente: {
    label: 'Pendiente',
    color: 'hsl(var(--chart-1))',
  },
  Aprobada: {
    label: 'Aprobada',
    color: 'hsl(var(--chart-2))',
  },
  Rechazada: {
    label: 'Rechazada',
    color: 'hsl(var(--chart-3))',
  },
  Entregada: {
    label: 'Entregada',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function RequestsStatusChart({ data, totalRequests }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">No hay datos de solicitudes para mostrar.</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          strokeWidth={5}
        >
          {/* Label custom en el centro del gráfico */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
          >
            <tspan x="50%" dy="-0.6em" className="text-3xl font-bold">
              {totalRequests}
            </tspan>
            <tspan x="50%" dy="1.2em" className="text-xs text-muted-foreground">
              Total
            </tspan>
          </text>
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}