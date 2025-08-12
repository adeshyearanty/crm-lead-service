import { Document, Schema } from 'mongoose';
import { SortOrder } from 'src/leads/dto/pagination.dto';
import {
  FilterCondition,
  DatePreset,
  FilterConditionDto,
} from '../../leads/dto/advanced-filters.dto';

export interface View {
  name: string;
  userId: string;
  isDefault: boolean;
  filters: FilterConditionDto[];
  sortBy?: string;
  sortOrder?: SortOrder;
  createdAt?: Date;
  updatedAt?: Date;
  columnsToDisplay?: string[];
}

export interface ViewModel extends View, Document {}

const FilterConditionSchema = new Schema(
  {
    field: { type: String, required: true },
    condition: {
      type: String,
      required: true,
      enum: Object.values(FilterCondition),
    },
    values: [{ type: String }],
    value: { type: Number },
    value2: { type: Number },
    preset: {
      type: String,
      enum: Object.values(DatePreset),
    },
    startDate: { type: String },
    endDate: { type: String },
  },
  { _id: false },
);

export const ViewSchema = new Schema<ViewModel>(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    filters: [FilterConditionSchema],
    sortBy: { type: String },
    sortOrder: { type: String, enum: Object.values(SortOrder) },
    columnsToDisplay: [{ type: String }],
  },
  {
    timestamps: true,
    collection: 'views',
  },
);
