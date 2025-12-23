import { AuthProviderEnum } from "src/common/enums/auth-provider.enum";
import { RoleEntity } from "./role-entity";

export interface UserEntity {
    id: string;
    email?: string | null;
    username?: string | null;
    password?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    profileImageUrl?: string | null;
    provider?: AuthProviderEnum;
    providerId?: string | null;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isActive?: boolean;
    timezone?: string | null;
    locale?: string | null;
    metadata?: Record<string, any> | null;
    bio?: string | null;
    dob?: Date | null;
    gender?: string | null;
    tagline?: string | null;
    website?: string | null;
    countryCodeIso3?: string | null;
    //country?: Partial<CountryDTO> | null;
    roles?: RoleEntity[] | null;
    createdAt: Date;
    updatedAt?: Date | null;
}
