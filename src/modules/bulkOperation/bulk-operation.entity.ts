import { Entity, Enum, PrimaryKey, Property, types } from "@mikro-orm/core";
import { BulkOperationType } from "./bulk-operation.type";

@Entity()
export class BulkOperation {
  constructor() {
    this.dataUrl = null;
    this.startedAt = null;
    this.endedAt = null;
  }

  @PrimaryKey({ type: "uuid", defaultRaw: "uuid_generate_v4()" })
  id!: string;

  @Property({ type: types.datetime, defaultRaw: "NOW()" })
  createdAt!: Date;

  @Property({
    type: types.datetime,
    defaultRaw: "NOW()",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @Property({ type: "text" })
  domain!: string;

  @Property({ type: "text", unique: true })
  shopifyBulkOpId!: string;

  @Property({ type: "text", nullable: true })
  dataUrl: string | null;

  @Property({ type: types.datetime, nullable: true })
  startedAt: Date | null;

  @Property({ type: types.datetime, nullable: true })
  endedAt: Date | null;

  @Property({ type: "text", default: "" })
  status!: string;

  @Enum({ items: () => BulkOperationType })
  type!: BulkOperationType;

  @Property({ type: types.array, default: [] })
  explicitIds!: string[];
}
