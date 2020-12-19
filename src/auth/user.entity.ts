import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Role } from "./role.entity";

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column()
    // username: string;

    @Column({ type: 'varchar', length: 200, nullable: false  })
    email: string;

    @Column({ type: 'varchar', length: 1024, nullable: false  })
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: false  })
    status: UserStatus;

    // @Column({ type: 'char' })
    // isadmin: string;

    //@Column({ nullable: true })
    @ManyToOne(type => Role, role => role.users)
    role: Role;

    @Column({ type: 'varchar', length: 40 })
    createdate: string;

    @Column({ unique: true, type: 'varchar', length: 40 })
    activatekey: string;

    async validatePassword(password: string): Promise<boolean> {
        // const hash = await bcrypt.hash(password, this.salt);
        // console.log(hash);
        // console.log(this.password);
        // console.log(this.password.includes(hash));
        // return this.password.includes(hash);
        const result = await bcrypt.compare(password, this.password);
        console.log(result);
        return result;
    }
}

export enum UserStatus {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
}