import { BaseJobData } from "../base.job.data";

export interface ProductGroupTriggerJobData extends BaseJobData {
  groupIds: string[];
  isFirstSync: boolean;
}

export interface ProductGroupJobData extends ProductGroupTriggerJobData {
  remoteBulkOperationId: string;
}
