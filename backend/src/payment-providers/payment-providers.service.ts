import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProviderEntity, PaymentProviderStatus } from '@/entities/payment-provider.entity';
import {
  CreatePaymentProviderDto,
  UpdatePaymentProviderDto,
} from './dto/payment-provider.dto';

@Injectable()
export class PaymentProvidersService {
  constructor(
    @InjectRepository(PaymentProviderEntity)
    private paymentProvidersRepository: Repository<PaymentProviderEntity>,
  ) {}

  async list(status?: PaymentProviderStatus): Promise<PaymentProviderEntity[]> {
    const where = status ? { status } : {};
    return this.paymentProvidersRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async getById(id: number): Promise<PaymentProviderEntity> {
    const data = await this.paymentProvidersRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('Payment provider not found');
    return data;
  }

  async create(dto: CreatePaymentProviderDto): Promise<PaymentProviderEntity> {
    const existingCode = await this.paymentProvidersRepository.findOne({
      where: { provider_code: dto.provider_code },
    });
    if (existingCode) throw new ConflictException('provider_code already exists');

    const existingName = await this.paymentProvidersRepository.findOne({
      where: { provider_name: dto.provider_name },
    });
    if (existingName) throw new ConflictException('provider_name already exists');

    const data = this.paymentProvidersRepository.create({
      ...dto,
      status: dto.status ?? PaymentProviderStatus.INACTIVE,
      supported_currencies: dto.supported_currencies ?? null,
      supported_countries: dto.supported_countries ?? null,
      config_data: dto.config_data ?? null,
      enabled_for_events: dto.enabled_for_events ?? null,
    });
    return this.paymentProvidersRepository.save(data);
  }

  async update(id: number, dto: UpdatePaymentProviderDto): Promise<PaymentProviderEntity> {
    const data = await this.getById(id);
    Object.assign(data, {
      ...dto,
      supported_currencies:
        dto.supported_currencies !== undefined ? dto.supported_currencies : data.supported_currencies,
      supported_countries:
        dto.supported_countries !== undefined ? dto.supported_countries : data.supported_countries,
      config_data: dto.config_data !== undefined ? dto.config_data : data.config_data,
      enabled_for_events:
        dto.enabled_for_events !== undefined ? dto.enabled_for_events : data.enabled_for_events,
    });
    return this.paymentProvidersRepository.save(data);
  }

  async delete(id: number): Promise<void> {
    const data = await this.getById(id);
    await this.paymentProvidersRepository.remove(data);
  }
}
