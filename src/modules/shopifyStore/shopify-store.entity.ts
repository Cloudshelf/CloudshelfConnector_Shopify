import { Entity, PrimaryKey, Property, types } from "@mikro-orm/core";

@Entity()
export class ShopifyStore {
  constructor() {
    this.storefrontToken = null;
    const now = new Date();
    now.setHours(now.getHours() - 12);
    this.lastSafetySync = now;
    this.lastProductSync = null;
    this.lastProductGroupSync = null;
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
  lastSafetySync: Date | null;

  @Property({ type: types.datetime, nullable: true })
  lastProductSync: Date | null;

  @Property({ type: types.datetime, nullable: true })
  lastProductGroupSync: Date | null;
}
