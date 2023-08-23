import { injectable } from "tsyringe";
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";

@injectable()
export class CloudshelfClient {
  private readonly client: ApolloClient<NormalizedCacheObject>;
  constructor() {
    this.client = new ApolloClient({
      uri: "https://development.api.cloudshelf.ai/graphql",
      cache: new InMemoryCache(),
      // Header
      headers: {},
    });
  }

  public getClient() {
    return this.client;
  }
}
