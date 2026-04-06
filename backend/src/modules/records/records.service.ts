import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { RecordsRepository } from './records.repository';
import { CreateRecordDto, UpdateRecordDto, RecordQueryDto } from './dto/records.dto';
import { paginate } from '../../common/dto/pagination.dto';
import { Role } from '../../common/enums';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(private readonly recordsRepository: RecordsRepository) {}

  async findAll(query: RecordQueryDto, requestingUser: { sub: string; role: string }) {
    // Viewers and Analysts see only their own records; Admins see all
    const userId = requestingUser.role === Role.ADMIN ? undefined : requestingUser.sub;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const { records, total } = await this.recordsRepository.findAll(query, userId);
    return paginate(records, total, page, limit);
  }

  async findById(id: string, requestingUser: { sub: string; role: string }) {
    const record = await this.recordsRepository.findById(id);
    if (!record) throw new NotFoundException(`Record ${id} not found`);

    if (requestingUser.role !== Role.ADMIN && record.userId !== requestingUser.sub) {
      throw new ForbiddenException('You do not have access to this record');
    }

    return record;
  }

  async create(dto: CreateRecordDto, userId: string) {
    const record = await this.recordsRepository.create(dto, userId);
    this.logger.log(`Record created: ${record.id} by user ${userId}`);
    return record;
  }

  async update(id: string, dto: UpdateRecordDto, requestingUser: { sub: string; role: string }) {
    const record = await this.recordsRepository.findById(id);
    if (!record) throw new NotFoundException(`Record ${id} not found`);

    if (requestingUser.role !== Role.ADMIN && record.userId !== requestingUser.sub) {
      throw new ForbiddenException('You can only update your own records');
    }

    const updated = await this.recordsRepository.update(id, dto);
    this.logger.log(`Record updated: ${id}`);
    return updated;
  }

  async remove(id: string, requestingUser: { sub: string; role: string }) {
    const record = await this.recordsRepository.findById(id);
    if (!record) throw new NotFoundException(`Record ${id} not found`);

    if (requestingUser.role !== Role.ADMIN && record.userId !== requestingUser.sub) {
      throw new ForbiddenException('You can only delete your own records');
    }

    await this.recordsRepository.softDelete(id);
    this.logger.log(`Record soft-deleted: ${id}`);
    return { message: 'Record deleted successfully' };
  }
}
