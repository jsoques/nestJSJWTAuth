import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'better-sqlite3',
    database: 'jwtauth.db',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
    logging: false,
};