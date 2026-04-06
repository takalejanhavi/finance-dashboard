import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * DB-level aggregation: total income, total expenses, net balance
   * Filtered to a user if userId is provided (non-admin)
   */
  async getSummary(userId?: string) {
    const result = await this.prisma.$queryRaw<
      { total_income: string; total_expenses: string; net_balance: string }[]
    >`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expenses,
        COALESCE(SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE -amount END), 0) AS net_balance
      FROM financial_records
      WHERE deleted_at IS NULL
        ${userId ? this.prisma.$queryRaw`AND user_id = ${userId}::uuid` : this.prisma.$queryRaw``}
    `;

    // Use conditional approach to avoid template literal nesting issue
    if (userId) {
      const r = await this.prisma.$queryRaw<
        { total_income: string; total_expenses: string; net_balance: string }[]
      >`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expenses,
          COALESCE(SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE -amount END), 0) AS net_balance
        FROM financial_records
        WHERE deleted_at IS NULL AND user_id = ${userId}::uuid
      `;
      return this.mapSummary(r[0]);
    }

    return this.mapSummary(result[0]);
  }

  private mapSummary(row: { total_income: string; total_expenses: string; net_balance: string }) {
    return {
      totalIncome: parseFloat(row.total_income),
      totalExpenses: parseFloat(row.total_expenses),
      netBalance: parseFloat(row.net_balance),
    };
  }

  /**
   * DB-level aggregation: category-wise totals split by type
   */
  async getCategoryBreakdown(userId?: string) {
    if (userId) {
      return this.prisma.$queryRaw<
        { category: string; type: string; total: string; count: string }[]
      >`
        SELECT
          category,
          type,
          SUM(amount) AS total,
          COUNT(*) AS count
        FROM financial_records
        WHERE deleted_at IS NULL AND user_id = ${userId}::uuid
        GROUP BY category, type
        ORDER BY total DESC
      `;
    }

    return this.prisma.$queryRaw<
      { category: string; type: string; total: string; count: string }[]
    >`
      SELECT
        category,
        type,
        SUM(amount) AS total,
        COUNT(*) AS count
      FROM financial_records
      WHERE deleted_at IS NULL
      GROUP BY category, type
      ORDER BY total DESC
    `;
  }

  /**
   * DB-level aggregation: monthly trends for the past N months
   */
  async getMonthlyTrends(months = 12, userId?: string) {
    if (userId) {
      return this.prisma.$queryRaw<
        { month: string; type: string; total: string; count: string }[]
      >`
        SELECT
          TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
          type,
          SUM(amount) AS total,
          COUNT(*) AS count
        FROM financial_records
        WHERE deleted_at IS NULL
          AND user_id = ${userId}::uuid
          AND date >= DATE_TRUNC('month', NOW() - INTERVAL '1 month' * ${months})
        GROUP BY DATE_TRUNC('month', date), type
        ORDER BY month ASC
      `;
    }

    return this.prisma.$queryRaw<
      { month: string; type: string; total: string; count: string }[]
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
        type,
        SUM(amount) AS total,
        COUNT(*) AS count
      FROM financial_records
      WHERE deleted_at IS NULL
        AND date >= DATE_TRUNC('month', NOW() - INTERVAL '1 month' * ${months})
      GROUP BY DATE_TRUNC('month', date), type
      ORDER BY month ASC
    `;
  }

  /**
   * Last 10 transactions (most recent by date)
   */
  async getRecentTransactions(userId?: string) {
    if (userId) {
      return this.prisma.financialRecord.findMany({
        where: { deletedAt: null, userId },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: 10,
        include: { user: { select: { firstName: true, lastName: true } } },
      });
    }

    return this.prisma.financialRecord.findMany({
      where: { deletedAt: null },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }
}
