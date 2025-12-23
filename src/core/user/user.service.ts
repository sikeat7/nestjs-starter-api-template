import { Injectable } from '@nestjs/common';
import { UserRepository } from './domain/repositories/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { UserTokenRepository } from './domain/repositories/user-token.repository';
import { UserSessionRepository } from './domain/repositories/user-session.repository';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { UserTokenType } from 'src/common/enums/user-token-type.enum';
import { UserTokenResponseDto } from './dto/user-token-response.dto';
import { BadRequestAppException } from 'src/common/exceptions/bad-request.exception';
import Miscellaneous from 'src/utils/miscellaneous.utils';
import { CreateUserDto } from './dto/create-user.dto';
import PasswordUtils from 'src/utils/password.utils';
import { AuthProviderEnum } from 'src/common/enums/auth-provider.enum';
import { NotFoundAppException } from 'src/common/exceptions/not-found-error';
import { UserPasswordHistoryRepository } from './domain/repositories/user-password-history.repository';
import { PrismaService } from 'src/database/prisma.service';
import { RoleRepository } from './domain/repositories/role.repository';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { UpdateUserTokenDto } from './dto/update-user-token.dto';
import { UserEntity } from './domain/entities/user.entity';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private readonly userTokenRepository: UserTokenRepository,
        private readonly userSessionRepository: UserSessionRepository,
        private readonly userPasswordHistoryRepository: UserPasswordHistoryRepository,
    ) { }

    /**
     * Retrieves a user by unique identifier.
     *
     * @param id - The unique identifier of the user to retrieve.
     * @returns A promise that resolves to a `UserResponseDto` if the user is found, or `null` if not found.
     */
    async findById(id: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findById(id);
        if (!user) return null;
        return new UserResponseDto(user);
    }

    /**
     * Retrieves a user by email address.
     *
     * @param email - The email address of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserResponseDto` if the user is found, or `null` if not found.
     */
    async findByEmail(email: string, includePassword: boolean = false): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findByEmail(email, includePassword);
        if (!user) return null;
        return new UserResponseDto(user);
    }

    /**
     * Retrieves a user by username.
     *
     * @param username - The username of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserResponseDto` if the user is found, or `null` if not found.
     */
    async findByUsername(username: string, includePassword: boolean = false): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findByUsername(username, includePassword);
        if (!user) return null;
        return new UserResponseDto(user);
    }

    /**
     * Retrieves a user by email or username.
     *
     * @param emailOrUsername - The email or username of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserResponseDto` if the user is found, or `null` if not found.
     */
    async findByEmailOrUsername(emailOrUsername: string, includePassword: boolean = false): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findByEmailOrUsername(emailOrUsername, includePassword);
        if (!user) return null;
        return new UserResponseDto(user);
    }

    /**
     * Retrieves a user by email or username.
     *
     * @param emailOrUsername - The email or username of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserEntity` if the user is found, or `null` if not found.
     */
    async findByEmailOrUsernameForLogin(emailOrUsername: string, includePassword: boolean = true): Promise<UserEntity | null | null> {
        return await this.userRepository.findByEmailOrUsername(emailOrUsername, includePassword);
    }

    /**
     * Compares a password with a user's password.
     *
     * @param plainTextPassword - The password to compare.
     * @param hashedPassword - The user's password to compare against.
     * @returns A promise that resolves to `true` if the passwords match, or `false` otherwise.
     */
    async comparePassword(plainTextPassword: string, hashedPassword: string) {
        return await PasswordUtils.comparePassword(plainTextPassword, hashedPassword);
    }

    /**
     * Generates a unique username based on the user's first name, last name, and email.
     *
     * @param firstName - The user's first name.
     * @param lastName - The user's last name.
     * @param email - The user's email address.
     * @returns A promise that resolves to the generated username.
     */
    async generateUniqueUsername(firstName: string, lastName: string, email: string) {
        // 1. Create a "Base" username
        // Fallback to email handle if names are missing
        let baseUsername = '';

        if (firstName || lastName) {
            if (firstName && lastName) {
                baseUsername = `${Miscellaneous.sanitize(firstName)}.${Miscellaneous.sanitize(lastName)}`;
            } else {
                baseUsername = Miscellaneous.sanitize(firstName || lastName);
            }
        } else {
            baseUsername = Miscellaneous.sanitize(email.split('@')[0]);
        }

        // 2. Define retry limits
        let isUnique = false;
        let attempt = 0;
        let finalUsername = baseUsername;
        const maxRetries = 5;

        while (!isUnique && attempt < maxRetries) {
            try {
                // 3. Logic: First attempt = clean name. Subsequent attempts = name + random suffix
                if (attempt > 0) {
                    finalUsername = `${baseUsername}${Miscellaneous.generateSuffix()}`;
                }

                // 4. Check existence (Soft Check)
                const existingUser = await this.userRepository.findByUsername(finalUsername);
                if (!existingUser) {
                    // 5. If null, the username is free!
                    isUnique = true;
                    return finalUsername;
                }

                // If found, loop continues and adds a suffix
                attempt++;

            } catch (error) {
                // Log error and break to prevent infinite loops
                console.error("Error generating username:", error);
                break;
            }
        }

        // Fallback if loop fails (very unlikely) -> Use timestamp
        return `${baseUsername}${Date.now()}`;
    }

    /**
     * Creates a new user with the specified data and role.
     *
     * @param data - The user data required for creation, including email, password, and personal details.
     * @param role - The role to assign to the new user.
     * @returns A promise that resolves to the created user's DTO, or null if creation fails.
     */
    async create(data: CreateUserDto, roleName: string): Promise<UserResponseDto> {

        const hashedPassword = await PasswordUtils.hashPassword(data.password);
        const username = await this.generateUniqueUsername(data.firstName, data.lastName || "", data.email);

        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
            throw new BadRequestAppException('Invalid role.', ['INVALID_ROLE']);
        }

        const user = await this.prisma.$transaction(async (tx) => {
            const user = await this.userRepository.create(tx, data, username, hashedPassword, role.id, AuthProviderEnum.CREDENTIALS);
            await this.roleRepository.mapRoleWithUser(tx, role.id, user.id);
            return user;
        });

        if (!user) {
            throw new BadRequestAppException('Failed to create user.', ['USER_CREATION_FAILED']);
        }

        const finalUser = await this.findById(user.id);
        if (!finalUser) {
            throw new BadRequestAppException('Failed to create user.', ['USER_CREATION_FAILED']);
        }

        return finalUser;
    }

    /**
     * Updates a user's password.
     *
     * @param id - The unique identifier of the user whose password is to be updated.
     * @param newPassword - The new password to set for the user.
     * @returns A promise that resolves to the updated user's DTO, or null if the user was not found.
     */
    async updatePassword(id: string, newPassword: string, currentPassword?: string): Promise<boolean | null> {
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            throw new NotFoundAppException(`User with ID '${id}' not found.`, 'USER_NOT_FOUND');
        }

        const hashedPassword = await PasswordUtils.hashPassword(newPassword);

        if (currentPassword && !(await PasswordUtils.comparePassword(currentPassword, existingUser.password || ''))) {
            throw new BadRequestAppException('Current password is incorrect.', ['INCORRECT_CURRENT_PASSWORD']);
        }

        //check if this password is same as old password
        if (await PasswordUtils.comparePassword(newPassword, existingUser.password || '')) {
            throw new BadRequestAppException('New password cannot be the same as the old password.', ['PASSWORD_SAME_AS_OLD']);
        }

        //check if new password is strong enough
        if (!PasswordUtils.isStrongPassword(newPassword)) {
            throw new BadRequestAppException('New password is not strong enough.', ['WEAK_PASSWORD']);
        }

        //check if the new password not used in last 5 passwords
        const last5Passwords = await this.userPasswordHistoryRepository.getPasswordHistoryByUserId(id);

        const passwordChecks = await Promise.all(
            last5Passwords.map(async (history) => {
                const passwordResult = await PasswordUtils.comparePassword(newPassword, history.passwordHash || '');
                return passwordResult;
            })
        );

        const isPasswordUsed = passwordChecks.includes(true);

        if (isPasswordUsed) {
            throw new BadRequestAppException('Your new password must be different from your 5 most recent passwords', ['PASSWORD_USED_IN_LAST_5_PASSWORDS']);
        }

        await this.prisma.$transaction(async (tx) => {
            await this.userRepository.updatePassword(tx, id, hashedPassword);
            await this.userPasswordHistoryRepository.addPasswordHistory(tx, id, hashedPassword);
        });

        return true;
    }

    /**
     * Retrieves all roles associated with a user.
     *
     * @param userId - The unique identifier of the user to retrieve roles for.
     * @returns A promise that resolves to an array of `RoleResponseDto` objects.
     */
    async findRolesByUserId(userId: string): Promise<RoleResponseDto[] | null> {
        const roles = await this.roleRepository.findRolesByUserId(userId);
        if (!roles) return null;
        return roles.map((role) => new RoleResponseDto(role));
    }

    /**
     * Validates a user token by checking if it exists and is not used or expired.
     *
     * @param userId - The unique identifier of the user.
     * @param token - The token to validate.
     * @returns A promise that resolves to the UserTokenDto if the token is valid, or null if not found or invalid.
     */
    async validateUserToken(userId: string, token: string, type: UserTokenType): Promise<UserTokenResponseDto | null> {
        const userToken = await this.userTokenRepository.validateUserToken(userId, token, type);

        if (!userToken) {
            throw new BadRequestAppException('Invalid or expired token.', ['TOKEN_INVALID_OR_EXPIRED']);
        }

        return new UserTokenResponseDto(userToken);
    }

    /**
     * Creates a new user token for a specific user.
     *
     * @param userId - The unique identifier of the user for whom the token is being created.
     * @param model - The data model containing the token details.
     * @returns A promise that resolves to the created UserTokenDto, or null if creation fails.
     */
    async createUserToken(userId: string, model: CreateUserTokenDto): Promise<UserTokenResponseDto | null> {
        const token = await this.userTokenRepository.create(userId, model);

        if (!token) {
            throw new BadRequestAppException('Failed to create token.', ['TOKEN_CREATION_FAILED']);
        }

        return new UserTokenResponseDto(token);
    }

    /**
     * Updates an existing user token for a specific user.
     *
     * @param userId - The unique identifier of the user whose token is being updated.
     * @param model - The data model containing the updated token details.
     * @returns A promise that resolves to the updated UserTokenDto, or null if the update fails.
     */
    async updateUserToken(userId: string, model: Partial<UpdateUserTokenDto>): Promise<UserTokenResponseDto | null> {
        const { token, type, expiresAt, isUsed, ipAddress, userAgent } = model;

        const existingToken = await this.userTokenRepository.findFirst({
            userId,
            token,
            isUsed: false,
        });

        if (!existingToken) {
            throw new NotFoundAppException(`Token not found for user '${userId}'.`, 'TOKEN_NOT_FOUND');
        }

        const data: UpdateUserTokenDto = {
            type: (type !== undefined ? type : existingToken.type as UserTokenType) ?? existingToken.type as UserTokenType,
            expiresAt: (expiresAt !== undefined ? expiresAt : existingToken.expiresAt) ?? existingToken.expiresAt,
            isUsed: (isUsed !== undefined ? isUsed : existingToken.isUsed) ?? existingToken.isUsed,
            ipAddress: ipAddress !== undefined ? ipAddress : existingToken.ipAddress,
            userAgent: userAgent !== undefined ? userAgent : existingToken.userAgent,
            token: existingToken.token,
        };

        const userToken = await this.userTokenRepository.update(userId, data);

        if (!userToken) {
            throw new BadRequestAppException('Failed to update token.', ['TOKEN_UPDATE_FAILED']);
        }

        return new UserTokenResponseDto(userToken);
    }

    /**
     * Retrieves a user session by user ID and token.
     *
     * @param userId - The unique identifier of the user.
     * @param token - The session token to search for.
     * @returns A promise that resolves to a UserSessionResponseDto if the session is found, or null if not found.
     */
    async getUserSessionByToken(userId: string, token: string): Promise<UserSessionResponseDto | null> {
        const session = await this.userSessionRepository.getUserSessionByToken(userId, token);

        if (!session) return null;
        return new UserSessionResponseDto(session);
    }

    /**
     * Saves a new user session to the database.
     *
     * @param userId - The unique identifier of the user for whom the session is being created.
     * @param token - The session token to be saved.
     * @param ip - The IP address of the user at the time of session creation.
     * @param userAgent - The user agent string of the user's device.
     * @param expiresAt - The expiration date and time of the session.
     * @returns A promise that resolves to a UserSessionDto representing the newly created session.
     */
    async saveUserSession(userId: string, token: string, ip: string, userAgent: string, expiresAt: Date): Promise<UserSessionResponseDto> {
        const session = await this.userSessionRepository.saveUserSession(userId, token, ip, userAgent, expiresAt);
        if (!session) throw new BadRequestAppException('Failed to create user session.', ['USER_SESSION_CREATION_FAILED']);
        return new UserSessionResponseDto(session);
    }

    /**
   * Deletes a user session by user ID and token.
   *
   * @param userId - The unique identifier of the user whose session is to be deleted.
   * @param token - The session token to delete.
   * @returns A promise that resolves to the deleted UserSessionDto if successful, or null if no session was found.
   */
    async deleteUserSession(userId: string, token: string): Promise<UserSessionResponseDto | null> {
        const session = await this.userSessionRepository.deleteUserSession(userId, token);
        if (!session) return null;
        return new UserSessionResponseDto(session);
    }

}
