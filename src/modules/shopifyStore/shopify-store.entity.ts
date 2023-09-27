import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class ShopifyStore {
  @PrimaryKey({ type: "uuid", defaultRaw: "uuid_generate_v4()" })
  id!: string;

  @Property({ type: "text", unique: true })
  domain!: string;

  @Property({ type: "text" })
  accessToken!: string;

  @Property({ type: "text" })
  storefrontToken!: string;
}
