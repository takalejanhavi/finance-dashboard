import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRecordDto, UpdateRecordDto, RecordQueryDto } from './dto/records.dto';
import { RecordType } from '@prisma/client';

@Injectable()
export class RecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: RecordQueryDto, userId?: string) {
    const where: any = { deletedAt: null };

    if (userId) where.userId = userId;
    if (query.type) where.type = query.type as RecordType;
    if (query.category) where.category = { equals: query.category, mode: 'insensitive' };
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.search) {
      where.OR = [
        { notes: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findAll(query: RecordQueryDto, userId?: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query, userId);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.financialRecord.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.financialRecord.count({ where }),
    ]);

    return { records, total };
  }

  async findById(id: string) {
    return this.prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async create(dto: CreateRecordDto, userId: string) {
    return this.prisma.financialRecord.create({
      data: {
        userId,
        amount: dto.amount,
        type: dto.type as RecordType,
        category: dto.category,
        date: new Date(dto.date),
        notes: dto.notes,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async update(id: string, dto: Partial<UpdateRecordDto>) {
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    if (dto.type) data.type = dto.type as RecordType;

    return this.prisma.financialRecord.update({
      where: { id },
      data,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async softDelete(id: string) {
    return this.prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRecordOwner(id: string): Promise<string | null> {
    const record = await this.prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
      select: { userId: true },
    });
    return record?.userId ?? null;
  }
}
