import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Indicio } from './Indicio';

export enum ExpedienteStatus {
  EN_REGISTRO = 'EN_REGISTRO',
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('Expedientes')
export class Expediente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  case_number!: string;

  @Column({ type: 'nvarchar', length: 255 })
  title!: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description?: string;

  @Column({
    type: 'nvarchar',
    length: 50,
    enum: ExpedienteStatus,
    default: ExpedienteStatus.EN_REGISTRO,
  })
  status!: ExpedienteStatus;

  @Column({ type: 'int' })
  technician_id!: number;

  @ManyToOne(() => User, (user) => user.expedientes_as_technician, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'technician_id' })
  technician?: User;

  @Column({ type: 'int', nullable: true })
  coordinator_id?: number;

  @ManyToOne(() => User, (user) => user.expedientes_as_coordinator, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator?: User;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  rejection_reason?: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'datetime2', nullable: true })
  incident_date?: Date;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at!: Date;

  @Column({ type: 'datetime2', nullable: true })
  submitted_at?: Date;

  @Column({ type: 'datetime2', nullable: true })
  reviewed_at?: Date;

  @Column({ type: 'datetime2', nullable: true })
  approved_at?: Date;

  @OneToMany(() => Indicio, (indicio) => indicio.expediente, {
    cascade: true,
  })
  indicios?: Indicio[];
}
