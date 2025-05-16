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

export enum USER_PROFILE_LANGUAGE {
  EN_US = 'en-US',
  PT_BR = 'pt-BR',
}

export enum USER_PROFILE_REGION {
  BR = 'br',
  US = 'us',
}

class Profile {
  @Column()
  language: USER_PROFILE_LANGUAGE;

  @Column()
  region: USER_PROFILE_REGION;
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

  @Column(() => Profile)
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp' })
  deactivatedAt?: Date;

  @Column({ type: 'timestamp' })
  enrolledAt?: Date;
}
