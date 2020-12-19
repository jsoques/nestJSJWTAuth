import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';
import { AuthRolesDto } from './dto/auth.roles.dto';
import { JwtPayload } from './jwt-payload.interface';
import { Logins } from './logins.entity';
import { Role, RoleType } from './role.entity';
import { RoleRepository } from './role.repository';
import { UserStatus } from './user.entity';
import { UserRepository } from './user.repository';

import * as childProcess from 'child_process';
import { openSync, realpathSync } from 'fs';
import e = require('express');

import { config } from 'dotenv';

config();


const curdir = realpathSync('.');

console.log('curdir', curdir);

const today = new Date();
const out = openSync(`./logs/sendmail_${today.toISOString().split('T')[0]}_out.log`, 'a');
const err = openSync(`./logs/sendmail_${today.toISOString().split('T')[0]}_err.log`, 'a');

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(RoleRepository)
        private roleRepository: RoleRepository,
        private jwtService: JwtService,
    ) { }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const usercount = await this.userRepository.count();
        const newUser = await this.userRepository.signUp(authCredentialsDto);
        //Send email to user to activate account
        let role: Role;
        if (usercount < 1) {
            if (newUser) {
                role = await this.roleRepository.findOne({ rolename: RoleType.SUPERUSER });
                newUser.role = role;
                newUser.status = UserStatus.ENABLED;
                await newUser.save();
                console.log('SuperUser created', newUser);
            }
        } else {
            role = await this.roleRepository.findOne({ rolename: RoleType.USER });
            newUser.role = role;
            await newUser.save();
            const apikey = 'xxxxxxxxxxxxxx'; //This is if using PostMark version of javamail program
            const fromEmail = 'user@test.com'; //Change this for PostMark
            const toEmail = newUser.email;
            const subject = 'Activate your new JWTAuth account';
            const body = `Please activate your account at JWTAuth by clicking this link <a href='${process.env.ACTIVATIONURL}?id=${newUser.activatekey}'>activate account</a>`;
            let sentMailPID = await this.sendMail(apikey, fromEmail, toEmail, subject, body);
            console.log('sentMailPID', sentMailPID);
        }
       
        return;
    }

    async sendMail(apiKey: string, frommail: string, tomail: string, subject: string, body: string, attachment?: string, replyTo?: string) {
        const javaSendMail = `java -jar ${process.env.JAVAMAIL}`;

        //let command = javaSendMail + ` ${apiKey.trim()} ${frommail.trim()} ${tomail.trim()} "${subject.trim()}" "${body.trim()}"`;
        //This version uses gmail for testing
        let command = javaSendMail + ` ${tomail.trim()} "${subject.trim()}" "${body.trim()}"`;
        if (attachment) {
            command += ` ${attachment}`;
        }
        if (replyTo) {
            command += ` ${replyTo}`;
        }

        console.log('Java Email command:\n', command);

        const proc = childProcess.spawn(`${command}`, {
            shell: true,
            detached: true,
            windowsHide: true,
            stdio: ['ignore', out, err], // piping stdout and stderr to out.log
        });

        // console.log('processALL command ', proc.spawnargs.join(' '));
        console.log('PID', proc.pid);

        proc.unref();

        return proc.pid;
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const user = await this.userRepository.validateUserPassword(authCredentialsDto);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        delete user.password;

        console.log('user.email:', user.email);

        let role: Role;
        if (user.role != undefined) {
            role = await this.roleRepository.findOne(user.role);
        }


        const payload: JwtPayload = {
            email: authCredentialsDto.email,
            status: user.status,
            role: role.rolename,
        };

        const accessToken = this.jwtService.sign(payload);

        const vpayload = this.jwtService.verify(accessToken);
        console.log(this.jwtService.verify(accessToken));
        console.log('Issued on', new Date(vpayload.iat * 1000).toLocaleString());
        console.log('Expires at', new Date(vpayload.exp * 1000).toLocaleString());

        try {
            let login = await Logins.findOne({ user });

            if (!login) {
                login = new Logins();
                login.logindate = new Date().toISOString();
                login.user = user;
                login.token = accessToken;
            } else {
                login.logindate = new Date().toISOString();
                login.user = user;
                login.token = accessToken;
            }
            await login.save();
            console.log('login');
            console.log(login);
        } catch (error) {
            console.log('*****ERROR*****\n', error);
        }

        return { accessToken };
    }

    async activateUser(key: string) {
        let rv = '';
        let user = await this.userRepository.findOne({ activatekey: key });
        if (user) {
            user.status = UserStatus.ENABLED;
            user.save();
            rv = UserStatus.ENABLED;
        } else {
            rv = 'NOT FOUND';
        }
        return rv;
    }

    async deactivateUser(key: string) {
        let rv = '';
        let user = await this.userRepository.findOne({ activatekey: key });
        if (user) {
            user.status = UserStatus.DISABLED;
            user.save();
            rv = UserStatus.DISABLED;
        } else {
            rv = 'NOT FOUND';
        }
        return rv;
    }

    async createRole(roleDto: AuthRolesDto): Promise<void> {
        return this.roleRepository.createRole(roleDto);
    }

    async getRoles(): Promise<any> {
        return await this.roleRepository.find();
    }
}
