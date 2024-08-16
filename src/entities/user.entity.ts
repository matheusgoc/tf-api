import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum USER_ROLE {
  SELLER = 'seller',
  ADMIN = 'admin',
  MASTER = 'master',
}

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectId;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password?: string; // bcrypt

  @Column()
  role: USER_ROLE;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp' })
  deactivatedAt?: Date;
}
