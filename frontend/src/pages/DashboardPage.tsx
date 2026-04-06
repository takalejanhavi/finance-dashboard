import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { analyticsApi } from '../services/api.service'
import { formatCurrency, formatDate } from '../utils/helpers'
import { StatCard, TypeBadge, Spinner, EmptyState, PageHeader } from '../components/ui'
import type { Summary, FinancialRecord } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recent, setRecent] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, recentRes] = await Promise.allSettled([
          analyticsApi.summary(),
          ...(user?.role !== 'VIEWER' ? [analyticsApi.recent()] : []),
        ])
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.data)
        if (recentRes && recentRes.status === 'fulfilled') setRecent((recentRes as any).value.data.data ?? [])
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 fade-in">
      <PageHeader
        title={`${greeting}, ${user?.firstName} 👋`}
        subtitle={`Here's your financial overview — ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-8 h-8" />
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-negative">{error}</div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Total Income"
                value={formatCurrency(summary.totalIncome)}
                icon={<TrendingUp className="w-5 h-5" />}
                accent="positive"
              />
              <StatCard
                label="Total Expenses"
                value={formatCurrency(summary.totalExpenses)}
                icon={<TrendingDown className="w-5 h-5" />}
                accent="negative"
              />
              <StatCard
                label="Net Balance"
                value={formatCurrency(summary.netBalance)}
                icon={<DollarSign className="w-5 h-5" />}
                accent={summary.netBalance >= 0 ? 'positive' : 'negative'}
              />
            </div>
          )}

          {/* Savings rate */}
          {summary && summary.totalIncome > 0 && (
            <div className="card p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-ink-faint uppercase tracking-wider">Savings Rate</p>
                  <p className="text-lg font-bold font-mono text-ink mt-0.5">
                    {Math.max(0, ((summary.netBalance / summary.totalIncome) * 100)).toFixed(1)}%
                  </p>
                </div>
                <Activity className="w-5 h-5 text-ink-faint" />
              </div>
              <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-positive rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (summary.netBalance / summary.totalIncome) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {user?.role !== 'VIEWER' && (
            <div className="card">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-ink">Recent Transactions</h2>
                <span className="text-xs text-ink-faint">Last 10</span>
              </div>

              {recent.length === 0 ? (
                <EmptyState icon={<Activity className="w-5 h-5" />} title="No transactions yet" description="Create your first financial record to get started" />
              ) : (
                <div className="divide-y divide-white/5">
                  {recent.map((rec) => (
                    <div key={rec.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-surface-3/50 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rec.type === 'INCOME' ? 'bg-positive/10 border border-positive/20' : 'bg-negative/10 border border-negative/20'
                      }`}>
                        {rec.type === 'INCOME'
                          ? <ArrowUpRight className="w-4 h-4 text-positive" />
                          : <ArrowDownRight className="w-4 h-4 text-negative" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{rec.category}</p>
                        <p className="text-xs text-ink-faint truncate">
                          {rec.notes || '—'} · {formatDate(rec.date)}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold font-mono ${rec.type === 'INCOME' ? 'text-positive' : 'text-negative'}`}>
                          {rec.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(rec.amount))}
                        </p>
                        {rec.user && (
                          <p className="text-xs text-ink-faint">{rec.user.firstName} {rec.user.lastName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {user?.role === 'VIEWER' && (
            <div className="card p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm font-medium text-ink-muted">Summary view only</p>
              <p className="text-xs text-ink-faint mt-1">Your VIEWER role grants access to summary metrics only.<br/>Contact an admin to upgrade your permissions.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
