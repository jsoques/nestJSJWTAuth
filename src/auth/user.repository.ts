import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm"
import { AuthCredentialsDto } from "./dto/auth.credentials.dto"
import { User, UserStatus } from "./user.entity"
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Role, RoleType } from "./role.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {


    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { password, email } = authCredentialsDto;

        const user = new User();

        const roleid = Object.keys(RoleType).indexOf('USER');

        user.email = email;
        user.status = UserStatus.DISABLED;
        user.role = null;
        user.createdate = new Date().toISOString();
        user.password = (await this.hashPassword(password));
        user.activatekey = uuidv4().replace(/-/g, '');


        try {
            await user.save();
        } catch (error) {
            // console.log('error', error);
            const errMsg = String(error);
            if (Number(error.code) === 23505 || errMsg.toLowerCase().includes('unique')) {
                throw new ConflictException('User email already in exists');
            } else {
                throw new InternalServerErrorException(errMsg);
            }
        }
        return user;
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { email, password } = authCredentialsDto;
        const user = await this.findOne({ email }, { loadRelationIds: true });

        console.log('user', user);

        if (user && await user.validatePassword(password)) {
            return user;
        } else {
            return null;
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}