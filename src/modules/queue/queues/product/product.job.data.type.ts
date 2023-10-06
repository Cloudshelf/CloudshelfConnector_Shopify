import { BaseJobData } from "../base.job.data";

export interface ProductTriggerJobData extends BaseJobData {
  productIds: string[];
}

export interface ProductJobData extends ProductTriggerJobData {
  remoteBulkOperationId: string;
}
