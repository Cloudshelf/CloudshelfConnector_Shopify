import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { createHmac } from "../../utils/hmac";

export class CloudshelfClientFactory {
  public static getClient(domain?: string) {
    const timestamp = new Date().getTime().toString();
    const hmac = domain ? createHmac(domain, timestamp) : "";

    const httpLink = createHttpLink({
      uri: process.env.CLOUDSHELF_API_URL!,
      headers: {
        ...(domain
          ? { "x-store-domain": domain, "x-hmac": hmac, "x-nonce": timestamp }
          : {}),
      },
    });
    //
    // const authLink = new ApolloLink((operation, forward) => {
    //   const timestamp = new Date().getTime().toString();
    //   const hmac = domain ? createHmac(domain, timestamp) : "";
    //
    //   operation.setContext(({ headers = {} }) => ({
    //     headers: {
    //       ...headers,
    //       ...(domain
    //         ? { "x-store-domain": domain, "x-hmac": hmac, "x-nonce": timestamp }
    //         : {}),
    //     },
    //   }));
    //
    //   return forward(operation);
    // });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([httpLink]), //authLink
    });
  }
}
