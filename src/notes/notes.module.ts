import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ActivityClientService } from './client/activity-client.service';
import { S3ClientService } from './client/s3-client.service';
import { TaskClientService } from './client/task-client.service';
import { CommentController } from './controller/comment.controller';
import { NoteMediaController } from './controller/note-media.controller';
import { NoteController } from './controller/note.controller';
import { Comment, CommentSchema } from './model/comment.model';
import { Note, NoteSchema } from './model/note.model';
import { CommentRepository } from './repository/comment.repository';
import { NoteRepository } from './repository/note.repository';
import { CommentService } from './service/comment.service';
import { NoteMediaService } from './service/note-media.service';
import { NoteService } from './service/note.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [NoteController, CommentController, NoteMediaController],
  providers: [
    NoteService,
    NoteRepository,
    CommentService,
    CommentRepository,
    TaskClientService,
    ActivityClientService,
    S3ClientService,
    NoteMediaService,
  ],
  exports: [NoteService],
})
export class NotesModule {}
