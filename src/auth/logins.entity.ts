import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";

@Entity()
@Unique(['token'])
export class Logins extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => User, { eager: false })
    @JoinColumn()
    user: User;

    @Column({ type: 'varchar', length: 40 })
    logindate: string;

    @Column({ type: 'varchar', length: 2048 })
    token: string;

}