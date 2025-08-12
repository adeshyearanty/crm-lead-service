import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Lead Status
import { LeadStatus, LeadStatusSchema } from './model/lead-status.model';
import { LeadStatusService } from './service/lead-status.service';
import { LeadStatusRepository } from './repository/lead-status.repository';
import { LeadStatusController } from './controller/lead-status.controller';

// Lead Source
import { LeadSource, LeadSourceSchema } from './model/lead-source.model';
import { LeadSourceController } from './controller/lead-source.controller';
import { LeadSourceService } from './service/lead-source.service';
import { LeadSourceRepository } from './repository/lead-source.repository';

// Industry Type
import { IndustryType, IndustryTypeSchema } from './model/industry-type.model';
import { IndustryTypeController } from './controller/industry-type.controller';
import { IndustryTypeService } from './service/industry-type.service';
import { IndustryTypeRepository } from './repository/industry-type.repository';

// Company Size
import { CompanySize, CompanySizeSchema } from './model/company-size.model';
import { CompanySizeService } from './service/company-size.service';
import { CompanySizeRepository } from './repository/company-size.repository';
import { CompanySizeController } from './controller/company-size.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadStatus.name, schema: LeadStatusSchema },
      { name: LeadSource.name, schema: LeadSourceSchema },
      { name: IndustryType.name, schema: IndustryTypeSchema },
      { name: CompanySize.name, schema: CompanySizeSchema },
    ]),
  ],
  controllers: [
    LeadStatusController,
    LeadSourceController,
    IndustryTypeController,
    CompanySizeController,
  ],
  providers: [
    LeadStatusService,
    LeadStatusRepository,
    LeadSourceService,
    LeadSourceRepository,
    IndustryTypeService,
    IndustryTypeRepository,
    CompanySizeService,
    CompanySizeRepository,
  ],
})
export class SettingsModule {}
