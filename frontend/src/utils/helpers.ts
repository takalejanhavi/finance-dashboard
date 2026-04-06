export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Utilities',
  'Groceries', 'Transport', 'Healthcare', 'Entertainment', 'Education',
  'Other',
]

export const CATEGORY_COLORS: Record<string, string> = {
  Salary:        '#7c6af7',
  Freelance:     '#34d399',
  Investment:    '#fbbf24',
  Rent:          '#f87171',
  Utilities:     '#60a5fa',
  Groceries:     '#a78bfa',
  Transport:     '#f472b6',
  Healthcare:    '#4ade80',
  Entertainment: '#fb923c',
  Education:     '#22d3ee',
  Other:         '#a0a0b0',
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#a0a0b0'
}
