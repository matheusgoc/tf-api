import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'collection_items' })
export class CollectionItem {
  @ObjectIdColumn({ name: '_id' })
  id: ObjectId;

  @Column()
  collectionId: ObjectId;

  @Column({ default: '' })
  descriptionPtBr: string;

  @Column({ default: '' })
  descriptionEnUs: string;

  @Column()
  imageKey: string;

  @Column()
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
