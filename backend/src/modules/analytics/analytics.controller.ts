import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums';
import { ApiResponse as AppApiResponse } from '../../common/utils/api-response';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @Roles(Role.VIEWER, Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ALL ROLES] Get total income, expenses, and net balance' })
  async getSummary(@CurrentUser() user: { sub: string; role: string }) {
    const data = await this.analyticsService.getSummary(user);
    return AppApiResponse.success(data);
  }

  @Get('categories')
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Category-wise totals breakdown' })
  async getCategories(@CurrentUser() user: { sub: string; role: string }) {
    const data = await this.analyticsService.getCategoryBreakdown(user);
    return AppApiResponse.success(data);
  }

  @Get('trends')
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiQuery({ name: 'months', required: false, description: 'Number of past months (default 12)' })
  @ApiOperation({ summary: '[ANALYST/ADMIN] Monthly income/expense trends' })
  async getTrends(
    @CurrentUser() user: { sub: string; role: string },
    @Query('months') months?: string,
  ) {
    const data = await this.analyticsService.getMonthlyTrends(user, months ? parseInt(months) : 12);
    return AppApiResponse.success(data);
  }

  @Get('recent')
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Get last 10 transactions' })
  async getRecent(@CurrentUser() user: { sub: string; role: string }) {
    const data = await this.analyticsService.getRecentTransactions(user);
    return AppApiResponse.success(data);
  }
}
