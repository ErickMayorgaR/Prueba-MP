import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('AuditLog')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  user_id?: number;

  @ManyToOne(() => User, (user) => user.audit_logs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'nvarchar', length: 100 })
  action!: string;

  @Column({ type: 'nvarchar', length: 100 })
  entity_type!: string;

  @Column({ type: 'int', nullable: true })
  entity_id?: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  details?: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  ip_address?: string;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;
}
