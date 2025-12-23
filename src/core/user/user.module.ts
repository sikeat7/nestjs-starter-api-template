import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './domain/repositories/user.repository';
import { UserTokenRepository } from './domain/repositories/user-token.repository';
import { UserSessionRepository } from './domain/repositories/user-session.repository';
import { UserPasswordHistoryRepository } from './domain/repositories/user-password-history.repository';
import { RoleRepository } from './domain/repositories/role.repository';

@Module({
    controllers: [UserController],
    providers: [UserService, UserRepository, UserTokenRepository, UserSessionRepository, UserPasswordHistoryRepository, RoleRepository],
    exports: [UserService],
})
export class UserModule { }
