import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity } from '@/entities/event.entity';
import { CategoriesService } from './categories.service';
import { CategoriesPublicController } from './categories.controller';
import { CategoriesAdminController } from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, EventEntity])],
  controllers: [CategoriesPublicController, CategoriesAdminController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
