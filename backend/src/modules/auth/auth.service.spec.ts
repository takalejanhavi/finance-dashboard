import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcryptjs';

const mockAuthRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'Password123!',
    };

    it('should register a new user and return a token', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockAuthRepository.create.mockResolvedValue({
        id: 'uuid-1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'VIEWER',
        isActive: true,
      });

      const result = await service.register(dto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe(dto.email);
      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashed = await bcrypt.hash('Password123!', 12);
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: hashed,
        role: 'ANALYST',
        isActive: true,
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.login({ email: 'test@example.com', password: 'Password123!' });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('CorrectPassword1!', 12);
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: hashed,
        isActive: true,
        role: 'VIEWER',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for inactive user', async () => {
      const hashed = await bcrypt.hash('Password123!', 12);
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: hashed,
        isActive: false,
        role: 'VIEWER',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'Password123!' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('validateUserById', () => {
    it('should return user if found and active', async () => {
      const mockUser = { id: 'uuid-1', isActive: true, email: 'test@example.com' };
      mockAuthRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUserById('uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is inactive', async () => {
      mockAuthRepository.findById.mockResolvedValue({ id: 'uuid-1', isActive: false });

      const result = await service.validateUserById('uuid-1');
      expect(result).toBeNull();
    });
  });
});
