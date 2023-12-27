import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { Container } from "../../container";

export class ShopifyStorefrontClient {
  private readonly domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }

  async apollo() {
    const store = await Container.shopifyStoreService.findStoreByDomain(
      this.domain,
    );
    if (!store || !store.storefrontToken) {
      return null;
    }
    return new ApolloClient({
      uri: `https://${this.domain}/api/${process.env
        .SHOPIFY_API_VERSION!}/graphql.json`,
      cache: new InMemoryCache(),
      // Header
      headers: {
        "X-Shopify-Storefront-Access-Token": store.storefrontToken,
      },
      defaultOptions: {
        query: {
          errorPolicy: "all",
        },
        mutate: {
          errorPolicy: "all",
        },
      },
    });
  }
}
