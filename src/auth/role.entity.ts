import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";

@Entity()
@Unique(['rolename', 'roletype'])
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    rolename: string;

    @Column({ type: 'varchar', length: 50 })
    roletype: RoleType;

    @OneToMany(type => User, user => user.id)
    users: User[];

}

export enum RoleType {
    SUPERUSER = 'SUPERUSER',
    ADMIN = 'ADMINISTRATOR',
    USER = 'USER',
}