import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class LoginDto {

    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}