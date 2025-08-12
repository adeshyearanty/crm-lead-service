import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';
import { ViewModel } from '../model/view.model';

@Injectable()
export class ViewRepository {
  private readonly logger = new Logger(ViewRepository.name);

  constructor(@InjectModel('View') private view: Model<ViewModel>) {}

  async create(
    userId: string,
    createViewDto: CreateViewDto,
  ): Promise<ViewModel> {
    const view = new this.view({
      ...createViewDto,
      userId,
      columnsToDisplay: createViewDto.columnsToDisplay || [],
    });
    return view.save();
  }

  async findAll(userId: string): Promise<ViewModel[]> {
    return this.view.find({ userId }).exec();
  }

  async findOne(userId: string, viewId: string): Promise<ViewModel | null> {
    return this.view.findOne({ _id: viewId, userId }).exec();
  }

  async findDefault(userId: string): Promise<ViewModel | null> {
    return this.view.findOne({ userId, isDefault: true }).exec();
  }

  async update(
    userId: string,
    viewId: string,
    updateViewDto: UpdateViewDto,
  ): Promise<ViewModel | null> {
    return this.view
      .findOneAndUpdate({ _id: viewId, userId }, updateViewDto, {
        new: true,
      })
      .exec();
  }

  async delete(userId: string, viewId: string): Promise<ViewModel | null> {
    this.logger.debug('Deleting view in view repository:', { userId, viewId });
    return this.view
      .findOneAndDelete({
        _id: viewId,
        userId,
        isDefault: false,
      })
      .exec();
  }

  async removeDefaultFromAllViews(userId: string): Promise<void> {
    await this.view
      .updateMany({ userId, isDefault: true }, { $set: { isDefault: false } })
      .exec();
  }
}
