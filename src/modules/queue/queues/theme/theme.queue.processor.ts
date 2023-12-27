import { Job } from "bullmq";
import { Container } from "../../../../container";
import { ThemeJobData } from "./theme.job.data.type";
import { ThemeInput } from "../../../../graphql/cloudshelf/generated/cloudshelf";
import { gidConverter } from "../../../../utils/gidConverter";
import { createLocationJob } from "../location/location.job.functions";

export const themeQueueProcessor = async (
  job: Job<ThemeJobData>,
): Promise<void> => {
  const shopifyThemeData =
    await Container.shopifyStoreService.getThemeFromShopify(
      job.data.domain,
      job,
    );
  const themeInput: ThemeInput = {
    displayName: "Default Theme",
  };

  if (!shopifyThemeData) {
    await job.log(
      "Shopify did not return any theme data, as Cloudshelf requires a theme to be present, we will create a default theme.",
    );
  }

  if (shopifyThemeData?.id) {
    themeInput.id = gidConverter(shopifyThemeData.id, "ShopifyShopBrand");
  }

  if (shopifyThemeData?.brand?.logo?.image?.url) {
    themeInput.logoUrl = shopifyThemeData?.brand?.logo.image.url;
  }

  if (
    (shopifyThemeData?.brand?.colors?.primary ?? []).length > 0 &&
    shopifyThemeData?.brand?.colors.primary[0].foreground
  ) {
    themeInput.primaryColor =
      shopifyThemeData?.brand.colors.primary[0].foreground;
  }

  await job.log(
    "Creating theme in Cloudshelf with data: " + JSON.stringify(themeInput),
  );

  await Container.shopifyStoreService.upsertThemeToCloudshelf(
    job.data.domain,
    themeInput,
  );

  await job.log("Theme created in Cloudshelf");

  if (job.data.installStyleSync) {
    //If this job came from an install, we need to queue the next one which is locations
    await createLocationJob(job.data.domain, job.data.installStyleSync);
  }
};
