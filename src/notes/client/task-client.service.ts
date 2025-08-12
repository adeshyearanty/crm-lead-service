import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse, AxiosError } from 'axios';
import { TaskPriority, TaskStatus, TaskType } from '../types/task.type';

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedTo: string;
  createdBy: string;
  organizationId: string;
  leadId: string;
  noteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TaskClientService {
  private readonly logger = new Logger(TaskClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get API_BASE_URL(): string {
    const url = this.configService.get<string>('TASK_CLIENT_URL');
    if (!url) {
      this.logger.error('TASK_CLIENT_URL is not defined in configuration');
      throw new InternalServerErrorException(
        'Task client base URL is not configured',
      );
    }
    return url;
  }

  async create(payload: {
    title: string;
    description: string;
    dueDate: string;
    leadId: string;
    noteId: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    createdBy: string;
    organizationId: string;
  }): Promise<TaskResponse> {
    try {
      const response: AxiosResponse<TaskResponse> =
        await this.httpService.axiosRef.post(`${this.API_BASE_URL}`, payload, {
          headers: {
            'x-api-key': this.configService.get<string>('X_API_KEY'),
          },
        });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responseData =
        error && typeof error === 'object' && 'response' in error
          ? (error as AxiosError).response?.data
          : undefined;

      this.logger.error('Error while creating task', responseData || message);
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async findByNoteId(noteId: string): Promise<TaskResponse[]> {
    try {
      const response: AxiosResponse<TaskResponse[]> =
        await this.httpService.axiosRef.get(
          `${this.API_BASE_URL}/note/${noteId}`,
          {
            headers: {
              'x-api-key': this.configService.get<string>('X_API_KEY'),
            },
          },
        );
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responseData =
        error && typeof error === 'object' && 'response' in error
          ? (error as AxiosError).response?.data
          : undefined;

      this.logger.error('Error while fetching tasks', responseData || message);
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  async update(
    taskId: string,
    payload: {
      title?: string;
      description?: string;
      dueDate?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
    },
  ): Promise<TaskResponse> {
    try {
      const response: AxiosResponse<TaskResponse> =
        await this.httpService.axiosRef.put(
          `${this.API_BASE_URL}/${taskId}`,
          payload,
          {
            headers: {
              'x-api-key': this.configService.get<string>('X_API_KEY'),
            },
          },
        );
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responseData =
        error && typeof error === 'object' && 'response' in error
          ? (error as AxiosError).response?.data
          : undefined;

      this.logger.error('Error while updating task', responseData || message);
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async delete(taskId: string): Promise<void> {
    try {
      await this.httpService.axiosRef.delete(`${this.API_BASE_URL}/${taskId}`, {
        headers: {
          'x-api-key': this.configService.get<string>('X_API_KEY'),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const responseData =
        error && typeof error === 'object' && 'response' in error
          ? (error as AxiosError).response?.data
          : undefined;

      this.logger.error('Error while deleting task', responseData || message);
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
