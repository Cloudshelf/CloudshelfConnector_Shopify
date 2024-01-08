import { ShopifyAdminClient } from "../shopifyClient/ShopifyAdminClient";
import {
  DeleteWebhookDocument,
  DeleteWebhookMutation,
  DeleteWebhookMutationVariables,
  RegisterWebhookDocument,
  RegisterWebhookMutation,
  RegisterWebhookMutationVariables,
  WebhooksDocument,
  WebhooksQuery,
  WebhooksQueryVariables,
  WebhookSubscriptionFormat,
  WebhookSubscriptionInput,
  WebhookSubscriptionTopic,
} from "../../graphql/shopifyAdmin/generated/shopifyAdmin";
import { Container } from "../../container";

export class WebhookService {
  async getWebhooksForStore(storeDomain: string) {
    const shopifyAdminClient = new ShopifyAdminClient(storeDomain);
    const apollo = await shopifyAdminClient.apollo();
    if (!apollo) {
      return [];
    }

    const webhooks: Array<{
      __typename?: "WebhookSubscriptionEdge";
      node: {
        __typename?: "WebhookSubscription";
        id: string;
        topic: WebhookSubscriptionTopic;
      };
    }> = [];
    let resp = await apollo.query<WebhooksQuery, WebhooksQueryVariables>({
      query: WebhooksDocument,
    });
    if (!resp.data || resp.error || resp.errors) {
      return [];
    }

    webhooks.push(...resp.data.webhookSubscriptions.edges);
    while (resp.data.webhookSubscriptions.pageInfo.hasNextPage) {
      resp = await apollo.query<WebhooksQuery, WebhooksQueryVariables>({
        query: WebhooksDocument,
        variables: {
          after: resp.data.webhookSubscriptions.pageInfo.endCursor,
        },
      });
      if (!resp.data || resp.error || resp.errors) {
        break;
      }
      webhooks.push(...resp.data.webhookSubscriptions.edges);
    }

    return webhooks;
  }

  async deleteWebhookForStore(storeDomain: string, webhookId: string) {
    const shopifyAdminClient = new ShopifyAdminClient(storeDomain);
    const apollo = await shopifyAdminClient.apollo();
    if (!apollo) {
      return false;
    }

    const resp = await apollo.mutate<
      DeleteWebhookMutation,
      DeleteWebhookMutationVariables
    >({
      mutation: DeleteWebhookDocument,
      variables: {
        id: webhookId,
      },
    });
    if (!resp.data || resp.errors) {
      return false;
    }

    return true;
  }

  async deleteAllWebhooksForStore(storeDomain: string) {
    const webhooks = await this.getWebhooksForStore(storeDomain);
    for (const webhook of webhooks) {
      await this.deleteWebhookForStore(storeDomain, webhook.node.id);
    }
  }

  async registerWebhookForStore(
    storeDomain: string,
    topic: WebhookSubscriptionTopic,
    url: string,
  ) {
    const shopifyAdminClient = new ShopifyAdminClient(storeDomain);
    const apollo = await shopifyAdminClient.apollo();
    if (!apollo) {
      return false;
    }

    const subscription: WebhookSubscriptionInput = {
      callbackUrl: url,
      format: WebhookSubscriptionFormat.Json,
      includeFields: [],
      metafieldNamespaces: ["product_customizer", "product_customizer_x"],
    };

    const resp = await apollo.mutate<
      RegisterWebhookMutation,
      RegisterWebhookMutationVariables
    >({
      mutation: RegisterWebhookDocument,
      variables: {
        topic,
        subscription,
      },
    });

    if (!resp.data || resp.errors) {
      return false;
    }

    return true;
  }

  async registerAllWebhooksForStore(storeDomain: string) {
    const allWebhooks = await this.getWebhooksForStore(storeDomain);

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.BulkOperationsFinish,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.BulkOperationsFinish,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/bulkoperation/complete`,
      );
    }

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.AppUninstalled,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.AppUninstalled,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/shopify-store/uninstalled`,
      );
    }

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.ProductsUpdate,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.ProductsUpdate,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/shopify-store/product-update`,
      );
    }

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.ProductsDelete,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.ProductsDelete,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/shopify-store/product-delete`,
      );
    }

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.CollectionsUpdate,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.CollectionsUpdate,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/shopify-store/collection-update`,
      );
    }

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.CollectionsDelete,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.CollectionsDelete,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/shopify-store/collection-delete`,
      );
    }

    if (
      !allWebhooks.find(
        (w) => w.node.topic === WebhookSubscriptionTopic.AppSubscriptionsUpdate,
      )
    ) {
      await this.registerWebhookForStore(
        storeDomain,
        WebhookSubscriptionTopic.AppSubscriptionsUpdate,
        `https://${process.env.PUBLIC_HOSTNAME}/app/webhooks/shopify-store/app-subscriptions-update`,
      );
    }
  }

  async registerAllWebhooksForAllStores(
    from: number,
    limit: number,
  ): Promise<{
    success: string[];
    failed: string[];
  }> {
    const failed: string[] = [];
    const success: string[] = [];

    const stores = await Container.shopifyStoreService.getAllStores(
      from,
      limit,
    );
    for (const store of stores) {
      try {
        await this.registerAllWebhooksForStore(store.domain);
        success.push(store.domain);
      } catch (e) {
        failed.push(store.domain);
      }
    }

    return { success, failed };
  }

  async deleteAllWebhooksForAllStores(
    from: number,
    limit: number,
  ): Promise<{
    success: string[];
    failed: string[];
  }> {
    const failed: string[] = [];
    const success: string[] = [];
    const stores = await Container.shopifyStoreService.getAllStores(
      from,
      limit,
    );
    for (const store of stores) {
      try {
        await this.deleteAllWebhooksForStore(store.domain);
        success.push(store.domain);
      } catch (e) {
        failed.push(store.domain);
      }
    }

    return { success, failed };
  }
}
