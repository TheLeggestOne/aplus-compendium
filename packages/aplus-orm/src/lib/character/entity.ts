import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("characters")
export class CharacterEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 512 })
  name!: string;

  @Column({ type: "int", default: 1 })
  level!: number;
}
