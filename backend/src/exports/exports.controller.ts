import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { extractAuthenticatedTenantId } from '@/common/helpers/tenant.helper';
import { ExportsService } from './exports.service';
import { ExportStatus } from '@/entities/export.entity';
import { CreateExportDto, UpdateExportDto } from './dto/export.dto';

@Controller('exports')
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @Get()
  @UseGuards(JwtGuard)
  async listExports(
    @Query('eventId') eventId?: number,
    @Query('status') status?: ExportStatus,
    @Request() req?: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.exportsService.listExports(eventId, status, tenantId);
    return {
      statusCode: 200,
      message: 'Exports retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getExport(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.exportsService.getExportById(id, tenantId);
    return {
      statusCode: 200,
      message: 'Export retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createExport(
    @Body() dto: CreateExportDto,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.exportsService.createExport(req.user.id, dto, tenantId);
    return {
      statusCode: 201,
      message: 'Export created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async updateExport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExportDto,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.exportsService.updateExport(id, dto, tenantId);
    return {
      statusCode: 200,
      message: 'Export updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/downloaded')
  @UseGuards(JwtGuard)
  async markDownloaded(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.exportsService.markDownloaded(id, tenantId);
    return {
      statusCode: 200,
      message: 'Export marked as downloaded',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExport(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    const tenantId = extractAuthenticatedTenantId(req);
    await this.exportsService.deleteExport(id, tenantId);
  }
}
