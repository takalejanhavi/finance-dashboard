import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { Role } from '../../common/enums';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  private getUserFilter(user: { sub: string; role: string }): string | undefined {
    return user.role === Role.ADMIN ? undefined : user.sub;
  }

  async getSummary(user: { sub: string; role: string }) {
    const userId = this.getUserFilter(user);
    return this.analyticsRepository.getSummary(userId);
  }

  async getCategoryBreakdown(user: { sub: string; role: string }) {
    const userId = this.getUserFilter(user);
    const raw = await this.analyticsRepository.getCategoryBreakdown(userId);

    // Shape into { category, income, expense, net }
    const map = new Map<string, { category: string; income: number; expense: number; net: number; count: number }>();
    for (const row of raw) {
      const key = row.category;
      if (!map.has(key)) {
        map.set(key, { category: key, income: 0, expense: 0, net: 0, count: 0 });
      }
      const entry = map.get(key)!;
      const amount = parseFloat(row.total);
      const count = parseInt(row.count, 10);
      if (row.type === 'INCOME') {
        entry.income += amount;
        entry.net += amount;
      } else {
        entry.expense += amount;
        entry.net -= amount;
      }
      entry.count += count;
    }

    return Array.from(map.values()).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  }

  async getMonthlyTrends(user: { sub: string; role: string }, months = 12) {
    const userId = this.getUserFilter(user);
    const raw = await this.analyticsRepository.getMonthlyTrends(months, userId);

    // Merge INCOME + EXPENSE rows per month
    const map = new Map<string, { month: string; income: number; expense: number; net: number }>();
    for (const row of raw) {
      const key = row.month;
      if (!map.has(key)) {
        map.set(key, { month: key, income: 0, expense: 0, net: 0 });
      }
      const entry = map.get(key)!;
      const amount = parseFloat(row.total);
      if (row.type === 'INCOME') {
        entry.income += amount;
        entry.net += amount;
      } else {
        entry.expense += amount;
        entry.net -= amount;
      }
    }

    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getRecentTransactions(user: { sub: string; role: string }) {
    const userId = this.getUserFilter(user);
    return this.analyticsRepository.getRecentTransactions(userId);
  }
}
