import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'collections' })
export class Collection {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectId;

  @Column()
  titlePtBr: string;

  @Column()
  titleEnUs: string;

  @Column()
  subtitlePtBr: string;

  @Column()
  subtitleEnUs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp' })
  publishedAt?: Date;
}
