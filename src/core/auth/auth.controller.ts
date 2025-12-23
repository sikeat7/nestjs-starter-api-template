import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ClientInfo, type ClientInfoDetails } from "src/common/decorators/client-info.decorator";
import CustomResponse from "src/common/dto/custom-response.dto";
import type { Response } from 'express';
import { AuthGuard } from "./guards/auth.guard";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginResponseDto } from "./dto/login.response.dto";
import { UserResponseDto } from "../user/dto/user-response.dto";


@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    async login(@Body() model: LoginDto, @ClientInfo() clientInfo: ClientInfoDetails, @Res({ passthrough: true }) res: Response) {
        const response = await this.authService.authenticate(model, clientInfo.ip, clientInfo.userAgent);
        res.status(200);
        return new CustomResponse<LoginResponseDto>('Login successful', response, 200);
    }

    @Post('/register')
    @HttpCode(201)
    async register(@Body() model: CreateUserDto) {
        const user = await this.authService.register(model, model.role);
        return new CustomResponse<UserResponseDto>('User created successfully', user, 201);
    }

    @UseGuards(AuthGuard)
    @Post('/logout')
    @HttpCode(200)
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.currentUserId, req.user.jwtToken);
        return new CustomResponse('User logged out successfully');
    }
}