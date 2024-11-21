import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity as TBaseEntity,
  UpdateDateColumn,
} from 'typeorm';

export default abstract class BaseEntity extends TBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  updatedAt!: Date;
}
