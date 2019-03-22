import { Entity, PrimaryColumn, Column, BeforeInsert } from "typeorm";
import * as uuidv4 from "uuid/v4";
// uuidv4(); // ⇨ '10ba038e-48da-487b-96e8-8d3b99b6d18a'
@Entity()
export class User {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }
}
