import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NoteMediaService } from '../service/note-media.service';

@ApiTags('Notes')
@Controller({
  version: '1',
  path: 'notes/media',
})
export class NoteMediaController {
  constructor(private readonly noteMediaService: NoteMediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image to S3' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    const key = await this.noteMediaService.uploadImage(file);
    return { success: true, key };
  }
}
