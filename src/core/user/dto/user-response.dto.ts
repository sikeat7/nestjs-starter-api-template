import { Expose, Exclude } from 'class-transformer';
import { RoleResponseDto } from './role-response.dto';

export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    email: string | null;

    @Expose()
    username: string | null;

    @Exclude()
    password?: string | null;

    @Expose()
    firstName: string | null;

    @Expose()
    lastName: string | null;

    @Expose()
    displayName: string | null;

    @Expose()
    phoneNumber: string | null;

    @Expose()
    profileImageUrl: string | null;

    @Expose()
    provider: string;

    @Expose()
    providerId: string | null;

    @Expose()
    isEmailVerified: boolean;

    @Expose()
    isPhoneVerified: boolean;

    @Expose()
    isActive: boolean;

    @Expose()
    dob: Date | null;

    @Expose()
    gender: string | null;

    @Expose()
    bio: string | null;

    @Expose()
    tagline: string | null;

    @Expose()
    website: string | null;

    @Expose()
    countryCodeIso3: string | null;

    @Expose()
    timezone: string | null;

    @Expose()
    locale: string | null;

    @Expose()
    metadata: any;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date | null;

    @Expose()
    roles?: RoleResponseDto[] | null;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}