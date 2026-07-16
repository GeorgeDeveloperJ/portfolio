import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Project {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column("text")
    description!: string;

    @Column("simple-array")
    techStack!: string[];

    @Column({ nullable: true })
    liveUrl?: string;

    @Column({ nullable: true })
    repoUrl?: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ default: false })
    featured!: boolean;

    @Column({ default: 0 })
    order!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
