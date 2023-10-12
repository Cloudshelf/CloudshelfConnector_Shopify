import { WebClient } from "@slack/web-api";
import { isProduction } from "../../utils/isProduction";

export class SlackService {
  private readonly slackClient: WebClient;

  constructor() {
    this.slackClient = new WebClient(process.env.SLACK_TOKEN);
  }

  async test() {
    this.sendInstallNotification("something.com");
    this.sendUninstallNotification("something.com");
    this.sendStoreRedactNotification("something.com");
  }
  //test
  async sendInstallNotification(domain: string) {
    if (isProduction()) {
      await this.slackClient.chat.postMessage({
        channel: process.env.SLACK_CHANNEL ?? "",
        text: "<!subteam^S02QBD8KNUQ|Sales>",
        username: "Shopify Connector - Cloudshelf Notifier",
        attachments: [
          {
            color: "#1A9C27",
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "Retailer Installed Cloudshelf",
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Domain:*
${domain}`,
                },
              },
            ],
          },
        ],
      });
    }
  }

  async sendUninstallNotification(domain: string) {
    if (isProduction()) {
      await this.slackClient.chat.postMessage({
        channel: process.env.SLACK_CHANNEL ?? "",
        text: "<!subteam^S02QBD8KNUQ|Sales>",
        username: "Shopify Connector - Cloudshelf Notifier",
        attachments: [
          {
            color: "#FF0000",
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "Retailer Uninstalled Cloudshelf",
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Domain:* 
${domain}
                  
*Note:* 
The store has been removed from the Cloudshelf Connector. Store data will not be removed from Cloudshelf until Shopify requests us to do so; this allows retailers to reinstall without losing their data.`,
                },
              },
            ],
          },
        ],
      });
    }
  }

  async sendStoreRedactNotification(domain: string) {
    if (isProduction()) {
      await this.slackClient.chat.postMessage({
        channel: process.env.SLACK_CHANNEL ?? "",
        text: " ",
        username: "Shopify Connector - Cloudshelf Notifier",
        attachments: [
          {
            color: "#FFB700",
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "Store Redact Requested",
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Domain:* 
${domain}
                  
*Note:*
Store data will shortly be removed from Cloudshelf.`,
                },
              },
            ],
          },
        ],
      });
    }
  }
  //
}
