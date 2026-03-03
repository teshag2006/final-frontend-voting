import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaymentProviderStatus } from '@/entities/payment-provider.entity';
import { PaymentProvidersService } from './payment-providers.service';
import {
  CreatePaymentProviderDto,
  UpdatePaymentProviderDto,
} from './dto/payment-provider.dto';

@Controller('payment-providers')
export class PaymentProvidersController {
  constructor(private paymentProvidersService: PaymentProvidersService) {}

  @Get()
  async list(
    @Query('status') status?: PaymentProviderStatus,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.paymentProvidersService.list(status);
    return {
      statusCode: 200,
      message: 'Payment providers retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.paymentProvidersService.getById(id);
    return {
      statusCode: 200,
      message: 'Payment provider retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePaymentProviderDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.paymentProvidersService.create(dto);
    return {
      statusCode: 201,
      message: 'Payment provider created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentProviderDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.paymentProvidersService.update(id, dto);
    return {
      statusCode: 200,
      message: 'Payment provider updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentProvidersService.delete(id);
  }
}
