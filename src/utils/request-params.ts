import { Request } from "express";

export const getShopDomainFromRequest = (req: Request) => {
  const params = req.query;
  const shopDomain = (params["shop"] ?? "") as string;
  if (!shopDomain) {
    throw new Error("No shop in fetch, this should never happen!");
  }
  return shopDomain;
};

export const getShopIdFromRequest = (req: Request) => {
  const shopDomain = getShopDomainFromRequest(req);
  const shopId = shopDomain.replace(".myshopify.com", "");

  return shopId;
};
