import { Entity, PrimaryKey, Property, types } from "@mikro-orm/core";

@Entity()
export class ShopifyStore {
  constructor() {
    this.storefrontToken = null;
    this.lastSyncedAt = null;
  }

  @PrimaryKey({ type: "uuid", defaultRaw: "uuid_generate_v4()" })
  id!: string;

  @Property({ type: "text", unique: true })
  domain!: string;

  @Property({ type: "text" })
  accessToken!: string;

  @Property({ type: "text", nullable: true })
  storefrontToken: string | null;

  @Property({ type: types.array, default: [] })
  scopes!: string[];

  @Property({ type: types.datetime, nullable: true })
  lastSyncedAt: Date | null;
}
