import { Get } from '@nestjs/common';
import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';
import { AuthRolesDto } from './dto/auth.roles.dto';
import { Role, RoleType } from './role.entity';

@Controller('api/users')
export class AuthController {

    roles: Role[];
    
    constructor(
        private authService: AuthService,
    ) {
        this.getRoles();
    }

    async getRoles() {
        this.roles = await this.authService.getRoles();
        if(this.roles.length == 0) {
            console.log('Creating roles...');
            for(let role in RoleType) {
                let roleDto = new AuthRolesDto();
                roleDto.role = RoleType[role];
                await this.authService.createRole(roleDto);
            };
            console.log('Ready');
        }
    }

    @Post('/signup')
    signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authCredentialsDto);
    }

    @Post('/signin')
    @HttpCode(200)
    signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        return this.authService.signIn(authCredentialsDto);
    }

    @Post('/login')
    @HttpCode(200)
    logIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        return this.authService.signIn(authCredentialsDto);
    }

    @Get('/activate')
    @HttpCode(200)
    async activate(@Req() req): Promise<string> {
        console.log('Query');
        console.log(req.query);
        const { id } = req.query; //activatekey
        const htmlstring = `<html><head><title>Account Activated</title></head><body><h1>Your account was activated</h1></body></html>`
        const result = await this.authService.activateUser(id);
        if(result == 'ENABLED') {
            return htmlstring;
        } else {
            return result;
        }
    }

    @Post('/deactivate')
    @HttpCode(200)
    deactivate(@Req() req): Promise<string> {
        console.log('Query');
        console.log(req.query);
        const { id } = req.query;
        return this.authService.deactivateUser(id);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@Req() req) {
        console.log(req);
        return req.user;
    }

    @Post('/createRole')
    createRole(@Body(ValidationPipe) roleDto: AuthRolesDto): Promise<void> {
        return this.authService.createRole(roleDto);
    }
}
