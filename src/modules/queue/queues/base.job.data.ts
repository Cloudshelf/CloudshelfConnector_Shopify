export interface BaseJobData {
  //Domain is always required as we need it to get data from shopify
  domain: string;
  installStyleSync?: boolean;
  //lockId is optional, and is used if we want to lock all jobs with the same lockId; we use this for one-per-store processing
  lockId?: string;
  reason?: string;
}
