import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/users.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { ApiResponse as AppApiResponse } from '../../common/utils/api-response';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] List all users with filters and pagination' })
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.usersService.findAll(query);
    return AppApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '[ADMIN] Get user count by role' })
  async getStats() {
    const stats = await this.usersService.getUserStats();
    return AppApiResponse.success(stats);
  }

  @Get(':id')
  @ApiOperation({ summary: '[ADMIN] Get a single user by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return AppApiResponse.success(user);
  }

  @Post()
  @ApiOperation({ summary: '[ADMIN] Create a new user with assigned role' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return AppApiResponse.success(user, 'User created successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: '[ADMIN] Update user details or role' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    return AppApiResponse.success(user, 'User updated successfully');
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: '[ADMIN] Activate a user account' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.setActive(id, true);
    return AppApiResponse.success(user, 'User activated');
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: '[ADMIN] Deactivate a user account' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.setActive(id, false);
    return AppApiResponse.success(user, 'User deactivated');
  }
}
