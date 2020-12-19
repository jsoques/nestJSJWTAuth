import { IsIn, IsString } from "class-validator";
import { RoleType } from "../role.entity";

const arrayRoles = Object.keys(RoleType).map((item) => {
    return item;
});

export class AuthRolesDto {

    @IsString()
    @IsIn(arrayRoles)
    role: RoleType;
}