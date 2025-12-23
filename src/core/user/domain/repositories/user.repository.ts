import { Injectable } from '@nestjs/common';
import { AuthProvider, Prisma, User } from 'prisma/generated/prisma/browser';
import { PrismaService } from 'src/database/prisma.service';
import { AuthProviderEnum } from 'src/common/enums/auth-provider.enum';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    private getRoleSelectPattern(): Prisma.RoleSelect {
        return {
            id: true,
            name: true,
            description: true,
        };
    }

    private getCountrySelectPattern(): Prisma.CountrySelect {
        return {
            name: true,
            code: true,
            codeIso3: true,
        };
    }

    /** 
     * Retrieves a user by unique identifier.
     *
     * @param id - The unique identifier of the user to retrieve.
     * @returns A promise that resolves to a `UserEntity` if the user is found, or `null` if not found.
     */
    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    select: {
                        role: {
                            select: this.getRoleSelectPattern(),
                        },
                    },
                },
                country: {
                    select: this.getCountrySelectPattern(),
                },
            },
        });

        if (!user) return null;

        return this.mapToEntity(user);
    }

    /**
     * Retrieves a user by email address.
     *
     * @param email - The email address of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserEntity` if the user is found, or `null` if not found.
     */
    async findByEmail(email: string, includePassword: boolean = false): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email,
            },
            include: {
                roles: {
                    select: {
                        role: {
                            select: this.getRoleSelectPattern(),
                        },
                    },
                },
                country: {
                    select: this.getCountrySelectPattern(),
                },
            },
        });

        if (!user) return null;

        return this.mapToEntity(user, includePassword);
    }

    /**
     * Retrieves a user by username.
     *
     * @param username - The username of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserEntity` if the user is found, or `null` if not found.
     */
    async findByUsername(username: string, includePassword: boolean = false): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                username: username,
            },
            include: {
                roles: {
                    select: {
                        role: {
                            select: this.getRoleSelectPattern(),
                        },
                    },
                },
                country: {
                    select: this.getCountrySelectPattern(),
                },
            },
        });

        if (!user) return null;

        return this.mapToEntity(user, includePassword);
    }

    /**
     * Retrieves a user by email or username.
     *
     * @param emailOrUsername - The email or username of the user to retrieve.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A promise that resolves to a `UserEntity` if the user is found, or `null` if not found.
     */
    async findByEmailOrUsername(emailOrUsername: string, includePassword: boolean = false): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: emailOrUsername },
                    { email: emailOrUsername },
                ]
            },
            include: {
                roles: {
                    select: {
                        role: {
                            select: this.getRoleSelectPattern(),
                        },
                    },
                },
                country: {
                    select: this.getCountrySelectPattern(),
                },
            },
        });

        if (!user) return null;

        return this.mapToEntity(user, includePassword);
    }

    /**
     * Generates a unique username based on the user's first name, last name, and email.
     *
     * @param firstName - The user's first name.
     * @returns A promise that resolves to a boolean indicating whether the username is available.
     */
    async checkUsernameAvailability(username: string): Promise<boolean> {
        const existingUser = await this.prisma.user.findFirst({
            where: { username },
            select: { id: true }
        });

        if (existingUser) {
            return false;
        }

        return true;
    }

    /**
     * Creates a new user with the specified data and role.
     *
     * @param tx - The Prisma transaction client.
     * @param data - The user data required for creation, including email, password, and personal details.
     * @param username - The username to assign to the new user.
     * @param hashedPassword - The hashed password to assign to the new user.
     * @param roleId - The role ID to assign to the new user.
     * @returns A promise that resolves to the created UserEntity, or null if creation fails.
     */
    async create(tx: Prisma.TransactionClient, data: CreateUserDto, username: string, hashedPassword: string, roleId: string, provider: AuthProvider): Promise<User> {

        return tx.user.create({
            data: {
                email: data.email || null,
                username: username || null,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName || null,
                phoneNumber: data.phoneNumber || null,
                gender: data.gender || null,
                isEmailVerified: data.isEmailVerified || false,
                isPhoneVerified: data.isPhoneVerified || false,
                provider: provider,
                isActive: data.isActive || false,
            }
        });
    }

    /**
     * Updates a user's password.
     *
     * @param id - The unique identifier of the user whose password is to be updated.
     * @param newPassword - The new password to set for the user.
     * @returns A promise that resolves to the updated User
     */
    async updatePassword(tx: Prisma.TransactionClient, id: string, password: string): Promise<User | null> {

        return tx.user.update({
            where: { id },
            data: {
                password,
            }
        });
    }

    /**
     * Maps a Prisma user to a `UserEntity`.
     *
     * @param user - The Prisma user to map.
     * @param includePassword - Whether to include the user's password in the response.
     * @returns A `UserEntity` with the mapped data.
     */
    private mapToEntity(
        user: Prisma.UserGetPayload<{ include: { roles: { select: { role: { select: { id: true, name: true, description: true } } } }, country: { select: { name: true, code: true, codeIso3: true } } } }>,
        includePassword: boolean = false
    ): UserEntity {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            password: includePassword ? user.password : undefined,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            profileImageUrl: user.profileImageUrl,
            provider: user.provider as AuthProviderEnum,
            providerId: user.providerId,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            isActive: user.isActive,
            timezone: user.timezone,
            locale: user.locale,
            metadata: typeof user.metadata === 'object' && user.metadata !== null ? (user.metadata as Record<string, any>) : {},
            bio: user.bio,
            dob: user.dob,
            gender: user.gender,
            tagline: user.tagline,
            website: user.website,
            countryCodeIso3: user.countryCodeIso3,
            roles: user.roles.map((role) => role.role),
            //country: user.country,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
