import { CountryCode } from "../graphql/cloudshelf/generated/cloudshelf";

export const convertCountryCode = (
  countryCode: string | null | undefined,
): CountryCode => {
  //As far as I know, they use the same codes as us... but just in case, ive wrapped this in a util function
  if (!countryCode) {
    return CountryCode.Zz;
  }

  return countryCode as CountryCode;
};
