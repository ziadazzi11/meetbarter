import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SuccessionController } from './succession.controller';
import { SecurityModule } from '../security/security.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SecurityModule, AuthModule],
  providers: [UsersService],
  controllers: [UsersController, SuccessionController],
  exports: [UsersService],
})
export class UsersModule { }

