'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface DomainChartProps {
  type: 'line' | 'bar' | 'area' | 'pie';
  data: Record<string, unknown>[];
  title?: string;
  color?: string;
  secondaryColor?: string;
  dataKey?: string;
  secondaryDataKey?: string;
  nameKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <div className="label">{label}</div>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="value" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </div>
      ))}
    </div>
  );
}

export default function DomainChart({
  type,
  data,
  title,
  color = '#06b6d4',
  secondaryColor = '#3b82f6',
  dataKey = 'value',
  secondaryDataKey,
  nameKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  colors,
}: DomainChartProps) {
  const axisStyle = {
    fontSize: 11,
    fill: '#64748b',
    fontFamily: 'Inter, sans-serif',
  };

  const gridStyle = {
    stroke: 'hsla(220, 20%, 24%, 0.3)',
    strokeDasharray: '3 3',
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
            {secondaryDataKey && (
              <Line
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={secondaryColor}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={nameKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(220, 20%, 24%, 0.2)' }} />
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry: any, index: number) => (
                <Cell
                  key={index}
                  fill={entry.color || (colors ? colors[index % colors.length] : color)}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${color.replace('#', '')})`}
              activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.22}
              outerRadius={height * 0.37}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
              strokeWidth={0}
            >
              {data.map((entry: any, index: number) => (
                <Cell
                  key={index}
                  fill={entry.color || (colors ? colors[index % colors.length] : color)}
                />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() as any}
      </ResponsiveContainer>
    </div>
  );
}
