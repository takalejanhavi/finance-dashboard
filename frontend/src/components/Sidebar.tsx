import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, BarChart2, Users,
  LogOut, TrendingUp, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInitials, cn } from '../utils/helpers'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard, roles: ['VIEWER','ANALYST','ADMIN'] },
  { to: '/records',    label: 'Records',     icon: FileText,        roles: ['ANALYST','ADMIN'] },
  { to: '/analytics',  label: 'Analytics',  icon: BarChart2,       roles: ['ANALYST','ADMIN'] },
  { to: '/admin',      label: 'Admin',       icon: Users,           roles: ['ADMIN'] },
] as const

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const allowedItems = navItems.filter(item =>
    user && (item.roles as readonly string[]).includes(user.role)
  )

  return (
    <aside className="w-64 min-h-screen bg-surface-1 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-ink tracking-tight">FinBoard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {allowedItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-ink-faint group-hover:text-ink-muted')} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-accent/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-3 transition-colors cursor-default">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-accent font-mono">
              {user ? getInitials(user.firstName, user.lastName) : '??'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-ink-faint truncate">{user?.email}</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-3 mt-2 mb-1">
          <span className={cn(
            user?.role === 'ADMIN' ? 'badge-admin' :
            user?.role === 'ANALYST' ? 'badge-analyst' : 'badge-viewer'
          )}>
            {user?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:bg-negative/10 hover:text-negative transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
