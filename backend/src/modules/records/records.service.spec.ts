import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsRepository } from './records.repository';

const mockRecordsRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const adminUser = { sub: 'admin-uuid', role: 'ADMIN' };
const analystUser = { sub: 'analyst-uuid', role: 'ANALYST' };

const mockRecord = {
  id: 'record-uuid',
  userId: 'analyst-uuid',
  amount: 1500,
  type: 'INCOME',
  category: 'Salary',
  date: new Date(),
  notes: 'Test',
};

describe('RecordsService', () => {
  let service: RecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: RecordsRepository, useValue: mockRecordsRepository },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should pass userId filter for non-admin users', async () => {
      mockRecordsRepository.findAll.mockResolvedValue({ records: [], total: 0 });
      await service.findAll({}, analystUser);
      expect(mockRecordsRepository.findAll).toHaveBeenCalledWith(expect.any(Object), analystUser.sub);
    });

    it('should pass no userId filter for admin users', async () => {
      mockRecordsRepository.findAll.mockResolvedValue({ records: [], total: 0 });
      await service.findAll({}, adminUser);
      expect(mockRecordsRepository.findAll).toHaveBeenCalledWith(expect.any(Object), undefined);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if record does not exist', async () => {
      mockRecordsRepository.findById.mockResolvedValue(null);
      await expect(service.findById('bad-id', adminUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the record', async () => {
      mockRecordsRepository.findById.mockResolvedValue({ ...mockRecord, userId: 'other-user-uuid' });
      await expect(service.findById('record-uuid', analystUser)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to access any record', async () => {
      mockRecordsRepository.findById.mockResolvedValue({ ...mockRecord, userId: 'other-user-uuid' });
      const result = await service.findById('record-uuid', adminUser);
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a record and return it', async () => {
      const dto = { amount: 500, type: 'INCOME' as any, category: 'Salary', date: '2024-01-01' };
      mockRecordsRepository.create.mockResolvedValue({ ...mockRecord, ...dto });

      const result = await service.create(dto, analystUser.sub);
      expect(mockRecordsRepository.create).toHaveBeenCalledWith(dto, analystUser.sub);
      expect(result.category).toBe('Salary');
    });
  });

  describe('remove', () => {
    it('should soft-delete owned record', async () => {
      mockRecordsRepository.findById.mockResolvedValue(mockRecord);
      mockRecordsRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(mockRecord.id, analystUser);
      expect(mockRecordsRepository.softDelete).toHaveBeenCalledWith(mockRecord.id);
      expect(result.message).toContain('deleted');
    });

    it('should throw ForbiddenException when deleting another user record', async () => {
      mockRecordsRepository.findById.mockResolvedValue({ ...mockRecord, userId: 'someone-else' });

      await expect(service.remove(mockRecord.id, analystUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
