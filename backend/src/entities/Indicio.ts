import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Expediente } from './Expediente';
import { User } from './User';

@Entity('Indicios')
export class Indicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  expediente_id!: number;

  @ManyToOne(() => Expediente, (expediente) => expediente.indicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'expediente_id' })
  expediente?: Expediente;

  @Column({ type: 'nvarchar', length: 50 })
  code!: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  description!: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  color?: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  size?: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  weight?: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'int' })
  technician_id!: number;

  @ManyToOne(() => User, (user) => user.indicios, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'technician_id' })
  technician?: User;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  observations?: string;

  @CreateDateColumn({ type: 'datetime2' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updated_at!: Date;
}
