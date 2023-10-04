import { Job } from "bullmq";
import { Container } from "../../../../container";
import { LocationInput } from "../../../../graphql/cloudshelf/generated/cloudshelf";
import { convertCountryCode } from "../../../../utils/countryCodeConverter";
import { gidConverter } from "../../../../utils/gidConverter";

export const locationQueueProcessor = async (job: Job): Promise<void> => {
  const shopifyLocationData = await Container.shopifyStoreService.getLocations(
    job.data.domain,
  );

  const locationInputs: LocationInput[] = [];

  if (!shopifyLocationData || shopifyLocationData.length === 0) {
    await job.log(
      "Shopify did not return any location data, we can end the job here.",
    );
    return;
  }

  for (const shopifyLocation of shopifyLocationData) {
    const csLocation: LocationInput = {
      id: gidConverter(shopifyLocation.id, "ShopifyLocation"),
      displayName: shopifyLocation.name,
      address: shopifyLocation.address.formatted.join(", "),
      countryCode: convertCountryCode(shopifyLocation.address.countryCode),
    };

    locationInputs.push(csLocation);
  }

  await job.log(
    "Creating location in Cloudshelf with data: " +
      JSON.stringify(locationInputs),
  );

  await Container.shopifyStoreService.upsertLocationsToCloudshelf(
    job.data.domain,
    locationInputs,
  );
};
