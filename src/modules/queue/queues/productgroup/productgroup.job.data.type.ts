import { BaseJobData } from "../base.job.data";

export interface ProductGroupTriggerJobData extends BaseJobData {
  groupIds: string[];
}

export interface ProductGroupJobData extends ProductGroupTriggerJobData {
  remoteBulkOperationId: string;
}
