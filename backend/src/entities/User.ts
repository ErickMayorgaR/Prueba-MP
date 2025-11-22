import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Expediente } from './Expediente';
import { Indicio } from './Indicio';
import { AuditLog } from './AuditLog';

export enum UserRole {
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  COORDINADOR = 'COORDINADOR',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'nvarchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'nvarchar', length: 255 })
  password_hash!: string;

  @Column({
    type: 'nvarchar',
    length: 50,
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ type: 'nvarchar', length: 255 })
  full_name!: string;

  @Column({ type: 'bit', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at!: Date;

  @OneToMany(() => Expediente, (expediente) => expediente.technician)
  expedientes_as_technician?: Expediente[];

  @OneToMany(() => Expediente, (expediente) => expediente.coordinator)
  expedientes_as_coordinator?: Expediente[];

  @OneToMany(() => Indicio, (indicio) => indicio.technician)
  indicios?: Indicio[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  audit_logs?: AuditLog[];
}
