import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto, UpdateRecordDto, RecordQueryDto } from './dto/records.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums';
import { ApiResponse as AppApiResponse } from '../../common/utils/api-response';

@ApiTags('Records')
@ApiBearerAuth('JWT-auth')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Get all financial records with filters' })
  async findAll(
    @Query() query: RecordQueryDto,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    const result = await this.recordsService.findAll(query, user);
    return AppApiResponse.success(result);
  }

  @Get(':id')
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Get a single record by ID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    const record = await this.recordsService.findById(id, user);
    return AppApiResponse.success(record);
  }

  @Post()
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Create a new financial record' })
  @ApiResponse({ status: 201, description: 'Record created' })
  async create(
    @Body() dto: CreateRecordDto,
    @CurrentUser('sub') userId: string,
  ) {
    const record = await this.recordsService.create(dto, userId);
    return AppApiResponse.success(record, 'Record created successfully');
  }

  @Patch(':id')
  @Roles(Role.ANALYST, Role.ADMIN)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Update a financial record' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecordDto,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    const record = await this.recordsService.update(id, dto, user);
    return AppApiResponse.success(record, 'Record updated successfully');
  }

  @Delete(':id')
  @Roles(Role.ANALYST, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ANALYST/ADMIN] Soft-delete a financial record' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    const result = await this.recordsService.remove(id, user);
    return AppApiResponse.success(result);
  }
}
