import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedAppException } from "src/common/exceptions/unauthorized-error";
import { UserService } from "src/core/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorizationToken = request.headers['authorization'];
        if (!authorizationToken) {
            throw new UnauthorizedAppException('Missing or invalid token', 'MISSING_OR_INVALID_TOKEN');
        }

        const token = authorizationToken.split(' ')[1];

        try {
            const tokenPayload = await this.jwtService.verifyAsync(token);
            request.user = {
                jwtToken: token,
                currentUserId: tokenPayload.id,
                currentUserEmail: tokenPayload.email,
                currentUserName: tokenPayload.username,
                currentUserRoles: tokenPayload.roles,
            }
        }
        catch (error) {
            throw new UnauthorizedAppException('Invalid or expired token', 'INVALID_OR_EXPIRED_TOKEN');
        }

        const userSession = await this.userService.getUserSessionByToken(request.user.currentUserId, request.user.jwtToken);
        if (!userSession) {
            throw new UnauthorizedAppException('Invalid or expired token', 'INVALID_OR_EXPIRED_TOKEN');
        }

        const user = await this.userService.findById(request.user.currentUserId);
        if (!user || !user.isActive) {
            throw new UnauthorizedAppException('Invalid user', 'INVALID_USER');
        }

        return true;
    }
}
