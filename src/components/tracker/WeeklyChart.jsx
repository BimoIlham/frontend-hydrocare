import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { BarChart2 } from 'lucide-react'

// Light themed tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-sky-200/40 rounded-xl p-3 shadow-glass">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-sky-600 font-bold">{payload[0].value} mL</p>
    </div>
  )
}

export default function WeeklyChart({ data = [], targetMl = 2000 }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-sky-500" /> 7 Hari Terakhir
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.08)" />
          <XAxis dataKey="day_name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14, 165, 233, 0.06)' }} />
          <ReferenceLine y={targetMl} stroke="#0ea5e9" strokeDasharray="4 4" strokeOpacity={0.5}
            label={{ value: 'Target', fill: '#0ea5e9', fontSize: 11, opacity: 0.7 }} />
          <Bar dataKey="total_ml" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.goal_met ? '#0ea5e9' : 'rgba(14, 165, 233, 0.2)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-sky-500" /> Target tercapai
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-sky-500/20" /> Belum tercapai
        </div>
      </div>
    </div>
  )
}