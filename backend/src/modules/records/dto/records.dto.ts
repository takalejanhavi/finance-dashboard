import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecordType } from '../../../common/enums';

export class CreateRecordDto {
  @ApiProperty({ example: 4500.00, description: 'Amount (must be positive)' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a valid number with max 2 decimal places' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({ enum: RecordType, example: RecordType.INCOME })
  @IsEnum(RecordType, { message: 'Type must be INCOME or EXPENSE' })
  type: RecordType;

  @ApiProperty({ example: 'Salary' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: '2024-01-15', description: 'Date in ISO format (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string (YYYY-MM-DD)' })
  date: string;

  @ApiPropertyOptional({ example: 'Monthly salary payment' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateRecordDto {
  @ApiPropertyOptional({ example: 5000.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @ApiPropertyOptional({ example: 'Freelance' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: '2024-02-20' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RecordQueryDto {
  @ApiPropertyOptional({ enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @ApiPropertyOptional({ example: 'Salary' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter from this date (inclusive)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Filter to this date (inclusive)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Search in notes or category' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
