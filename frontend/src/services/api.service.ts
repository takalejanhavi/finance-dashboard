import api from '../lib/api'
import type { RecordFilters, UserFilters } from '../types'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  me: () => api.get('/auth/me'),
}

// ── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary:    () => api.get('/analytics/summary'),
  categories: () => api.get('/analytics/categories'),
  trends:     (months = 12) => api.get(`/analytics/trends?months=${months}`),
  recent:     () => api.get('/analytics/recent'),
}

// ── Records ──────────────────────────────────────────────────────────────────
export const recordsApi = {
  list: (filters: RecordFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.append(k, String(v))
    })
    return api.get(`/records?${params.toString()}`)
  },
  get:    (id: string) => api.get(`/records/${id}`),
  create: (data: unknown) => api.post('/records', data),
  update: (id: string, data: unknown) => api.patch(`/records/${id}`, data),
  delete: (id: string) => api.delete(`/records/${id}`),
}

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const usersApi = {
  list: (filters: UserFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.append(k, String(v))
    })
    return api.get(`/users?${params.toString()}`)
  },
  get:        (id: string) => api.get(`/users/${id}`),
  create:     (data: unknown) => api.post('/users', data),
  update:     (id: string, data: unknown) => api.patch(`/users/${id}`, data),
  activate:   (id: string) => api.patch(`/users/${id}/activate`),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
  stats:      () => api.get('/users/stats'),
}
