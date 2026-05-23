import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommentsEntity } from './entities/comments.entity';
import { MailModule } from '../../common/Mail/mail.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity]), AuthModule, MailModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}