import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Trash2, Pencil, FileText, Filter } from 'lucide-react'
import { recordsApi } from '../services/api.service'
import { formatCurrency, formatDate, CATEGORIES } from '../utils/helpers'
import {
  TypeBadge, Spinner, EmptyState, Pagination,
  Modal, Alert, PageHeader,
} from '../components/ui'
import type { FinancialRecord, PaginatedResult, RecordFilters, RecordType } from '../types'
import { useAuth } from '../contexts/AuthContext'

const emptyForm = { amount: '', type: 'INCOME' as RecordType, category: 'Salary', date: '', notes: '' }

export default function RecordsPage() {
  const { user } = useAuth()
  const [result, setResult] = useState<PaginatedResult<FinancialRecord> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RecordFilters>({ page: 1, limit: 10 })
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await recordsApi.list(filters)
      setResult(res.data.data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const openCreate = () => {
    setEditRecord(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (rec: FinancialRecord) => {
    setEditRecord(rec)
    setForm({
      amount: String(rec.amount),
      type: rec.type,
      category: rec.category,
      date: rec.date.slice(0, 10),
      notes: rec.notes ?? '',
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editRecord) {
        await recordsApi.update(editRecord.id, payload)
      } else {
        await recordsApi.create(payload)
      }
      setShowModal(false)
      fetchRecords()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setFormError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Failed to save record'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await recordsApi.delete(id)
      setDeleteId(null)
      fetchRecords()
    } catch { /* silently fail */ }
  }

  const setFilter = (key: keyof RecordFilters, val: any) => {
    setFilters(f => ({ ...f, [key]: val, page: 1 }))
  }

  return (
    <div className="p-8 fade-in">
      <PageHeader
        title="Financial Records"
        subtitle={result ? `${result.meta.total} records found` : ''}
        action={
          user?.role !== 'VIEWER' ? (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Record
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input
              className="input pl-9"
              placeholder="Search notes or category…"
              value={filters.search ?? ''}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>

          <select
            className="input w-auto"
            value={filters.type ?? ''}
            onChange={e => setFilter('type', e.target.value as RecordType | '')}
          >
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <select
            className="input w-auto"
            value={filters.category ?? ''}
            onChange={e => setFilter('category', e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <input
            type="date" className="input w-auto"
            value={filters.dateFrom ?? ''}
            onChange={e => setFilter('dateFrom', e.target.value)}
            title="From date"
          />
          <input
            type="date" className="input w-auto"
            value={filters.dateTo ?? ''}
            onChange={e => setFilter('dateTo', e.target.value)}
            title="To date"
          />

          <button
            className="btn-ghost text-xs"
            onClick={() => setFilters({ page: 1, limit: 10 })}
          >
            <Filter className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner className="w-8 h-8" /></div>
        ) : !result || result.data.length === 0 ? (
          <EmptyState icon={<FileText className="w-5 h-5" />} title="No records found" description="Try adjusting your filters or create a new record" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Date', 'Type', 'Category', 'Amount', 'Notes', user?.role === 'ADMIN' ? 'User' : null, ''].filter(Boolean).map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-ink-faint uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.data.map(rec => (
                    <tr key={rec.id} className="hover:bg-surface-3/40 transition-colors">
                      <td className="px-5 py-3.5 text-ink-muted font-mono text-xs">{formatDate(rec.date)}</td>
                      <td className="px-5 py-3.5"><TypeBadge type={rec.type} /></td>
                      <td className="px-5 py-3.5 text-ink">{rec.category}</td>
                      <td className={`px-5 py-3.5 font-bold font-mono ${rec.type === 'INCOME' ? 'text-positive' : 'text-negative'}`}>
                        {rec.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(rec.amount))}
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted max-w-xs truncate">{rec.notes || '—'}</td>
                      {user?.role === 'ADMIN' && (
                        <td className="px-5 py-3.5 text-xs text-ink-faint">
                          {rec.user ? `${rec.user.firstName} ${rec.user.lastName}` : '—'}
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {(user?.role === 'ADMIN' || rec.userId === user?.id) && (
                            <>
                              <button onClick={() => openEdit(rec)} className="btn-ghost p-1.5">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleteId(rec.id)} className="btn-ghost p-1.5 hover:text-negative hover:bg-negative/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-white/5">
              <Pagination
                page={result.meta.page}
                totalPages={result.meta.totalPages}
                onPageChange={p => setFilters(f => ({ ...f, page: p }))}
              />
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editRecord ? 'Edit Record' : 'New Record'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner className="w-4 h-4" /> : editRecord ? 'Save Changes' : 'Create Record'}
            </button>
          </>
        }
      >
        {formError && <Alert type="error" message={formError} />}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as RecordType }))}>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div>
            <label className="label">Amount</label>
            <input type="number" step="0.01" min="0.01" className="input" placeholder="0.00"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <input className="input" placeholder="Brief description…" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Record"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => deleteId && handleDelete(deleteId)}>Delete</button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">Are you sure you want to delete this record? This action is irreversible.</p>
      </Modal>
    </div>
  )
}
