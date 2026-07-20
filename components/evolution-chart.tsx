"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, LabelList } from "recharts";

export function EvolutionChart({ data }: { data: { label: string; points: number }[] }) {
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="craEvolutionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5C518" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#F5C518" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: "#6f6f78", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#17171a",
              border: "1px solid #2c2c32",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#9a9aa2" }}
            itemStyle={{ color: "#F5C518" }}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke="#F5C518"
            strokeWidth={2}
            fill="url(#craEvolutionFill)"
            dot={{ r: 3, fill: "#F5C518", stroke: "#0a0a0b", strokeWidth: 1 }}
            activeDot={{ r: 5, fill: "#F5C518", stroke: "#0a0a0b", strokeWidth: 2 }}
          >
            <LabelList
              dataKey="points"
              position="top"
              content={({ x, y, value }) =>
                Number(value) > 0 ? (
                  <text x={Number(x)} y={Number(y) - 6} fill="#f5f5f0" fontSize={10} textAnchor="middle">
                    {String(value)}
                  </text>
                ) : null
              }
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
