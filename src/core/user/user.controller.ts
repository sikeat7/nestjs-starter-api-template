import { Body, Controller, Get, HttpCode, Param, Post, Put, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import CustomResponse from 'src/common/dto/custom-response.dto';
import { NotFoundAppException } from 'src/common/exceptions/not-found-error';
import { CreateUserDto } from './dto/create-user.dto';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AzureStorageService } from 'src/infrastructure/storage/azure/azure-storage.service';
import { BadRequestAppException } from 'src/common/exceptions/bad-request.exception';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AllowedRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/enums/roles.enum';

@Controller('users')
@UseGuards(AuthGuard) // for authentication
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly azureStorageService: AzureStorageService
    ) { }

    @Get('me')
    async getCurrentUser(@Request() req): Promise<CustomResponse<UserResponseDto | null>> {

        const user = await this.userService.findById(req.user.currentUserId);

        if (!user) {
            throw new NotFoundAppException('User not found', 'USER_NOT_FOUND');
        }

        return new CustomResponse<UserResponseDto | null>('User fetched successfully', user, 200);
    }

    @Get(':email')
    @UseGuards(RolesGuard)
    @AllowedRoles(Roles.Administrator, Roles.Teacher) // for authorization. Role based authorization
    async getUserByEmail(@Param('email') email: string): Promise<CustomResponse<UserResponseDto | null>> {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundAppException('User not found', 'USER_NOT_FOUND');
        }

        return new CustomResponse<UserResponseDto | null>('User fetched successfully', user, 200);
    }


    // example with file upload feature
    @Post('/')
    @HttpCode(201)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'profilePicture', maxCount: 1 },
            { name: 'documents', maxCount: 5 },
        ]),
    )
    async createUser(
        @Body() model: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
        @UploadedFiles()
        files: {
            profilePicture?: Express.Multer.File[];
            documents?: Express.Multer.File[];
        },
    ) {
        //res.status(200); // to set conditional status code

        if (files) {
            if (files.profilePicture && files.profilePicture[0]) {
                const profilePicture = files.profilePicture[0];
                if (profilePicture) {
                    const uploadResponse = await this.azureStorageService.uploadBlob(profilePicture);
                    if (uploadResponse.status !== 201) {
                        throw new BadRequestAppException('Failed to upload profile picture', ['FILE_UPLOAD_ERROR']);
                    }
                    console.log('Path: ', uploadResponse.url);
                }
            }
        }

        return new CustomResponse('User created successfully', model, 201);
    }

    @Put('/')
    @HttpCode(200)
    async changePassword(@Body() model: UpdatePasswordDto, @Request() req) {
        await this.userService.updatePassword(req.user.currentUserId, model.newPassword, model.currentPassword);
        return new CustomResponse('Password updated successfully', model, 200);
    }
}
