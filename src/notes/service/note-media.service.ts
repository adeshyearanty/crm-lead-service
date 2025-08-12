import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { S3ClientService } from '../client/s3-client.service';

@Injectable()
export class NoteMediaService {
  constructor(
    private readonly s3ClientService: S3ClientService,
    private readonly httpService: HttpService,
  ) {}

  private readonly logger = new Logger(NoteMediaService.name);

  async uploadImage(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<string> {
    if (!file) throw new InternalServerErrorException('No file provided');

    try {
      const key = `notes/${Date.now()}-${randomUUID()}-${file.originalname}`;
      const presignedUrl = await this.s3ClientService.generatePresignedUrl(
        key,
        file.mimetype,
      );
      const buffer = file.buffer;

      await firstValueFrom(
        this.httpService.put(presignedUrl, buffer, {
          headers: {
            'Content-Type': file.mimetype,
            'Content-Length': file.size,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      );

      return key;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unknown error during image upload';

      this.logger.error('Upload Error:', message);

      throw new InternalServerErrorException('Image upload failed: ' + message);
    }
  }
}
