import * as crypto from "crypto";

export class AuthService {
  validateHmac(queryParams: { [key: string]: string }, hmac: string) {
    const secret = process.env.SHOPIFY_API_SECRET_KEY ?? "";
    const sortedKeys = Object.keys(queryParams).sort();
    const sortedSearchQueries = [];
    for (const key of sortedKeys) {
      if (key.toLowerCase() === "hmac") {
        continue;
      }
      sortedSearchQueries.push(`${key}=${queryParams[key]}`);
    }
    const ordered = sortedSearchQueries.join("&");

    // Calculate hmac256
    const hash = crypto
      .createHmac("sha256", secret)
      .update(ordered)
      .digest("hex");
    return hmac === hash;
  }
}
