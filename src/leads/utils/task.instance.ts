import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';

@Injectable()
export class TaskInstance {
  private readonly logger = new Logger(TaskInstance.name);
  private readonly axiosInstance: AxiosInstance;

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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.axiosInstance = this.httpService.axiosRef.create({
      baseURL: this.API_BASE_URL,
    });
  }

  // async filterLeads(dto: any): Promise<AxiosResponse> {
  //   return this.axiosInstance.post('/filter', dto, {
  //     headers: {
  //       'x-api-key': '09FwQAlQL37yaYMYBifrw9m8TkIWoK3228uELTc3',
  //     },
  //   });
  // }
}
