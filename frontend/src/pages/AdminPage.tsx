import { useEffect, useState, useCallback } from 'react'
import { UserPlus, Search, ShieldCheck, ShieldOff, Pencil, Users } from 'lucide-react'
import { usersApi } from '../services/api.service'
import { formatDate } from '../utils/helpers'
import { RoleBadge, Spinner, EmptyState, Pagination, Modal, Alert, PageHeader } from '../components/ui'
import type { User, PaginatedResult, Role } from '../types'

const ROLES: Role[] = ['VIEWER', 'ANALYST', 'ADMIN']
const emptyForm = { email: '', firstName: '', lastName: '', password: '', role: 'VIEWER' as Role }

export default function AdminPage() {
  const [result, setResult] = useState<PaginatedResult<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersApi.list({ search, role: roleFilter || undefined, page, limit: 10 })
      setResult(res.data.data)
    } catch { setResult(null) }
    finally { setLoading(false) }
  }, [search, roleFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => {
    usersApi.stats().then(r => setStats(r.data.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditUser(null)
    setForm(emptyForm)
    setFormError('')
    setShowCreate(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ email: u.email, firstName: u.firstName, lastName: u.lastName, password: '', role: u.role })
    setFormError('')
    setShowCreate(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError('')
    try {
      if (editUser) {
        const { password, ...rest } = form
        await usersApi.update(editUser.id, rest)
      } else {
        await usersApi.create(form)
      }
      setShowCreate(false)
      fetchUsers()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setFormError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (u: User) => {
    try {
      if (u.isActive) await usersApi.deactivate(u.id)
      else await usersApi.activate(u.id)
      fetchUsers()
    } catch { /* noop */ }
  }

  return (
    <div className="p-8 fade-in">
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and account status"
        action={
          <button onClick={openCreate} className="btn-primary">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {ROLES.map(role => (
          <div key={role} className="card px-5 py-4 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              role === 'ADMIN' ? 'bg-accent/10 border-accent/20 text-accent' :
              role === 'ANALYST' ? 'bg-warning/10 border-warning/20 text-warning' :
              'bg-surface-3 border-white/10 text-ink-faint'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-ink-faint uppercase tracking-wider">{role}</p>
              <p className="text-xl font-bold font-mono text-ink mt-0.5">{stats[role] ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input
              className="input pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input w-auto"
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value as Role | ''); setPage(1) }}
          >
            <option value="">All roles</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner className="w-8 h-8" /></div>
        ) : !result || result.data.length === 0 ? (
          <EmptyState icon={<Users className="w-5 h-5" />} title="No users found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['User', 'Email', 'Role', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-ink-faint uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.data.map(u => (
                    <tr key={u.id} className="hover:bg-surface-3/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-accent">{u.firstName[0]}{u.lastName[0]}</span>
                          </div>
                          <span className="font-medium text-ink">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted font-mono text-xs">{u.email}</td>
                      <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-positive' : 'text-ink-faint'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-positive' : 'bg-ink-faint'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ink-faint font-mono">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(u)} className="btn-ghost p-1.5" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleActive(u)}
                            className={`btn-ghost p-1.5 ${u.isActive ? 'hover:text-negative hover:bg-negative/10' : 'hover:text-positive hover:bg-positive/10'}`}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-white/5">
              <Pagination page={result.meta.page} totalPages={result.meta.totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={editUser ? 'Edit User' : 'Create User'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner className="w-4 h-4" /> : editUser ? 'Save Changes' : 'Create User'}
            </button>
          </>
        }
      >
        {formError && <Alert type="error" message={formError} />}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First name</label>
            <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Last name</label>
            <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editUser} />
        </div>
        {!editUser && (
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min 8 chars, uppercase, number, special"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
        )}
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  )
}
