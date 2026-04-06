import React from 'react'
import { cn } from '../utils/helpers'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin', className)} />
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  accent?: 'default' | 'positive' | 'negative'
}

export function StatCard({ label, value, icon, trend, accent = 'default' }: StatCardProps) {
  const accentColor = {
    default:  'text-accent bg-accent/10 border-accent/20',
    positive: 'text-positive bg-positive/10 border-positive/20',
    negative: 'text-negative bg-negative/10 border-negative/20',
  }[accent]

  return (
    <div className="stat-card fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-faint uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink font-mono tracking-tight">{value}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', accentColor)}>
          {icon}
        </div>
      </div>
      {trend && (
        <p className={cn('text-xs font-medium', trend.positive ? 'text-positive' : 'text-negative')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      role === 'ADMIN' ? 'badge-admin' :
      role === 'ANALYST' ? 'badge-analyst' : 'badge-viewer'
    )}>
      {role}
    </span>
  )
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={type === 'INCOME' ? 'badge-income' : 'badge-expense'}>
      {type}
    </span>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-white/5 flex items-center justify-center text-ink-faint mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      {description && <p className="text-xs text-ink-faint mt-1 max-w-xs">{description}</p>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card p-6 fade-in">
        <h2 className="font-display text-lg font-bold text-ink mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30"
      >← Prev</button>
      <span className="text-xs text-ink-muted font-mono">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30"
      >Next →</button>
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  return (
    <div className={cn(
      'px-4 py-3 rounded-xl text-sm border',
      type === 'error'
        ? 'bg-negative/10 text-negative border-negative/20'
        : 'bg-positive/10 text-positive border-positive/20'
    )}>
      {message}
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({
  title, subtitle, action,
}: {
  title: string; subtitle?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
