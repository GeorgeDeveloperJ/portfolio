import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Certification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    issuer!: string;

    @Column({ type: "date" })
    issueDate!: string;

    @Column({ type: "date", nullable: true })
    expiryDate?: string;

    @Column({ nullable: true })
    credentialUrl?: string;

    @Column({ nullable: true })
    badgeUrl?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
