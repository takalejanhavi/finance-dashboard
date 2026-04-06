import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { analyticsApi } from '../services/api.service'
import { formatCurrency, formatMonthLabel, getCategoryColor } from '../utils/helpers'
import { Spinner, PageHeader } from '../components/ui'
import type { CategoryData, TrendData } from '../types'

const CHART_COLORS = ['#7c6af7', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#f472b6', '#4ade80']

const tooltipStyle = {
  contentStyle: {
    background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', fontSize: '12px', color: '#f4f4f6',
  },
  cursor: { fill: 'rgba(124,106,247,0.06)' },
}

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(12)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [tRes, cRes] = await Promise.all([
          analyticsApi.trends(months),
          analyticsApi.categories(),
        ])
        setTrends(tRes.data.data ?? [])
        setCategories(cRes.data.data ?? [])
      } catch { /* errors handled gracefully */ }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [months])

  const trendData = trends.map(t => ({
    ...t,
    month: formatMonthLabel(t.month),
    income: Number(t.income.toFixed(2)),
    expense: Number(t.expense.toFixed(2)),
    net: Number(t.net.toFixed(2)),
  }))

  const pieData = categories.slice(0, 8).map(c => ({
    name: c.category,
    value: Number((c.income + c.expense).toFixed(2)),
    color: getCategoryColor(c.category),
  }))

  const categoryBarData = categories.slice(0, 10).map(c => ({
    name: c.category,
    Income: Number(c.income.toFixed(2)),
    Expense: Number(c.expense.toFixed(2)),
  }))

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="p-8 fade-in space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Visual breakdown of your financial data"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-faint">Range:</span>
            {[3, 6, 12].map(m => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  months === m ? 'bg-accent/15 text-accent border border-accent/30' : 'text-ink-muted hover:bg-surface-3'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        }
      />

      {/* Area chart - Trends */}
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink mb-5">Income vs Expenses Over Time</h2>
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-ink-faint text-sm">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#34d399" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#60607a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#60607a' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a0a0b0' }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#34d399" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - Category breakdown */}
        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-ink mb-5">Category Breakdown</h2>
          {categoryBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-ink-faint text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryBarData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#60607a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#60607a' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a0a0b0' }} />
                <Bar dataKey="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart - Volume by category */}
        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-ink mb-5">Volume by Category</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-ink-faint text-sm">No data</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={3} strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-2 min-w-0">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-ink-muted truncate flex-1">{entry.name}</span>
                    <span className="font-mono text-ink font-medium flex-shrink-0">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Net balance trend */}
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink mb-5">Monthly Net Balance</h2>
        {trendData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-ink-faint text-sm">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#60607a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#60607a' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="net" name="Net Balance" radius={[4, 4, 0, 0]}>
                {trendData.map((entry, i) => (
                  <Cell key={i} fill={entry.net >= 0 ? '#34d399' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
