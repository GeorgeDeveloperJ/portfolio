import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Skill {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    category!: string; // e.g. "Frontend", "Backend", "DevOps", "Other"

    @Column()
    level!: string; // e.g. "Expert", "Intermediate", "Learning"

    @Column({ nullable: true })
    iconUrl?: string;

    @Column({ default: 0 })
    order!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
