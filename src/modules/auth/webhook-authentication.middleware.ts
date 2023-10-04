import { ExpressMiddlewareInterface } from "routing-controllers";
import { Container } from "../../container";
import express, { Request, Response, NextFunction, Express } from "express";
export class WebhookAuthenticationMiddleware
  implements ExpressMiddlewareInterface
{
  async use(
    request: Request,
    response: Response,
    next?: NextFunction,
  ): Promise<any> {
    const valid =
      await Container.shopifyService.shopifyApp.api.webhooks.validate({
        rawBody: request.body, // is a string
        rawRequest: request,
        rawResponse: response,
      });

    if (!valid) {
      console.error("Invalid webhook call, not handling it");
      response.send(400); // Bad Request
    }

    next?.();
  }
}
