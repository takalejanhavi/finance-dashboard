export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN'
export type RecordType = 'INCOME' | 'EXPENSE'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

export interface FinancialRecord {
  id: string
  userId: string
  amount: number
  type: RecordType
  category: string
  date: string
  notes?: string
  createdAt: string
  user?: { id: string; firstName: string; lastName: string; email?: string }
}

export interface Summary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export interface CategoryData {
  category: string
  income: number
  expense: number
  net: number
  count: number
}

export interface TrendData {
  month: string
  income: number
  expense: number
  net: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface RecordFilters {
  type?: RecordType | ''
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface UserFilters {
  role?: Role | ''
  isActive?: boolean | ''
  search?: string
  page?: number
  limit?: number
}
