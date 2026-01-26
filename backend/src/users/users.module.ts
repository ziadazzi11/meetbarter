import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SuccessionController } from './succession.controller';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [SecurityModule],
  providers: [UsersService],
  controllers: [UsersController, SuccessionController],
  exports: [UsersService],
})
export class UsersModule { }

