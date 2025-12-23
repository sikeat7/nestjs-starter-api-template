import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { UnauthorizedAppException } from "src/common/exceptions/unauthorized-error";
import { UserEntity } from "../user/domain/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserSessionResponseDto } from "../user/dto/user-session-response.dto";
import { UserResponseDto } from "../user/dto/user-response.dto";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginResponseDto } from "./dto/login.response.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    /**
     * Authenticate user and return access token
     * @param model 
     * @param ip 
     * @param userAgent 
     * @returns returns user and access token on success or throws exception on failure
     */
    async authenticate(model: LoginDto, ip: string, userAgent: string): Promise<LoginResponseDto> {

        const user = await this.validateUser(model);

        if (!user) {
            throw new UnauthorizedAppException('Invalid username or password', 'INVALID_USERNAME_OR_PASSWORD');
        }

        const token = await this.generateToken(user);

        await this.userService.saveUserSession(
            user.id,
            token,
            ip,
            userAgent,
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        );

        return new LoginResponseDto({
            user: new UserResponseDto(user),
            accessToken: token,
        });
    }


    async register(model: CreateUserDto, roleName: string): Promise<UserResponseDto> {
        return await this.userService.create(model, roleName);
    }

    /**
     * Logout user and remove access token
     * @param userId 
     * @param token 
     * @returns 
     */
    async logout(userId: string, token: string) {
        await this.userService.deleteUserSession(userId, token);
    }

    private async validateUser(model: LoginDto): Promise<UserEntity | null> {
        const user = await this.userService.findByEmailOrUsernameForLogin(model.username, true);

        if (!user) {
            throw new UnauthorizedAppException('Invalid username or password', 'INVALID_USERNAME_OR_PASSWORD');
        }

        const isPasswordMatched = await this.userService.comparePassword(model.password, user.password || '');
        if (!isPasswordMatched) {
            throw new UnauthorizedAppException('Invalid username or password', 'INVALID_USERNAME_OR_PASSWORD');
        }

        if (!user.isActive) {
            throw new UnauthorizedAppException('Your account is not active', 'USER_IS_NOT_ACTIVE');
        }

        return user;
    }

    private async generateToken(user: UserEntity): Promise<string> {
        const payload = {
            id: user.id,
            sub: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            profileImageUrl: user.profileImageUrl,
            phoneNumber: user.phoneNumber,
            roles: user.roles?.map((role) => {
                return {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                };
            }),
        };
        return this.jwtService.signAsync(payload);
    }
}