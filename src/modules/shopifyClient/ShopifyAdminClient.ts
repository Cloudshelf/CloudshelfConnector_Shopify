import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { Container } from "../../container";

export class ShopifyAdminClient {
  private readonly domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }

  async apollo(forcedStore?: { domain: string; accessToken: string }) {
    let domain = forcedStore?.domain || this.domain;
    let accessToken = forcedStore?.accessToken || null;

    if (!forcedStore) {
      const store = await Container.shopifyStoreService.findStoreByDomain(
        this.domain,
      );
      if (!store) {
        return null;
      }
      accessToken = store.accessToken;
    }

    if (!accessToken) {
      return null;
    }

    return new ApolloClient({
      uri: `https://${domain}/admin/api/${process.env
        .SHOPIFY_API_VERSION!}/graphql.json`,
      cache: new InMemoryCache(),
      // Header
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });
  }
}
