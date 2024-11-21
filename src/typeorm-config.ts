import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const DATASOURCE_OPTIONS: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'wristcheck',
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

const dataSource = new DataSource({
  ...DATASOURCE_OPTIONS,
  entities: ['dist/entities/*.js'],
  migrations: ['dist/migrations/*.js'],
});

export default dataSource;
