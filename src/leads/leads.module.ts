import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ActivityClientService } from 'src/notes/client/activity-client.service';
import { S3ClientService } from 'src/notes/client/s3-client.service';
import { TaskClientService } from 'src/notes/client/task-client.service';
import { LeadController } from './controller/leads.controller';
import { Lead, LeadSchema } from './model/leads.model';
import { LeadRepository } from './repository/leads.repository';
import { LeadService } from './service/leads.service';
import { TaskInstance } from './utils/task.instance';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
  ],
  controllers: [LeadController],
  providers: [
    LeadService,
    LeadRepository,
    ActivityClientService,
    TaskClientService,
    S3ClientService,
    TaskInstance,
  ],
})
export class LeadsModule {}
