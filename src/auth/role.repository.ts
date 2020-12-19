import { BadRequestException, ConflictException, InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { AuthRolesDto } from "./dto/auth.roles.dto";
import { Role, RoleType } from "./role.entity";

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {

    async createRole(roleDto: AuthRolesDto): Promise<void> {

        const { role } = roleDto;

        const newRole = new Role();

        for (var entry in RoleType) {
            if (RoleType[entry] == role) {
                newRole.roletype = RoleType[entry];
                newRole.rolename = entry;
                break;
            }
        }

        try {
            await newRole.save();
        } catch (error) {
            const errMsg = String(error);
            if (Number(error.code) === 23505 || errMsg.toLowerCase().includes('unique')) {
                throw new ConflictException('Role already in exists');
            } else {
                throw new InternalServerErrorException(errMsg);
            }
        }
    }
}