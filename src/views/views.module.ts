import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewsController } from './controller/views.controller';
import { ViewSchema } from './model/view.model';
import { ViewRepository } from './repository/view.repository';
import { ViewsService } from './service/views.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'View', schema: ViewSchema }])],
  controllers: [ViewsController],
  providers: [ViewsService, ViewRepository],
})
export class ViewsModule {}
