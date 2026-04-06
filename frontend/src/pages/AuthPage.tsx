import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Alert, Spinner } from '../components/ui'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form)
      }
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent shadow-glow flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">FinBoard</h1>
          <p className="text-sm text-ink-muted mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-surface-3 p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-150 ${
                  mode === m ? 'bg-surface-4 text-ink shadow-card' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First name</label>
                  <input name="firstName" className="input" placeholder="Jane" value={form.firstName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input name="lastName" className="input" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                name="email" type="email" className="input"
                placeholder="you@example.com" value={form.email}
                onChange={handleChange} required autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={handleChange} required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-ink-faint mt-1.5">Min 8 chars, uppercase, number & special char</p>
              )}
            </div>

            {error && <Alert type="error" message={error} />}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <Spinner className="w-4 h-4" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo credentials */}
          {mode === 'login' && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-xs text-ink-faint mb-2 text-center">Demo accounts</p>
              <div className="space-y-1.5">
                {[
                  { role: 'Admin', email: 'admin@finboard.com' },
                  { role: 'Analyst', email: 'analyst@finboard.com' },
                  { role: 'Viewer', email: 'viewer@finboard.com' },
                ].map(({ role, email }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, email, password: 'Password123!' }))}
                    className="w-full text-left px-3 py-2 rounded-lg bg-surface-3 hover:bg-surface-4 transition-colors"
                  >
                    <span className="text-xs font-medium text-ink-muted">{role}:</span>{' '}
                    <span className="text-xs text-ink-faint font-mono">{email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
