import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  DeweyDecimal: { input: any; output: any; }
  GlobalId: { input: any; output: any; }
  Latitude: { input: any; output: any; }
  Longitude: { input: any; output: any; }
};

/** How to align the entity in the parent's space. */
export enum Alignment {
  /** Align the entity to the center of the parent. */
  Center = 'CENTER',
  /** Align the entity to the left of the parent. */
  Left = 'LEFT',
  /** Align the entity to the right of the parent. */
  Right = 'RIGHT'
}

/** How to animate the entity. */
export enum Animation {
  /** Fade the entity. */
  Fade = 'FADE',
  /** Flip the entity. */
  Flip = 'FLIP'
}

export type AttributeValue = {
  __typename?: 'AttributeValue';
  categoryIds: Array<Scalars['String']['output']>;
  parentFilterId?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Float']['output'];
  value: Scalars['String']['output'];
};

export type AttributeValueInput = {
  categoryIds: Array<Scalars['String']['input']>;
  parentFilterId?: InputMaybe<Scalars['String']['input']>;
  priority?: Scalars['Float']['input'];
  value: Scalars['String']['input'];
};

export type AttributeValueOverride = {
  __typename?: 'AttributeValueOverride';
  displayValue: Scalars['String']['output'];
  originalValue: Scalars['String']['output'];
  parentFilterId?: Maybe<Scalars['String']['output']>;
};

export type AttributeValueOverrideInput = {
  displayValue: Scalars['String']['input'];
  originalValue: Scalars['String']['input'];
  parentFilterId?: InputMaybe<Scalars['String']['input']>;
};

export type Banner = {
  __typename?: 'Banner';
  backgroundColour: Scalars['String']['output'];
  backgroundImageHorizontal?: Maybe<Scalars['String']['output']>;
  backgroundImageVertical?: Maybe<Scalars['String']['output']>;
  backgroundType: BannerBackgroundType;
  cloudshelf: Cloudshelf;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  linkProduct?: Maybe<Scalars['String']['output']>;
  linkProductGroup?: Maybe<Scalars['String']['output']>;
  linkText?: Maybe<Scalars['String']['output']>;
  linkType: BannerLinkType;
  linkURL?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  text: Scalars['String']['output'];
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export enum BannerBackgroundType {
  Image = 'IMAGE',
  SolidColour = 'SOLID_COLOUR'
}

export enum BannerDisplayMode {
  InteractiveBannersAndAttractLoop = 'INTERACTIVE_BANNERS_AND_ATTRACT_LOOP',
  InteractiveBannersUntilInteraction = 'INTERACTIVE_BANNERS_UNTIL_INTERACTION',
  NonInteractiveAfterCollection = 'NON_INTERACTIVE_AFTER_COLLECTION',
  NonInteractiveAfterLoop = 'NON_INTERACTIVE_AFTER_LOOP',
  NoBanners = 'NO_BANNERS'
}

export type BannerInput = {
  backgroundColour: Scalars['String']['input'];
  backgroundImageHorizontal?: InputMaybe<Scalars['String']['input']>;
  backgroundImageVertical?: InputMaybe<Scalars['String']['input']>;
  backgroundType: BannerBackgroundType;
  id: Scalars['GlobalId']['input'];
  linkProduct?: InputMaybe<Scalars['String']['input']>;
  linkProductGroup?: InputMaybe<Scalars['String']['input']>;
  linkText?: InputMaybe<Scalars['String']['input']>;
  linkType?: InputMaybe<BannerLinkType>;
  linkURL?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export enum BannerLinkType {
  Close = 'CLOSE',
  None = 'NONE',
  Product = 'PRODUCT',
  ProductGroup = 'PRODUCT_GROUP',
  Url = 'URL'
}

export enum CapitalisationStyle {
  Capitalised = 'CAPITALISED',
  Original = 'ORIGINAL',
  Uppercase = 'UPPERCASE'
}

export enum ClearSalesAssistantRule {
  Daily = 'DAILY',
  Never = 'NEVER',
  SessionEnd = 'SESSION_END'
}

export type Cloudshelf = {
  __typename?: 'Cloudshelf';
  banners: Array<Banner>;
  content: Array<CloudshelfContent>;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  devices: Array<Device>;
  displayDiscountCodeEntry: Scalars['Boolean']['output'];
  displayHomeFrame: Scalars['Boolean']['output'];
  displayInStockLabel: Scalars['Boolean']['output'];
  displayLimitedSelectionLabel: Scalars['Boolean']['output'];
  displayName: Scalars['String']['output'];
  displayOnOrderLabel: Scalars['Boolean']['output'];
  displaySoldOutLabel: Scalars['Boolean']['output'];
  displayStockCount: Scalars['Boolean']['output'];
  filters: Array<Filter>;
  homeFrameCallToAction: Scalars['String']['output'];
  homeFrameCallToActionAlignment: Alignment;
  homeFrameCallToActionSize: Size;
  homeFrameTileAnimation: Animation;
  homeFrameTouchIndicator: TouchIndicator;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  inStockLabel?: Maybe<Scalars['String']['output']>;
  includeOnOrderProducts: Scalars['Boolean']['output'];
  includeOutOfStockProducts: Scalars['Boolean']['output'];
  includedFilterConfig: Array<CloudshelfIncludableFilter>;
  interactiveBannerDisplayMode: BannerDisplayMode;
  interactiveBannerShowDurationInSeconds: Scalars['Int']['output'];
  interactiveBannerShowEverySeconds: Scalars['Int']['output'];
  interactiveDisplayLogo: Scalars['Boolean']['output'];
  interactiveLogoSize: Size;
  limitedSelectionLabel?: Maybe<Scalars['String']['output']>;
  nonInteractiveBannerDisplayMode: BannerDisplayMode;
  nonInteractiveBannerShowDurationInSeconds: Scalars['Int']['output'];
  nonInteractiveCollectionType: NonInteractiveCollectionType;
  nonInteractiveDisplayLogo: Scalars['Boolean']['output'];
  nonInteractiveIncludeLandscapeImages: Scalars['Boolean']['output'];
  nonInteractiveIncludePortraitImages: Scalars['Boolean']['output'];
  nonInteractiveIncludeProductName: Scalars['Boolean']['output'];
  nonInteractiveIncludeProductPrice: Scalars['Boolean']['output'];
  nonInteractiveIncludeProductQRCode: Scalars['Boolean']['output'];
  nonInteractiveIncludeProductStock: Scalars['Boolean']['output'];
  nonInteractiveIncludeSquareImages: Scalars['Boolean']['output'];
  nonInteractiveLogoSize: Size;
  nonInteractiveMaximumImagesPerProduct: Scalars['Int']['output'];
  nonInteractiveMaximumProductsPerCollection: Scalars['Int']['output'];
  nonInteractiveMinimumImageQuality: ImageQuality;
  nonInteractiveProductImageDurationInSeconds: Scalars['Int']['output'];
  onOrderLabel?: Maybe<Scalars['String']['output']>;
  owningOrganisation: Organisation;
  pdpBlocks: Array<PdpBlockUnion>;
  soldOutLabel?: Maybe<Scalars['String']['output']>;
  theme: Theme;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type CloudshelfContent = {
  __typename?: 'CloudshelfContent';
  cloudshelf: Cloudshelf;
  configurationIssues: Array<ContentConfigurationIssue>;
  contentType: ContentType;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  pinned: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  powerTileBackgroundImage?: Maybe<Scalars['String']['output']>;
  powerTileBackgroundPrimaryColour?: Maybe<Scalars['String']['output']>;
  powerTileBackgroundSecondaryColour?: Maybe<Scalars['String']['output']>;
  powerTileBackgroundType?: Maybe<PowerTileBackgroundType>;
  powerTileCallToAction?: Maybe<Scalars['String']['output']>;
  powerTileIcon?: Maybe<Scalars['String']['output']>;
  powerTileQRText?: Maybe<Scalars['String']['output']>;
  powerTileQRURL?: Maybe<Scalars['String']['output']>;
  powerTileUseIcon?: Maybe<Scalars['Boolean']['output']>;
  productGroup?: Maybe<ProductGroup>;
  productGroupAlternativeImage?: Maybe<Scalars['String']['output']>;
  productGroupUseAlternativeImage?: Maybe<Scalars['Boolean']['output']>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type CloudshelfContentInput = {
  contentType: ContentType;
  displayName: Scalars['String']['input'];
  id: Scalars['GlobalId']['input'];
  pinned: Scalars['Boolean']['input'];
  position: Scalars['Int']['input'];
  powerTileBackgroundImage?: InputMaybe<Scalars['String']['input']>;
  powerTileBackgroundPrimaryColour?: InputMaybe<Scalars['String']['input']>;
  powerTileBackgroundSecondaryColour?: InputMaybe<Scalars['String']['input']>;
  powerTileBackgroundType?: InputMaybe<PowerTileBackgroundType>;
  powerTileCallToAction?: InputMaybe<Scalars['String']['input']>;
  powerTileIcon?: InputMaybe<Scalars['String']['input']>;
  powerTileQRText?: InputMaybe<Scalars['String']['input']>;
  powerTileQRURL?: InputMaybe<Scalars['String']['input']>;
  powerTileUseIcon?: InputMaybe<Scalars['Boolean']['input']>;
  productGroupAlternativeImage?: InputMaybe<Scalars['String']['input']>;
  productGroupId?: InputMaybe<Scalars['GlobalId']['input']>;
  productGroupUseAlternativeImage?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CloudshelfDeletePayload = {
  __typename?: 'CloudshelfDeletePayload';
  /** An array of Cloudshelves that were deleted */
  cloudshelves: Array<Cloudshelf>;
  /** An array of errors that occurred during the delete operation */
  userErrors: Array<UserError>;
};

export type CloudshelfEdge = {
  __typename?: 'CloudshelfEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Cloudshelf entity */
  node?: Maybe<Cloudshelf>;
};

export type CloudshelfEnginePayload = {
  __typename?: 'CloudshelfEnginePayload';
  cloudshelf?: Maybe<Cloudshelf>;
  device?: Maybe<Device>;
  engineType: EngineType;
  errorMessage?: Maybe<Scalars['String']['output']>;
  inMaintenanceMode: Scalars['Boolean']['output'];
  owningOrganisation?: Maybe<Organisation>;
  status: CloudshelfPayloadStatus;
};

export type CloudshelfIncludableFilter = {
  __typename?: 'CloudshelfIncludableFilter';
  extractionStatus: FilterExtractionStatus;
  filterType: Scalars['String']['output'];
  metadataKey?: Maybe<Scalars['String']['output']>;
};

export type CloudshelfIncludableFilterInput = {
  extractionStatus: FilterExtractionStatus;
  filterType: Scalars['String']['input'];
  metadataKey?: InputMaybe<Scalars['String']['input']>;
};

export type CloudshelfInput = {
  banners?: InputMaybe<Array<BannerInput>>;
  content?: InputMaybe<Array<CloudshelfContentInput>>;
  displayDiscountCodeEntry?: InputMaybe<Scalars['Boolean']['input']>;
  displayHomeFrame?: InputMaybe<Scalars['Boolean']['input']>;
  displayInStockLabel?: InputMaybe<Scalars['Boolean']['input']>;
  displayLimitedSelectionLabel?: InputMaybe<Scalars['Boolean']['input']>;
  /** The display name of the cloudshelf */
  displayName?: InputMaybe<Scalars['String']['input']>;
  displayOnOrderLabel?: InputMaybe<Scalars['Boolean']['input']>;
  displaySoldOutLabel?: InputMaybe<Scalars['Boolean']['input']>;
  displayStockCount?: InputMaybe<Scalars['Boolean']['input']>;
  filters?: InputMaybe<Array<FilterInput>>;
  homeFrameCallToAction?: InputMaybe<Scalars['String']['input']>;
  homeFrameCallToActionAlignment?: InputMaybe<Alignment>;
  homeFrameCallToActionSize?: InputMaybe<Size>;
  homeFrameTileAnimation?: InputMaybe<Animation>;
  homeFrameTouchIndicator?: InputMaybe<TouchIndicator>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  inStockLabel?: InputMaybe<Scalars['String']['input']>;
  includeOnOrderProducts?: InputMaybe<Scalars['Boolean']['input']>;
  includeOutOfStockProducts?: InputMaybe<Scalars['Boolean']['input']>;
  includedFilterConfig?: InputMaybe<Array<CloudshelfIncludableFilterInput>>;
  interactiveBannerDisplayMode?: InputMaybe<BannerDisplayMode>;
  interactiveBannerShowDurationInSeconds?: InputMaybe<Scalars['Int']['input']>;
  interactiveBannerShowEverySeconds?: InputMaybe<Scalars['Int']['input']>;
  interactiveDisplayLogo?: InputMaybe<Scalars['Boolean']['input']>;
  interactiveLogoSize?: InputMaybe<Size>;
  limitedSelectionLabel?: InputMaybe<Scalars['String']['input']>;
  nonInteractiveBannerDisplayMode?: InputMaybe<BannerDisplayMode>;
  nonInteractiveBannerShowDurationInSeconds?: InputMaybe<Scalars['Int']['input']>;
  nonInteractiveCollectionType?: InputMaybe<NonInteractiveCollectionType>;
  nonInteractiveDisplayLogo?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludeLandscapeImages?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludePortraitImages?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludeProductName?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludeProductPrice?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludeProductQRCode?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludeProductStock?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveIncludeSquareImages?: InputMaybe<Scalars['Boolean']['input']>;
  nonInteractiveLogoSize?: InputMaybe<Size>;
  nonInteractiveMaximumImagesPerProduct?: InputMaybe<Scalars['Int']['input']>;
  nonInteractiveMaximumProductsPerCollection?: InputMaybe<Scalars['Int']['input']>;
  nonInteractiveMinimumImageQuality?: InputMaybe<ImageQuality>;
  nonInteractiveProductImageDurationInSeconds?: InputMaybe<Scalars['Int']['input']>;
  onOrderLabel?: InputMaybe<Scalars['String']['input']>;
  pdpBlocks?: InputMaybe<Array<PdpBlockInput>>;
  soldOutLabel?: InputMaybe<Scalars['String']['input']>;
  /** The GlobalID of the theme to apply to this Cloudshelf */
  themeId?: InputMaybe<Scalars['GlobalId']['input']>;
};

export type CloudshelfPageInfo = {
  __typename?: 'CloudshelfPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type CloudshelfPaginatedPayload = {
  __typename?: 'CloudshelfPaginatedPayload';
  edges?: Maybe<Array<CloudshelfEdge>>;
  pageInfo?: Maybe<CloudshelfPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export enum CloudshelfPayloadStatus {
  Cached = 'CACHED',
  CloudshelfPreview = 'CLOUDSHELF_PREVIEW',
  DeviceNoCloudshelf = 'DEVICE_NO_CLOUDSHELF',
  DeviceRemoved = 'DEVICE_REMOVED',
  DeviceWithoutLocation = 'DEVICE_WITHOUT_LOCATION',
  DeviceWithCloudshelf = 'DEVICE_WITH_CLOUDSHELF',
  Error = 'ERROR',
  Frozen = 'FROZEN',
  MobileHandoff = 'MOBILE_HANDOFF',
  Notfound = 'NOTFOUND'
}

export enum CloudshelfPayloadType {
  Device = 'DEVICE',
  Handoff = 'HANDOFF',
  Preview = 'PREVIEW'
}

export type CloudshelfUpsertPayload = {
  __typename?: 'CloudshelfUpsertPayload';
  /** An array of Cloudshelves that were created or updated */
  cloudshelves: Array<Cloudshelf>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

export enum ContentConfigurationIssue {
  Cta = 'CTA',
  QrUrl = 'QR_URL',
  Text = 'TEXT'
}

export enum ContentType {
  PowerTile = 'POWER_TILE',
  ProductGroup = 'PRODUCT_GROUP'
}

/** The code designating a country/region, which generally follows ISO 3166-1 alpha-2 guidelines. If a territory doesn't have a country code value in the CountryCode enum, then it might be considered a subdivision of another country. For example, the territories associated with Spain are represented by the country code ES, and the territories associated with the United States of America are represented by the country code US. */
export enum CountryCode {
  /** Ascension Island */
  Ac = 'AC',
  /** Andorra */
  Ad = 'AD',
  /** United Arab Emirates */
  Ae = 'AE',
  /** Afghanistan */
  Af = 'AF',
  /** Antigua & Barbuda */
  Ag = 'AG',
  /** Anguilla */
  Ai = 'AI',
  /** Albania */
  Al = 'AL',
  /** Armenia */
  Am = 'AM',
  /** Netherlands Antilles */
  An = 'AN',
  /** Angola */
  Ao = 'AO',
  /** Argentina */
  Ar = 'AR',
  /** Austria */
  At = 'AT',
  /** Australia */
  Au = 'AU',
  /** Aruba */
  Aw = 'AW',
  /** Åland Islands */
  Ax = 'AX',
  /** Azerbaijan */
  Az = 'AZ',
  /** Bosnia & Herzegovina */
  Ba = 'BA',
  /** Barbados */
  Bb = 'BB',
  /** Bangladesh */
  Bd = 'BD',
  /** Belgium */
  Be = 'BE',
  /** Burkina Faso */
  Bf = 'BF',
  /** Bulgaria */
  Bg = 'BG',
  /** Bahrain */
  Bh = 'BH',
  /** Burundi */
  Bi = 'BI',
  /** Benin */
  Bj = 'BJ',
  /** St. Barthélemy */
  Bl = 'BL',
  /** Bermuda */
  Bm = 'BM',
  /** Brunei */
  Bn = 'BN',
  /** Bolivia */
  Bo = 'BO',
  /** Caribbean Netherlands */
  Bq = 'BQ',
  /** Brazil */
  Br = 'BR',
  /** Bahamas */
  Bs = 'BS',
  /** Bhutan */
  Bt = 'BT',
  /** Bouvet Island */
  Bv = 'BV',
  /** Botswana */
  Bw = 'BW',
  /** Belarus */
  By = 'BY',
  /** Belize */
  Bz = 'BZ',
  /** Canada */
  Ca = 'CA',
  /** Cocos (Keeling) Islands */
  Cc = 'CC',
  /** Congo - Kinshasa */
  Cd = 'CD',
  /** Central African Republic */
  Cf = 'CF',
  /** Congo - Brazzaville */
  Cg = 'CG',
  /** Switzerland */
  Ch = 'CH',
  /** Côte d’Ivoire */
  Ci = 'CI',
  /** Cook Islands */
  Ck = 'CK',
  /** Chile */
  Cl = 'CL',
  /** Cameroon */
  Cm = 'CM',
  /** China */
  Cn = 'CN',
  /** Colombia */
  Co = 'CO',
  /** Costa Rica */
  Cr = 'CR',
  /** Cuba */
  Cu = 'CU',
  /** Cape Verde */
  Cv = 'CV',
  /** Curaçao */
  Cw = 'CW',
  /** Christmas Island */
  Cx = 'CX',
  /** Cyprus */
  Cy = 'CY',
  /** Czechia */
  Cz = 'CZ',
  /** Germany */
  De = 'DE',
  /** Djibouti */
  Dj = 'DJ',
  /** Denmark */
  Dk = 'DK',
  /** Dominica */
  Dm = 'DM',
  /** Dominican Republic */
  Do = 'DO',
  /** Algeria */
  Dz = 'DZ',
  /** Ecuador */
  Ec = 'EC',
  /** Estonia */
  Ee = 'EE',
  /** Egypt */
  Eg = 'EG',
  /** Western Sahara */
  Eh = 'EH',
  /** Eritrea */
  Er = 'ER',
  /** Spain */
  Es = 'ES',
  /** Ethiopia */
  Et = 'ET',
  /** Finland */
  Fi = 'FI',
  /** Fiji */
  Fj = 'FJ',
  /** Falkland Islands */
  Fk = 'FK',
  /** Faroe Islands */
  Fo = 'FO',
  /** France */
  Fr = 'FR',
  /** Gabon */
  Ga = 'GA',
  /** United Kingdom */
  Gb = 'GB',
  /** Grenada */
  Gd = 'GD',
  /** Georgia */
  Ge = 'GE',
  /** French Guiana */
  Gf = 'GF',
  /** Guernsey */
  Gg = 'GG',
  /** Ghana */
  Gh = 'GH',
  /** Gibraltar */
  Gi = 'GI',
  /** Greenland */
  Gl = 'GL',
  /** Gambia */
  Gm = 'GM',
  /** Guinea */
  Gn = 'GN',
  /** Guadeloupe */
  Gp = 'GP',
  /** Equatorial Guinea */
  Gq = 'GQ',
  /** Greece */
  Gr = 'GR',
  /** South Georgia & South Sandwich Islands */
  Gs = 'GS',
  /** Guatemala */
  Gt = 'GT',
  /** Guinea-Bissau */
  Gw = 'GW',
  /** Guyana */
  Gy = 'GY',
  /** Hong Kong SAR China */
  Hk = 'HK',
  /** Heard & McDonald Islands */
  Hm = 'HM',
  /** Honduras */
  Hn = 'HN',
  /** Croatia */
  Hr = 'HR',
  /** Haiti */
  Ht = 'HT',
  /** Hungary */
  Hu = 'HU',
  /** Indonesia */
  Id = 'ID',
  /** Ireland */
  Ie = 'IE',
  /** Israel */
  Il = 'IL',
  /** Isle of Man */
  Im = 'IM',
  /** India */
  In = 'IN',
  /** British Indian Ocean Territory */
  Io = 'IO',
  /** Iraq */
  Iq = 'IQ',
  /** Iran */
  Ir = 'IR',
  /** Iceland */
  Is = 'IS',
  /** Italy */
  It = 'IT',
  /** Jersey */
  Je = 'JE',
  /** Jamaica */
  Jm = 'JM',
  /** Jordan */
  Jo = 'JO',
  /** Japan */
  Jp = 'JP',
  /** Kenya */
  Ke = 'KE',
  /** Kyrgyzstan */
  Kg = 'KG',
  /** Cambodia */
  Kh = 'KH',
  /** Kiribati */
  Ki = 'KI',
  /** Comoros */
  Km = 'KM',
  /** St. Kitts & Nevis */
  Kn = 'KN',
  /** North Korea */
  Kp = 'KP',
  /** South Korea */
  Kr = 'KR',
  /** Kuwait */
  Kw = 'KW',
  /** Cayman Islands */
  Ky = 'KY',
  /** Kazakhstan */
  Kz = 'KZ',
  /** Laos */
  La = 'LA',
  /** Lebanon */
  Lb = 'LB',
  /** St. Lucia */
  Lc = 'LC',
  /** Liechtenstein */
  Li = 'LI',
  /** Sri Lanka */
  Lk = 'LK',
  /** Liberia */
  Lr = 'LR',
  /** Lesotho */
  Ls = 'LS',
  /** Lithuania */
  Lt = 'LT',
  /** Luxembourg */
  Lu = 'LU',
  /** Latvia */
  Lv = 'LV',
  /** Libya */
  Ly = 'LY',
  /** Morocco */
  Ma = 'MA',
  /** Monaco */
  Mc = 'MC',
  /** Moldova */
  Md = 'MD',
  /** Montenegro */
  Me = 'ME',
  /** St. Martin */
  Mf = 'MF',
  /** Madagascar */
  Mg = 'MG',
  /** North Macedonia */
  Mk = 'MK',
  /** Mali */
  Ml = 'ML',
  /** Myanmar (Burma) */
  Mm = 'MM',
  /** Mongolia */
  Mn = 'MN',
  /** Macao SAR China */
  Mo = 'MO',
  /** Martinique */
  Mq = 'MQ',
  /** Mauritania */
  Mr = 'MR',
  /** Montserrat */
  Ms = 'MS',
  /** Malta */
  Mt = 'MT',
  /** Mauritius */
  Mu = 'MU',
  /** Maldives */
  Mv = 'MV',
  /** Malawi */
  Mw = 'MW',
  /** Mexico */
  Mx = 'MX',
  /** Malaysia */
  My = 'MY',
  /** Mozambique */
  Mz = 'MZ',
  /** Namibia */
  Na = 'NA',
  /** New Caledonia */
  Nc = 'NC',
  /** Niger */
  Ne = 'NE',
  /** Norfolk Island */
  Nf = 'NF',
  /** Nigeria */
  Ng = 'NG',
  /** Nicaragua */
  Ni = 'NI',
  /** Netherlands */
  Nl = 'NL',
  /** Norway */
  No = 'NO',
  /** Nepal */
  Np = 'NP',
  /** Nauru */
  Nr = 'NR',
  /** Niue */
  Nu = 'NU',
  /** New Zealand */
  Nz = 'NZ',
  /** Oman */
  Om = 'OM',
  /** Panama */
  Pa = 'PA',
  /** Peru */
  Pe = 'PE',
  /** French Polynesia */
  Pf = 'PF',
  /** Papua New Guinea */
  Pg = 'PG',
  /** Philippines */
  Ph = 'PH',
  /** Pakistan */
  Pk = 'PK',
  /** Poland */
  Pl = 'PL',
  /** St. Pierre & Miquelon */
  Pm = 'PM',
  /** Pitcairn Islands */
  Pn = 'PN',
  /** Palestinian Territories */
  Ps = 'PS',
  /** Portugal */
  Pt = 'PT',
  /** Paraguay */
  Py = 'PY',
  /** Qatar */
  Qa = 'QA',
  /** Réunion */
  Re = 'RE',
  /** Romania */
  Ro = 'RO',
  /** Serbia */
  Rs = 'RS',
  /** Russia */
  Ru = 'RU',
  /** Rwanda */
  Rw = 'RW',
  /** Saudi Arabia */
  Sa = 'SA',
  /** Solomon Islands */
  Sb = 'SB',
  /** Seychelles */
  Sc = 'SC',
  /** Sudan */
  Sd = 'SD',
  /** Sweden */
  Se = 'SE',
  /** Singapore */
  Sg = 'SG',
  /** St. Helena */
  Sh = 'SH',
  /** Slovenia */
  Si = 'SI',
  /** Svalbard & Jan Mayen */
  Sj = 'SJ',
  /** Slovakia */
  Sk = 'SK',
  /** Sierra Leone */
  Sl = 'SL',
  /** San Marino */
  Sm = 'SM',
  /** Senegal */
  Sn = 'SN',
  /** Somalia */
  So = 'SO',
  /** Suriname */
  Sr = 'SR',
  /** South Sudan */
  Ss = 'SS',
  /** São Tomé & Príncipe */
  St = 'ST',
  /** El Salvador */
  Sv = 'SV',
  /** Sint Maarten */
  Sx = 'SX',
  /** Syria */
  Sy = 'SY',
  /** Eswatini */
  Sz = 'SZ',
  /** Tristan da Cunha */
  Ta = 'TA',
  /** Turks & Caicos Islands */
  Tc = 'TC',
  /** Chad */
  Td = 'TD',
  /** French Southern Territories */
  Tf = 'TF',
  /** Togo */
  Tg = 'TG',
  /** Thailand */
  Th = 'TH',
  /** Tajikistan */
  Tj = 'TJ',
  /** Tokelau */
  Tk = 'TK',
  /** Timor-Leste */
  Tl = 'TL',
  /** Turkmenistan */
  Tm = 'TM',
  /** Tunisia */
  Tn = 'TN',
  /** Tonga */
  To = 'TO',
  /** Turkey */
  Tr = 'TR',
  /** Trinidad & Tobago */
  Tt = 'TT',
  /** Tuvalu */
  Tv = 'TV',
  /** Taiwan */
  Tw = 'TW',
  /** Tanzania */
  Tz = 'TZ',
  /** Ukraine */
  Ua = 'UA',
  /** Uganda */
  Ug = 'UG',
  /** U.S. Outlying Islands */
  Um = 'UM',
  /** United States */
  Us = 'US',
  /** Uruguay */
  Uy = 'UY',
  /** Uzbekistan */
  Uz = 'UZ',
  /** Vatican City */
  Va = 'VA',
  /** St. Vincent & Grenadines */
  Vc = 'VC',
  /** Venezuela */
  Ve = 'VE',
  /** British Virgin Islands */
  Vg = 'VG',
  /** Vietnam */
  Vn = 'VN',
  /** Vanuatu */
  Vu = 'VU',
  /** Wallis & Futuna */
  Wf = 'WF',
  /** Samoa */
  Ws = 'WS',
  /** Kosovo */
  Xk = 'XK',
  /** Yemen */
  Ye = 'YE',
  /** Mayotte */
  Yt = 'YT',
  /** South Africa */
  Za = 'ZA',
  /** Zambia */
  Zm = 'ZM',
  /** Zimbabwe */
  Zw = 'ZW',
  /** Unknown Region */
  Zz = 'ZZ'
}

export enum CurrencyCode {
  /** Canadian Dollar */
  Cad = 'CAD',
  /** Euro */
  Eur = 'EUR',
  /** Great British Pound */
  Gbp = 'GBP',
  Unknown = 'UNKNOWN',
  /** United States Dollar */
  Usd = 'USD'
}

export type CustomIntegrationFullSignupResultPayload = {
  __typename?: 'CustomIntegrationFullSignupResultPayload';
  successful: Scalars['Boolean']['output'];
  /** An array of errors that occurred during the sign up operation */
  userErrors: Array<UserError>;
};

export type Device = {
  __typename?: 'Device';
  cloudshelf?: Maybe<Cloudshelf>;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  engineInfo?: Maybe<Scalars['String']['output']>;
  engineOrientation?: Maybe<EngineOrientation>;
  engineSeenSinceLastChange: Scalars['Boolean']['output'];
  engineSizeInfo?: Maybe<Scalars['String']['output']>;
  engineType?: Maybe<EngineType>;
  engineUserAgent?: Maybe<Scalars['String']['output']>;
  engineVersionLastSeen?: Maybe<Scalars['String']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  location?: Maybe<Location>;
  owningOrganisation?: Maybe<Organisation>;
  registered: Scalars['Boolean']['output'];
  registrationCode: Scalars['String']['output'];
  screenSizeInches: Scalars['Float']['output'];
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  visibilityType?: Maybe<VisibilityType>;
};

export type DeviceDeletePayload = {
  __typename?: 'DeviceDeletePayload';
  /** An array of Devices that were deleted */
  devices: Array<Device>;
  /** An array of errors that occurred during the delete operation */
  userErrors: Array<UserError>;
};

export type DeviceEdge = {
  __typename?: 'DeviceEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Device entity */
  node?: Maybe<Device>;
};

export type DeviceInput = {
  cloudshelfId?: InputMaybe<Scalars['GlobalId']['input']>;
  /** The display name of the device */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** The visibility type of the device */
  engineType?: InputMaybe<EngineType>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  locationId?: InputMaybe<Scalars['GlobalId']['input']>;
  /** The registration code of the device */
  registrationCode?: InputMaybe<Scalars['String']['input']>;
  /** The display name of the device */
  screenSizeInInches?: InputMaybe<Scalars['Int']['input']>;
  /** The visibility type of the device */
  visibilityType?: InputMaybe<VisibilityType>;
};

export type DevicePageInfo = {
  __typename?: 'DevicePageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type DevicePaginatedPayload = {
  __typename?: 'DevicePaginatedPayload';
  edges?: Maybe<Array<DeviceEdge>>;
  pageInfo?: Maybe<DevicePageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type DeviceUpsertPayload = {
  __typename?: 'DeviceUpsertPayload';
  /** An array of Devices that were created or updated */
  devices: Array<Device>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

/** The eCommerce platform the organisation has connected to Cloudshelf */
export enum ECommercePlatform {
  /** The organisation is connected to Cloudshelf via a custom integration */
  Custom = 'CUSTOM',
  /** The organisation is connected to Cloudshelf via the Cloudshelf Shopify app */
  Shopify = 'SHOPIFY'
}

export type EngineImageWithVariantInfo = {
  __typename?: 'EngineImageWithVariantInfo';
  url: Scalars['String']['output'];
  variantId?: Maybe<Scalars['GlobalId']['output']>;
};

export enum EngineOrientation {
  Horizontal = 'HORIZONTAL',
  Portrait = 'PORTRAIT',
  Square = 'SQUARE'
}

export type EngineProductWithAdditionalInfo = {
  __typename?: 'EngineProductWithAdditionalInfo';
  availableForSale: Scalars['Boolean']['output'];
  categoryHandles: Array<Scalars['String']['output']>;
  categoryIds: Array<Scalars['String']['output']>;
  descriptionHtml: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['GlobalId']['output'];
  images: Array<EngineImageWithVariantInfo>;
  metadata: Array<Metadata>;
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  remoteUpdatedAt: Scalars['DateTime']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  variants: Array<EngineVariant>;
  vendor: Scalars['String']['output'];
};

export type EngineProductWithAdditionalInfoEdge = {
  __typename?: 'EngineProductWithAdditionalInfoEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The EngineProductWithAdditionalInfo entity */
  node?: Maybe<EngineProductWithAdditionalInfo>;
};

export type EngineProductWithAdditionalInfoPageInfo = {
  __typename?: 'EngineProductWithAdditionalInfoPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type EngineProductWithAdditionalInfoPayload = {
  __typename?: 'EngineProductWithAdditionalInfoPayload';
  edges?: Maybe<Array<EngineProductWithAdditionalInfoEdge>>;
  pageInfo?: Maybe<EngineProductWithAdditionalInfoPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export enum EngineType {
  DisplayOnly = 'DISPLAY_ONLY',
  Hybrid = 'HYBRID',
  Interactive = 'INTERACTIVE'
}

export type EngineVariant = {
  __typename?: 'EngineVariant';
  availableForSale: Scalars['Boolean']['output'];
  currentlyNotInStock: Scalars['Boolean']['output'];
  displayName: Scalars['String']['output'];
  hasSalePrice?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['GlobalId']['output']>;
  options: Array<KeyValuePair>;
  originalPrice: Scalars['Float']['output'];
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  price: Scalars['Float']['output'];
  sellableOnlineQuantity: Scalars['Float']['output'];
  sku: Scalars['String']['output'];
};

export type Filter = {
  __typename?: 'Filter';
  attributeValues: Array<AttributeValue>;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  ecommProviderFieldName: Scalars['String']['output'];
  expandedByDefault: Scalars['Boolean']['output'];
  hiddenAttributeValues: Array<Scalars['String']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  isHidden: Scalars['Boolean']['output'];
  isMergedChild: Scalars['Boolean']['output'];
  mergedInFilters: Array<MergedInFilter>;
  metafieldKey?: Maybe<Scalars['String']['output']>;
  options?: Maybe<FilterOptions>;
  parentId?: Maybe<Scalars['GlobalId']['output']>;
  priority: Scalars['Int']['output'];
  type: FilterType;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  valueOverrides: Array<AttributeValueOverride>;
};

export type FilterExtractionJobData = {
  __typename?: 'FilterExtractionJobData';
  cloudshelfId: Scalars['GlobalId']['output'];
  dataType: Scalars['String']['output'];
};

export enum FilterExtractionStatus {
  Extracted = 'EXTRACTED',
  Pending = 'PENDING',
  Unknown = 'UNKNOWN'
}

export type FilterInput = {
  attributeValues: Array<AttributeValueInput>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  ecommProviderFieldName: Scalars['String']['input'];
  expandedByDefault: Scalars['Boolean']['input'];
  hiddenAttributeValues: Array<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  isHidden: Scalars['Boolean']['input'];
  isMergedChild: Scalars['Boolean']['input'];
  mergedInFilters: Array<MergedInFilterInput>;
  metafieldKey?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<FilterOptionsInput>;
  parentId?: InputMaybe<Scalars['GlobalId']['input']>;
  priority: Scalars['Int']['input'];
  type: FilterType;
  valueOverrides: Array<AttributeValueOverrideInput>;
};

export type FilterOptions = {
  __typename?: 'FilterOptions';
  baseShoesizeUnit?: Maybe<Scalars['String']['output']>;
  capitalisationStyle?: Maybe<CapitalisationStyle>;
  orderType: FilterOrderType;
  swatches?: Maybe<Array<Swatch>>;
};

export type FilterOptionsInput = {
  baseShoesizeUnit?: InputMaybe<Scalars['String']['input']>;
  capitalisationStyle?: InputMaybe<CapitalisationStyle>;
  orderType: FilterOrderType;
  swatches?: InputMaybe<Array<SwatchInput>>;
};

export enum FilterOrderType {
  Alphabetical = 'ALPHABETICAL',
  Ascending = 'ASCENDING',
  Chromatic = 'CHROMATIC',
  Custom = 'CUSTOM',
  Descending = 'DESCENDING'
}

export enum FilterType {
  Basic = 'BASIC',
  CategoryHandle = 'CATEGORY_HANDLE',
  CategoryId = 'CATEGORY_ID',
  Colour = 'COLOUR',
  Images = 'IMAGES',
  Material = 'MATERIAL',
  Metadata = 'METADATA',
  Price = 'PRICE',
  ProductHandle = 'PRODUCT_HANDLE',
  ProductTitle = 'PRODUCT_TITLE',
  ProductType = 'PRODUCT_TYPE',
  Promotions = 'PROMOTIONS',
  ShoeSize = 'SHOE_SIZE',
  Size = 'SIZE',
  SortOrder = 'SORT_ORDER',
  StockLevel = 'STOCK_LEVEL',
  Tag = 'TAG',
  Vendor = 'VENDOR'
}

/** The anchor point for the images in the theme. This is used to determine how the images are cropped when they don't match the aspect ratio of the container. */
export enum ImageAnchor {
  /** Anchor the images at the bottom */
  Bottom = 'BOTTOM',
  /** Anchor the images at the center */
  Center = 'CENTER',
  /** Anchor the images at the left */
  Left = 'LEFT',
  /** Anchor the images at the right */
  Right = 'RIGHT',
  /** Anchor the images at the top */
  Top = 'TOP'
}

export enum ImageOrientation {
  Landscape = 'Landscape',
  Portrait = 'Portrait',
  Square = 'Square'
}

export enum ImageQuality {
  Q2K = 'Q2K',
  Q4K = 'Q4K',
  Q8K = 'Q8K',
  Q540 = 'Q540',
  Q720 = 'Q720',
  Q1080 = 'Q1080',
  QLow = 'QLow'
}

export type IncludablePdpBlock = {
  __typename?: 'IncludablePDPBlock';
  metadataKey?: Maybe<Scalars['String']['output']>;
  productDataType?: Maybe<PdpProductDataType>;
  type: PdpBlockType;
};

export type InstallInformation = {
  __typename?: 'InstallInformation';
  hasCloudshelf: Scalars['Boolean']['output'];
  hasLocations: Scalars['Boolean']['output'];
  hasProductGroups: Scalars['Boolean']['output'];
  hasProducts: Scalars['Boolean']['output'];
  hasTheme: Scalars['Boolean']['output'];
};

/** A key-value pair used to store additional data which can be accessed via a known key. */
export type KeyValuePair = {
  __typename?: 'KeyValuePair';
  /** The key for the value */
  key: Scalars['String']['output'];
  /** The value for the key, this can be any string value. Usually either plain string or a stringified JSON object. */
  value: Scalars['String']['output'];
};

export type KeyValuePairInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type KnownVersion = {
  __typename?: 'KnownVersion';
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  versionString: Scalars['String']['output'];
  versionType: VersionType;
};

/** This object represents a physical location, usually a store or a warehouse. */
export type Location = {
  __typename?: 'Location';
  /** The address of the location. */
  address: Scalars['String']['output'];
  /** The country code of the country of where the location is based. */
  countryCode: CountryCode;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** An array of devices which are located at this location. */
  devices: Array<Device>;
  /** The name of the location. */
  displayName: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** Additional data about this entity. */
  metadata: Array<Metadata>;
  /** The organisation which owns this entity. */
  owningOrganisation: Organisation;
  /** An externally provided GlobalId */
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type LocationDeletePayload = {
  __typename?: 'LocationDeletePayload';
  /** An array of Locations that were deleted */
  locations: Array<Location>;
  /** An array of errors that occurred during the delete operation */
  userErrors: Array<UserError>;
};

export type LocationEdge = {
  __typename?: 'LocationEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Location entity */
  node?: Maybe<Location>;
};

/** This object represents a physical location, usually a store or a warehouse. */
export type LocationInput = {
  /** The full address of the location */
  address?: InputMaybe<Scalars['String']['input']>;
  /** The country code of the location is based */
  countryCode?: InputMaybe<CountryCode>;
  /** The display name of the location */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** An array of metadata to attach to the location */
  metadata?: InputMaybe<Array<MetadataInput>>;
};

export type LocationPageInfo = {
  __typename?: 'LocationPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type LocationPaginatedPayload = {
  __typename?: 'LocationPaginatedPayload';
  edges?: Maybe<Array<LocationEdge>>;
  pageInfo?: Maybe<LocationPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type LocationUpsertPayload = {
  __typename?: 'LocationUpsertPayload';
  /** An array of Locations that were created or updated */
  locations: Array<Location>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

export type MergedInFilter = {
  __typename?: 'MergedInFilter';
  displayName: Scalars['String']['output'];
  id: Scalars['GlobalId']['output'];
};

export type MergedInFilterInput = {
  displayName: Scalars['String']['input'];
  id: Scalars['GlobalId']['input'];
};

/** This object represents a piece of additional metadata. */
export type Metadata = {
  __typename?: 'Metadata';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The value for the key, this can be any string value. Usually either plain string or a stringified JSON object. */
  data: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** The key for the value */
  key: Scalars['String']['output'];
  /** The location which this metadata is linked too. */
  location?: Maybe<Location>;
  /** The organisation which owns this entity. */
  owningOrganisation: Organisation;
  /** An externally provided GlobalId */
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  /** The product which this metadata is linked too. */
  product?: Maybe<Product>;
  /** The product group which this metadata is linked too. */
  productGroup?: Maybe<ProductGroup>;
  /** The product variant which this metadata is linked too. */
  productVariant?: Maybe<ProductVariant>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** The user which this metadata is linked too. */
  user?: Maybe<User>;
};

/** This object represents a piece of additional metadata. */
export type MetadataInput = {
  data: Scalars['String']['input'];
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  key: Scalars['String']['input'];
};

/** This object represents an image with additional metadata */
export type Metaimage = {
  __typename?: 'Metaimage';
  /** A boolean value that represents if the image was accessible last time it was checked. */
  available: Scalars['Boolean']['output'];
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The height of the image in pixels. */
  height?: Maybe<Scalars['Int']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** The orientation of the image */
  orientation?: Maybe<ImageOrientation>;
  /** The organisation which owns this entity. */
  owningOrganisation: Organisation;
  /** A boolean value that represents if the image is a preferred image for the entity it is linked too. The Cloudshelf Engine will always try to use a preferred image over a non-preferred image. */
  preferredImage: Scalars['Boolean']['output'];
  /** The product variant which this metaimage is linked too. */
  productVariant?: Maybe<ProductVariant>;
  /** The quality of the image */
  quality?: Maybe<ImageQuality>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** The URL of the image */
  url: Scalars['String']['output'];
  /** The width of the image in pixels. */
  width?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Adds the given list of products to the product group, if they are not already part of the product group */
  addProductsToProductGroup: Scalars['Boolean']['output'];
  createUserAndOrganisationForCustomIntegration: CustomIntegrationFullSignupResultPayload;
  /** Allows deletion of Cloudshelves */
  deleteCloudshelves: CloudshelfDeletePayload;
  /** Allows deletion of Devices */
  deleteDevices: DeviceDeletePayload;
  /** Allows deletion of locations */
  deleteLocations: LocationDeletePayload;
  /** Allows deletion of product groups */
  deleteProductGroups: ProductGroupDeletePayload;
  /** Allows the deletion of Products */
  deleteProducts: ProductDeletePayload;
  /** Allows the deletion of Themes */
  deleteThemes: ThemeDeletePayload;
  editSubscription: SubscriptionRecord;
  endSession: Session;
  /** Allows the current user leave an Organisation. */
  leaveOrganisation: Scalars['Boolean']['output'];
  markInstallComplete: Scalars['Boolean']['output'];
  newSession: Session;
  /** Register a webhook for a given subject. The supplied URL will be called with a POST request when the subject is triggered. */
  registerWebhook: WebhookRegisterPayload;
  /** Removes the given products from the product group, if they are currently part of it */
  removeProductsFromProductGroup: Scalars['Boolean']['output'];
  reportDeviceOnline: Scalars['Boolean']['output'];
  /** This is an internal function. This allows Cloudshelf staff to run internal tools */
  runInternalTool: Scalars['String']['output'];
  saveSurveyAnswers: Scalars['Boolean']['output'];
  /** Sets the users currently active organisation (actingAs), which is used to decide which organisations data is accessed in other queries. */
  selectCurrentOrganisationAccess: Scalars['Boolean']['output'];
  setActiveVersion: Scalars['Boolean']['output'];
  setPausedNobleQueuesByType: Scalars['Boolean']['output'];
  subscribe: Scalars['String']['output'];
  toggleInMaintenanceMode: Scalars['Boolean']['output'];
  toggleNoblePaused: Scalars['Boolean']['output'];
  /** Unregister a webhook for a given subject. If an array of ids is supplied, only the webhooks corresponding to the supplied ids will be unregistered, if they exists. If no array is supplied, all webhooks for the given subject will be unregistered. */
  unregisterWebhooks: WebhookRegisterPayload;
  unsubscribe: Scalars['Boolean']['output'];
  /** Allows updating basic user information */
  updateMyUser: User;
  updateProductVariant: ProductVariant;
  /** Sets the products in the product group to the given list of products */
  updateProductsInProductGroup: Scalars['Boolean']['output'];
  updateSession: Session;
  /** Allows upserting of Cloudshelves */
  upsertCloudshelves: CloudshelfUpsertPayload;
  /** Allows upserting of Devices */
  upsertDevices: DeviceUpsertPayload;
  /** Allows upserting of locations */
  upsertLocations: LocationUpsertPayload;
  /** Allows upserting of Order entities */
  upsertOrders: OrderUpsertPayload;
  /** Allows upserting of an organisation */
  upsertOrganisation: OrganisationUpsertPayload;
  /** Allows upserting of product groups */
  upsertProductGroups: ProductGroupUpsertPayload;
  upsertProductVariants: ProductVariantUpsertPayload;
  /** Allows upserting of Products */
  upsertProducts: ProductUpsertPayload;
  upsertShopifyOrganisation: OrganisationUpsertPayload;
  /** Allows upserting of Themes */
  upsertTheme: ThemeUpsertPayload;
};


export type MutationAddProductsToProductGroupArgs = {
  productGroupId: Scalars['GlobalId']['input'];
  productIds: Array<Scalars['GlobalId']['input']>;
};


export type MutationCreateUserAndOrganisationForCustomIntegrationArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  orgDomain: Scalars['String']['input'];
  orgName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationDeleteCloudshelvesArgs = {
  ids: Array<Scalars['GlobalId']['input']>;
};


export type MutationDeleteDevicesArgs = {
  ids: Array<Scalars['GlobalId']['input']>;
};


export type MutationDeleteLocationsArgs = {
  ids: Array<Scalars['GlobalId']['input']>;
};


export type MutationDeleteProductGroupsArgs = {
  ids: Array<Scalars['GlobalId']['input']>;
};


export type MutationDeleteProductsArgs = {
  ids: Array<Scalars['GlobalId']['input']>;
};


export type MutationDeleteThemesArgs = {
  ids: Array<Scalars['GlobalId']['input']>;
};


export type MutationEditSubscriptionArgs = {
  features: SubscriptionFeaturesInput;
};


export type MutationEndSessionArgs = {
  id: Scalars['GlobalId']['input'];
  interactions: Scalars['Int']['input'];
};


export type MutationLeaveOrganisationArgs = {
  accessRightId: Scalars['GlobalId']['input'];
};


export type MutationNewSessionArgs = {
  deviceId: Scalars['GlobalId']['input'];
  latitude?: InputMaybe<Scalars['Latitude']['input']>;
  longitude?: InputMaybe<Scalars['Longitude']['input']>;
  salesAssistantId: Scalars['GlobalId']['input'];
};


export type MutationRegisterWebhookArgs = {
  inputs: Array<WebhookRegisterInput>;
};


export type MutationRemoveProductsFromProductGroupArgs = {
  productGroupId: Scalars['GlobalId']['input'];
  productIds: Array<Scalars['GlobalId']['input']>;
};


export type MutationReportDeviceOnlineArgs = {
  engineVersion: Scalars['String']['input'];
  id: Scalars['GlobalId']['input'];
  screenHeight: Scalars['Int']['input'];
  screenWidth: Scalars['Int']['input'];
  userAgent: Scalars['String']['input'];
};


export type MutationRunInternalToolArgs = {
  toolType: Scalars['String']['input'];
};


export type MutationSaveSurveyAnswersArgs = {
  answers: Scalars['String']['input'];
};


export type MutationSelectCurrentOrganisationAccessArgs = {
  id?: InputMaybe<Scalars['GlobalId']['input']>;
};


export type MutationSetActiveVersionArgs = {
  key: Scalars['String']['input'];
  type: VersionType;
  versionString: Scalars['String']['input'];
};


export type MutationSetPausedNobleQueuesByTypeArgs = {
  types: Array<NobleTaskType>;
};


export type MutationSubscribeArgs = {
  features: SubscriptionFeaturesInput;
};


export type MutationUnregisterWebhooksArgs = {
  inputs: Array<WebhookUnregisterInput>;
};


export type MutationUpdateMyUserArgs = {
  input: UserInput;
};


export type MutationUpdateProductsInProductGroupArgs = {
  productGroupId: Scalars['GlobalId']['input'];
  productIds: Array<Scalars['GlobalId']['input']>;
};


export type MutationUpdateSessionArgs = {
  addedToBasket: Scalars['Boolean']['input'];
  basketCurrencyCode: CurrencyCode;
  basketValue: Scalars['Float']['input'];
  id: Scalars['GlobalId']['input'];
  interactions: Scalars['Int']['input'];
  salesAssistantId?: InputMaybe<Scalars['GlobalId']['input']>;
};


export type MutationUpsertCloudshelvesArgs = {
  input: Array<CloudshelfInput>;
};


export type MutationUpsertDevicesArgs = {
  input: Array<DeviceInput>;
};


export type MutationUpsertLocationsArgs = {
  input: Array<LocationInput>;
};


export type MutationUpsertOrdersArgs = {
  input: Array<OrderInput>;
};


export type MutationUpsertOrganisationArgs = {
  input: OrganisationInput;
};


export type MutationUpsertProductGroupsArgs = {
  input: Array<ProductGroupInput>;
};


export type MutationUpsertProductVariantsArgs = {
  inputs: Array<ProductVariantInput>;
  productId: Scalars['ID']['input'];
};


export type MutationUpsertProductsArgs = {
  input: Array<ProductInput>;
};


export type MutationUpsertShopifyOrganisationArgs = {
  hmac: Scalars['String']['input'];
  input: ShopifyStoreInput;
  nonce: Scalars['String']['input'];
};


export type MutationUpsertThemeArgs = {
  input: ThemeInput;
};

/** Represents a a background processing job */
export type NobleTask = {
  __typename?: 'NobleTask';
  beingProcessedBy?: Maybe<Scalars['String']['output']>;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  data?: Maybe<NobleTaskDataUnion>;
  errors: Array<Scalars['String']['output']>;
  failed: Scalars['Boolean']['output'];
  /** The time this job started */
  finishTime: Scalars['DateTime']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  isComplete: Scalars['Boolean']['output'];
  logMessages: Array<Scalars['String']['output']>;
  organisationId?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Float']['output'];
  processingOnInstance?: Maybe<Scalars['String']['output']>;
  retries: Scalars['Float']['output'];
  /** The date time this job is schedule to run at. Note that this is not a guaranteed time, its simple the earliest it can run. */
  scheduledStart: Scalars['DateTime']['output'];
  /** The time this job started */
  startTime: Scalars['DateTime']['output'];
  status: NobleTaskStatus;
  taskType: NobleTaskType;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type NobleTaskDataUnion = FilterExtractionJobData;

export type NobleTaskEdge = {
  __typename?: 'NobleTaskEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The NobleTask entity */
  node?: Maybe<NobleTask>;
};

export type NobleTaskPageInfo = {
  __typename?: 'NobleTaskPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type NobleTaskResponse = {
  __typename?: 'NobleTaskResponse';
  edges?: Maybe<Array<NobleTaskEdge>>;
  pageInfo?: Maybe<NobleTaskPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export enum NobleTaskStatus {
  All = 'All',
  Complete = 'Complete',
  Failed = 'Failed',
  InProgress = 'InProgress',
  Pending = 'Pending'
}

export enum NobleTaskType {
  Debug = 'Debug',
  DebugError = 'DebugError',
  FilterExtraction = 'FilterExtraction',
  ImageProcessing = 'ImageProcessing',
  StorefinderSearch = 'StorefinderSearch',
  WappalyzerQuery = 'WappalyzerQuery'
}

export enum NonInteractiveCollectionType {
  Cheapest = 'CHEAPEST',
  MostExpensive = 'MOST_EXPENSIVE',
  Random = 'RANDOM',
  Recent = 'RECENT'
}

export type Order = {
  __typename?: 'Order';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  deviceId: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  discountCode?: Maybe<Scalars['String']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  lines: Array<OrderLine>;
  locationId: Scalars['String']['output'];
  locationName: Scalars['String']['output'];
  owningOrganisation: Organisation;
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  session?: Maybe<Session>;
  status: OrderStatus;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type OrderEdge = {
  __typename?: 'OrderEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Order entity */
  node?: Maybe<Order>;
};

export type OrderInput = {
  /** The GlobalID of the device this order was created at */
  deviceId?: InputMaybe<Scalars['GlobalId']['input']>;
  /** The discount code that was used on this order */
  discountCode?: InputMaybe<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** An array of lines that make up this order */
  lines?: InputMaybe<Array<OrderLineInput>>;
  /** The GlobalID of the location this order was created at */
  locationId?: InputMaybe<Scalars['GlobalId']['input']>;
  status?: InputMaybe<OrderStatus>;
};

export type OrderLine = {
  __typename?: 'OrderLine';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  currencyCode: CurrencyCode;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  order: Order;
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  platformProvidedProductId?: Maybe<Scalars['GlobalId']['output']>;
  platformProvidedProductVariantId?: Maybe<Scalars['GlobalId']['output']>;
  price: Scalars['Float']['output'];
  productId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  productVariantId: Scalars['String']['output'];
  productVariantName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type OrderLineInput = {
  currencyCode: CurrencyCode;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  price: Scalars['Float']['input'];
  /** The GlobalID of the product this order line is for */
  productID?: InputMaybe<Scalars['GlobalId']['input']>;
  /** The GlobalID of the product variant this order line is for */
  productVariantID?: InputMaybe<Scalars['GlobalId']['input']>;
  quantity: Scalars['Int']['input'];
};

export type OrderPageInfo = {
  __typename?: 'OrderPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type OrderPaginatedPayload = {
  __typename?: 'OrderPaginatedPayload';
  edges?: Maybe<Array<OrderEdge>>;
  pageInfo?: Maybe<OrderPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

/** The status of the order */
export enum OrderStatus {
  /** The order is a draft basket */
  DraftBasket = 'DRAFT_BASKET',
  /** The order has been partially refunded */
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  /** The order has been placed & paid for */
  Placed = 'PLACED',
  /** The order has been fully refunded */
  Refunded = 'REFUNDED'
}

export type OrderUpsertPayload = {
  __typename?: 'OrderUpsertPayload';
  /** An array of Orders that were created or updated */
  orders: Array<Order>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

/** This object represents an organisation, usually a retailer. This object owns all the other data in the system for a given organisation. */
export type Organisation = {
  __typename?: 'Organisation';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Returns the latest subscription (or null if the organisation has never subscribed) */
  currentSubscription?: Maybe<SubscriptionRecord>;
  /** The display name for the organisation. */
  displayName: Scalars['String']['output'];
  /** The domain name for the organisation. */
  domainName: Scalars['String']['output'];
  eCommercePlatform: ECommercePlatform;
  /** An array of KeyValuePairs which contain the configuration for the eCommerce platform. This is used to store any additional data required for the eCommerce platform. */
  eCommercePlatformConfiguration: Array<KeyValuePair>;
  /** The display name for the eCommerce platform, this is used for display purposes only when eCommercePlatform is custom. */
  eCommercePlatformDisplayName: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  installCompleted: Scalars['Boolean']['output'];
  installInformation: InstallInformation;
  installSurveyAnswers?: Maybe<Scalars['String']['output']>;
  /** The locations which belong to this organisation. */
  locations: Array<Location>;
  /** The orders which belong to this organisation. */
  orders: Array<Order>;
  /** The product groups which belong to this organisation. */
  productGroups: Array<ProductGroup>;
  /** The products which belong to this organisation. */
  products: Array<Product>;
  salesAssistantClearRule: ClearSalesAssistantRule;
  salesAssistantNameRule: SalesAssistantNameRule;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  users: Array<User>;
};

export type OrganisationEdge = {
  __typename?: 'OrganisationEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Organisation entity */
  node?: Maybe<Organisation>;
};

export type OrganisationInput = {
  /** The display name of the organisation */
  displayName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['GlobalId']['input'];
};

export type OrganisationPageInfo = {
  __typename?: 'OrganisationPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type OrganisationPaginatedPayload = {
  __typename?: 'OrganisationPaginatedPayload';
  edges?: Maybe<Array<OrganisationEdge>>;
  pageInfo?: Maybe<OrganisationPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type OrganisationUpsertPayload = {
  __typename?: 'OrganisationUpsertPayload';
  /** The Organisation that has been updated */
  organisation?: Maybe<Organisation>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

export type PdpBlockInput = {
  blockType: PdpBlockType;
  displayName: Scalars['String']['input'];
  id: Scalars['GlobalId']['input'];
  metadataDisplayType?: InputMaybe<PdpMetadataDisplayType>;
  metadataKey?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
  productDataType?: InputMaybe<PdpProductDataType>;
  removeThemeShortcodes?: InputMaybe<Scalars['Boolean']['input']>;
  style: PdpBlockStyle;
};

export enum PdpBlockStyle {
  Collapsible = 'COLLAPSIBLE',
  Expandable = 'EXPANDABLE',
  Static = 'STATIC'
}

export enum PdpBlockType {
  Description = 'DESCRIPTION',
  Metadata = 'METADATA',
  ProductData = 'PRODUCT_DATA',
  Spacer = 'SPACER'
}

export type PdpBlockUnion = PdpDescriptionBlock | PdpMetadataBlock | PdpProductDataBlock | PdpSpacerBlock;

export type PdpDescriptionBlock = {
  __typename?: 'PDPDescriptionBlock';
  blockType: PdpBlockType;
  displayName: Scalars['String']['output'];
  id: Scalars['GlobalId']['output'];
  position: Scalars['Float']['output'];
  removeThemeShortcodes?: Maybe<Scalars['Boolean']['output']>;
  style: PdpBlockStyle;
};

export type PdpMetadataBlock = {
  __typename?: 'PDPMetadataBlock';
  blockType: PdpBlockType;
  displayName: Scalars['String']['output'];
  displayType?: Maybe<PdpMetadataDisplayType>;
  id: Scalars['GlobalId']['output'];
  key?: Maybe<Scalars['String']['output']>;
  position: Scalars['Float']['output'];
  style: PdpBlockStyle;
};

export enum PdpMetadataDisplayType {
  Image = 'IMAGE',
  Text = 'TEXT',
  YoutubeVideo = 'YOUTUBE_VIDEO'
}

export type PdpProductDataBlock = {
  __typename?: 'PDPProductDataBlock';
  blockType: PdpBlockType;
  displayName: Scalars['String']['output'];
  id: Scalars['GlobalId']['output'];
  position: Scalars['Float']['output'];
  productDataType?: Maybe<PdpProductDataType>;
  style: PdpBlockStyle;
};

export enum PdpProductDataType {
  Sku = 'SKU',
  Vendor = 'VENDOR'
}

export type PdpSpacerBlock = {
  __typename?: 'PDPSpacerBlock';
  blockType: PdpBlockType;
  displayName: Scalars['String']['output'];
  id: Scalars['GlobalId']['output'];
  position: Scalars['Float']['output'];
  style: PdpBlockStyle;
};

export enum PowerTileBackgroundType {
  Gradient = 'GRADIENT',
  Image = 'IMAGE',
  SolidColour = 'SOLID_COLOUR',
  Transparent = 'TRANSPARENT'
}

/** This object represents a product, which will always contain at least one variant */
export type Product = {
  __typename?: 'Product';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The description of the product */
  description?: Maybe<Scalars['String']['output']>;
  /** The name of the product. */
  displayName: Scalars['String']['output'];
  /** The handle of the product, which is the original display name in all lower case, and with all non-alphanumeric characters removed and spaces replaced with hyphens. */
  handle: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** Additional data about this entity. */
  metadata: Array<Metadata>;
  /** The organisation which owns this entity. */
  owningOrganisation: Organisation;
  /** An externally provided GlobalId */
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  /** An array of product groups which this product is a member of */
  productGroups: Array<ProductGroup>;
  /** The type of the product. */
  productType?: Maybe<Scalars['String']['output']>;
  /** An array of product variants which are associated with this product */
  productVariants: Array<ProductVariant>;
  /** An array of tags which are associated with the product */
  tags: Array<Scalars['String']['output']>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** The vendor of the product. Usually used for the Brand Name */
  vendor?: Maybe<Scalars['String']['output']>;
};

export type ProductDeletePayload = {
  __typename?: 'ProductDeletePayload';
  /** An array of Products that were deleted */
  products: Array<Product>;
  /** An array of errors that occurred during the delete operation */
  userErrors: Array<UserError>;
};

export type ProductEdge = {
  __typename?: 'ProductEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Product entity */
  node?: Maybe<Product>;
};

/** A group of products, usually a category or a brand. */
export type ProductGroup = {
  __typename?: 'ProductGroup';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The name of the product group. */
  displayName: Scalars['String']['output'];
  featuredImage?: Maybe<Scalars['String']['output']>;
  /** The handle of the product, which is the original display name in all lower case, and with all non-alphanumeric characters removed and spaces replaced with hyphens. */
  handle: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** A boolean value indicating whether this is the internal all product group contains all products in the organisation. */
  isAllProductGroup: Scalars['Boolean']['output'];
  /** Additional data about this entity. */
  metadata: Array<Metadata>;
  /** The organisation which owns this entity. */
  owningOrganisation: Organisation;
  /** An externally provided GlobalId */
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  productCount: Scalars['Int']['output'];
  /** The products which are members of this product group */
  products: Array<Product>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductGroupDeletePayload = {
  __typename?: 'ProductGroupDeletePayload';
  /** An array of ProductGroups that were deleted */
  productGroups: Array<ProductGroup>;
  /** An array of errors that occurred during the delete operation */
  userErrors: Array<UserError>;
};

export type ProductGroupEdge = {
  __typename?: 'ProductGroupEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The ProductGroup entity */
  node?: Maybe<ProductGroup>;
};

export type ProductGroupInput = {
  /** The display name of the product group */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** The featured image of the product group */
  featuredImage?: InputMaybe<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** An array of metadata to attach to the product group */
  metadata?: InputMaybe<Array<MetadataInput>>;
};

export type ProductGroupPageInfo = {
  __typename?: 'ProductGroupPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ProductGroupPaginatedPayload = {
  __typename?: 'ProductGroupPaginatedPayload';
  edges?: Maybe<Array<ProductGroupEdge>>;
  pageInfo?: Maybe<ProductGroupPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type ProductGroupUpsertPayload = {
  __typename?: 'ProductGroupUpsertPayload';
  /** An array of ProductGroups that were created or updated */
  productGroups: Array<ProductGroup>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

export type ProductInput = {
  /** The description of the product */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The display name of the product */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** An array of metadata to attach to the product group */
  metadata?: InputMaybe<Array<MetadataInput>>;
  /** The type of the product */
  productType?: InputMaybe<Scalars['String']['input']>;
  /** An array of tags to attach to the product */
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The vendor of the product */
  vendor?: InputMaybe<Scalars['String']['input']>;
};

export type ProductPageInfo = {
  __typename?: 'ProductPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ProductPaginatedPayload = {
  __typename?: 'ProductPaginatedPayload';
  edges?: Maybe<Array<ProductEdge>>;
  pageInfo?: Maybe<ProductPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type ProductUpsertPayload = {
  __typename?: 'ProductUpsertPayload';
  /** An array of Products that were created or updated */
  products: Array<Product>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

/** This object represents a variant of a product. */
export type ProductVariant = {
  __typename?: 'ProductVariant';
  attributes: Array<KeyValuePair>;
  /** Whether this variant is available to purchase. */
  availableToPurchase: Scalars['Boolean']['output'];
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  currentPrice: Scalars['Float']['output'];
  /** The name of the variant */
  displayName?: Maybe<Scalars['String']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** Whether this variant is in stock. */
  isInStock: Scalars['Boolean']['output'];
  /** Additional data about this entity. */
  metadata: Array<Metadata>;
  /** Images related this variant */
  metaimages: Array<Metaimage>;
  originalPrice: Scalars['Float']['output'];
  /** An externally provided GlobalId */
  platformProvidedId?: Maybe<Scalars['GlobalId']['output']>;
  /** The product which this variant belongs to. */
  product: Product;
  sku?: Maybe<Scalars['String']['output']>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductVariantInput = {
  /** An array of additional URLs of images of the product variant */
  additionalImages?: InputMaybe<Array<Scalars['String']['input']>>;
  /** An array of attributes of the product variant */
  attributes?: InputMaybe<Array<KeyValuePairInput>>;
  /** Whether the product variant is available to purchase */
  availableToPurchase?: InputMaybe<Scalars['Boolean']['input']>;
  /** The current price of the product variant */
  currentPrice?: InputMaybe<Scalars['Float']['input']>;
  /** The display name of the product variant */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** The URL of the featured image of the product variant */
  featuredImage?: InputMaybe<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** Whether the product variant is in stock */
  isInStock?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array of metadata to attach to the product variant */
  metadata?: InputMaybe<Array<MetadataInput>>;
  /** The original price of the product. If the product variant is not discounted, this should equal the original price */
  originalPrice?: InputMaybe<Scalars['Float']['input']>;
  /** The SKU of the product variant */
  sku?: InputMaybe<Scalars['String']['input']>;
};

export type ProductVariantUpsertPayload = {
  __typename?: 'ProductVariantUpsertPayload';
  /** An array of ProductVariants that were created or updated */
  productVariants: Array<ProductVariant>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

export type PublicDevicePayload = {
  __typename?: 'PublicDevicePayload';
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  ownerId?: Maybe<Scalars['GlobalId']['output']>;
  ownerName?: Maybe<Scalars['String']['output']>;
  registered: Scalars['Boolean']['output'];
  registrationCode: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Returns an array of PDP Blocks that are available to add to the PDP */
  availablePDPBlocks: Array<IncludablePdpBlock>;
  /** Returns a boolean value which indicates if the organisation can register a new device */
  canRegisterDevice: Scalars['Boolean']['output'];
  /** Returns a Cloudshelf entity */
  cloudshelf?: Maybe<Cloudshelf>;
  cloudshelfEnginePayload: CloudshelfEnginePayload;
  /** Returns a paginated array of Cloudshelves */
  cloudshelves: CloudshelfPaginatedPayload;
  /** An internal function for swapping a Shopify Session Token for a Cloudshelf Authentication Token. */
  customTokenFromShopifySessionToken: Scalars['String']['output'];
  /** Returns a Device entity */
  device?: Maybe<Device>;
  /** Returns a paginated array of Devices. */
  devices: DevicePaginatedPayload;
  engineProducts: EngineProductWithAdditionalInfoPayload;
  /** Returns a Filter entity */
  filter?: Maybe<Filter>;
  getVersionByType: KnownVersion;
  /** Returns all filters that can possibly be included in the Cloudshelf */
  includeableFilters: Array<CloudshelfIncludableFilter>;
  isInMaintenanceMode: Scalars['Boolean']['output'];
  isNobleEnabled: Scalars['Boolean']['output'];
  /** Returns a location entity */
  location?: Maybe<Location>;
  /** Returns a paginated array of locations */
  locations: LocationPaginatedPayload;
  /** Returns the currently authenticated user. */
  me: User;
  nobleQueues: Array<TaskQueue>;
  /** Returns an Order entity. */
  order?: Maybe<Order>;
  /** Returns a paginated array of Order entities */
  orders: OrderPaginatedPayload;
  /** Returns an Organisation entity */
  organisation?: Maybe<Organisation>;
  /** Returns a paginated array of organisations */
  organisations: OrganisationPaginatedPayload;
  pausedNobleQueues: Array<NobleTaskType>;
  /** Returns a Product entity. */
  product?: Maybe<Product>;
  /** Returns a Product Group */
  productGroup?: Maybe<ProductGroup>;
  /** Returns a paginated array of product groups */
  productGroups: ProductGroupPaginatedPayload;
  /** Returns a paginated array of Product entities. */
  products: ProductPaginatedPayload;
  /** Returns public information about a device */
  publicDevice?: Maybe<PublicDevicePayload>;
  /** Returns a subscription entity */
  subscription?: Maybe<SubscriptionRecord>;
  /** This is an internal function. This function is not intended to be included in the final release. Only exists due to CS-1273 */
  subscriptionCurrentOrg?: Maybe<SubscriptionRecord>;
  /** Returns a list of currently available subscription plans */
  subscriptionPlans?: Maybe<Array<SubscriptionPlan>>;
  /** Returns a theme entity */
  theme?: Maybe<Theme>;
  /** Returns a paginated array of Themes */
  themes: ThemePaginatedPayload;
  /** Returns a User entity */
  user: User;
  /** Query a webhook by ID */
  webhook?: Maybe<Webhook>;
  /** Query the list of registered webhooks */
  webhooks: WebhookPaginatedPayload;
};


export type QueryAvailablePdpBlocksArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryCloudshelfArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryCloudshelfEnginePayloadArgs = {
  engineVersion?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['GlobalId']['input'];
  payloadType: CloudshelfPayloadType;
  reportPageLoad?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCloudshelvesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCustomTokenFromShopifySessionTokenArgs = {
  sessionToken: Scalars['String']['input'];
};


export type QueryDeviceArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryDevicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEngineProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cloudshelfId: Scalars['GlobalId']['input'];
  explicitProductHandle?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeMetafieldNamespaces?: InputMaybe<Array<Scalars['String']['input']>>;
  isDisplayMode: Scalars['Boolean']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFilterArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryGetVersionByTypeArgs = {
  type: VersionType;
};


export type QueryIncludeableFiltersArgs = {
  cloudshelfId: Scalars['GlobalId']['input'];
};


export type QueryLocationArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryLocationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganisationArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryOrganisationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryProductGroupArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryProductGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
};


export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPublicDeviceArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QuerySubscriptionArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryThemeArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryThemesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
  textSearch?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryWebhookArgs = {
  id: Scalars['GlobalId']['input'];
};


export type QueryWebhooksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<SortOptionsInput>;
};

export enum SalesAssistantNameRule {
  FirstName = 'FIRST_NAME',
  FullName = 'FULL_NAME',
  Reference = 'REFERENCE'
}

/** This object represents a session that took place on a Cloudshelf */
export type Session = {
  __typename?: 'Session';
  addedAnythingToBasket: Scalars['Boolean']['output'];
  basketCurrencyCode: CurrencyCode;
  basketValue: Scalars['DeweyDecimal']['output'];
  cloudshelfId: Scalars['String']['output'];
  cloudshelfName: Scalars['String']['output'];
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  deviceId: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  /** The date and time that this session ended at. */
  endedAt?: Maybe<Scalars['DateTime']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  /** The number of interactions that took place in this session */
  interactionCount: Scalars['Int']['output'];
  latitude?: Maybe<Scalars['Latitude']['output']>;
  locationId: Scalars['String']['output'];
  locationName: Scalars['String']['output'];
  longitude?: Maybe<Scalars['Longitude']['output']>;
  order?: Maybe<Order>;
  /** The organisation which owns this entity. */
  owningOrganisation: Organisation;
  /** The static of the session */
  status: SessionStatus;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export enum SessionStatus {
  Complete = 'COMPLETE',
  Invalid = 'INVALID',
  InProgress = 'IN_PROGRESS'
}

export type ShopifyStoreInput = {
  /** Shopify access token for the store */
  accessToken?: InputMaybe<Scalars['String']['input']>;
  /** The display name of the organisation */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** Domain of the shopify store */
  domain?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** Shopify storefront access token for the store */
  storefrontAccessToken?: InputMaybe<Scalars['String']['input']>;
};

export enum Size {
  Large = 'LARGE',
  Regular = 'REGULAR',
  Small = 'SMALL'
}

export type SortOptionsInput = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

/** Allow ordering a query's results */
export enum SortOrder {
  /** Sort in ascending order */
  Asc = 'ASC',
  /** Sort in descending order */
  Desc = 'DESC'
}

export type SubscriptionFeaturesInput = {
  accessToDisplayScheduling?: InputMaybe<Scalars['Boolean']['input']>;
  accessToImageBanners?: InputMaybe<Scalars['Boolean']['input']>;
  accessToProductCustomisation?: InputMaybe<Scalars['Boolean']['input']>;
  accessToSalesPersonAttribution?: InputMaybe<Scalars['Boolean']['input']>;
  accessToStoreAttribution?: InputMaybe<Scalars['Boolean']['input']>;
  accessToVideoBanners?: InputMaybe<Scalars['Boolean']['input']>;
  bypassEcommerceProvider?: InputMaybe<Scalars['Boolean']['input']>;
  canRemoveCloudshelfBranding?: InputMaybe<Scalars['Boolean']['input']>;
  devicesPerLocation?: InputMaybe<Scalars['Float']['input']>;
  freeLocations?: InputMaybe<Scalars['Float']['input']>;
  hubspotDealNumber?: InputMaybe<Scalars['String']['input']>;
  liveLocations: Scalars['Float']['input'];
  overridePrice?: InputMaybe<Scalars['Float']['input']>;
  planId: Scalars['String']['input'];
};

export enum SubscriptionInterval {
  Annually = 'ANNUALLY',
  Monthly = 'MONTHLY'
}

export type SubscriptionPlan = {
  __typename?: 'SubscriptionPlan';
  accessToDisplayScheduling: Scalars['Boolean']['output'];
  accessToImageBanners: Scalars['Boolean']['output'];
  accessToProductCustomisation: Scalars['Boolean']['output'];
  accessToSalesPersonAttribution: Scalars['Boolean']['output'];
  accessToStoreAttribution: Scalars['Boolean']['output'];
  accessToVideoBanners: Scalars['Boolean']['output'];
  cloudshelfBranded: Scalars['Boolean']['output'];
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  displayOrder: Scalars['Int']['output'];
  englishDisplayName: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  information: Array<Scalars['String']['output']>;
  maxNumDevicesPerLocation: Scalars['Int']['output'];
  pricePerMonthPerLocation: Scalars['Float']['output'];
  retailerCanSelectThisPlan: Scalars['Boolean']['output'];
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type SubscriptionPlanUsage = {
  __typename?: 'SubscriptionPlanUsage';
  id: Scalars['String']['output'];
  numberOfAllocatedLocations: Scalars['Int']['output'];
  numberOfLiveDevices: Scalars['Int']['output'];
};

export type SubscriptionRecord = {
  __typename?: 'SubscriptionRecord';
  accessToDisplayScheduling: Scalars['Boolean']['output'];
  accessToImageBanners: Scalars['Boolean']['output'];
  accessToProductCustomisation: Scalars['Boolean']['output'];
  accessToSalesPersonAttribution: Scalars['Boolean']['output'];
  accessToStoreAttribution: Scalars['Boolean']['output'];
  accessToVideoBanners: Scalars['Boolean']['output'];
  amountUSD: Scalars['Float']['output'];
  billingInterval: SubscriptionInterval;
  canRemoveCloudshelfBranding: Scalars['Boolean']['output'];
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  devicesPerLocation: Scalars['Int']['output'];
  hubspotDealNumber?: Maybe<Scalars['String']['output']>;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  liveLocations: Scalars['Int']['output'];
  owningOrganisation: Organisation;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  /** The third party ID for the subscription. For a shopify retailer, this will be the shopify subscription gid. */
  thirdPartyId?: Maybe<Scalars['String']['output']>;
  type: SubscriptionType;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  usage: SubscriptionPlanUsage;
};

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  Frozen = 'FROZEN'
}

export enum SubscriptionType {
  Custom = 'CUSTOM',
  Plan = 'PLAN',
  Unknown = 'UNKNOWN'
}

export type Swatch = {
  __typename?: 'Swatch';
  displayName: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
};

export type SwatchInput = {
  displayName: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
};

export type TaskQueue = {
  __typename?: 'TaskQueue';
  activeWorkers: Scalars['Int']['output'];
  concurrency: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  noTasksDelay: Scalars['Float']['output'];
  retries: Scalars['Float']['output'];
  taskDelay: Scalars['Float']['output'];
  taskType: NobleTaskType;
  tasks: NobleTaskResponse;
};

/** This object represents a theme, which is a collection of styles and fonts that can be applied to a Cloudshelf. */
export type Theme = {
  __typename?: 'Theme';
  bodyFont: ThemeFont;
  /** An array of Cloudshelves that use this theme. */
  cloudshelves: Array<Cloudshelf>;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The name of the theme. */
  displayName: Scalars['String']['output'];
  headingFont: ThemeFont;
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  imageAnchor: ImageAnchor;
  /** The logo URL for the organisations logo */
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** The colour of the main text. */
  mainTextColor: Scalars['String']['output'];
  /** The organisation that owns this theme. */
  owningOrganisation: Organisation;
  /** The primary colour of the theme. */
  primaryColor: Scalars['String']['output'];
  /** The colour of the purchase button. */
  purchaseColor: Scalars['String']['output'];
  radius: ThemeRadius;
  /** A boolean value indicating whether or not the Cloudshelf branding should be removed. */
  removeCloudshelfBranding: Scalars['Boolean']['output'];
  subheadingFont: ThemeFont;
  tileSizeModifier: Scalars['Float']['output'];
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};

export type ThemeDeletePayload = {
  __typename?: 'ThemeDeletePayload';
  /** An array of Themes that were deleted */
  themes: Array<Theme>;
  /** An array of errors that occurred during the delete operation */
  userErrors: Array<UserError>;
};

export type ThemeEdge = {
  __typename?: 'ThemeEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Theme entity */
  node?: Maybe<Theme>;
};

export type ThemeFont = {
  __typename?: 'ThemeFont';
  fontFamily: Scalars['String']['output'];
  fontFamilyCDN?: Maybe<Scalars['String']['output']>;
  fontWeightDisplay: Scalars['String']['output'];
  fontWeightIsCustom: Scalars['Boolean']['output'];
  fontWeightValue: Scalars['String']['output'];
  isCustomFont: Scalars['Boolean']['output'];
};

export type ThemeFontInput = {
  fontFamily?: Scalars['String']['input'];
  fontFamilyCDN?: InputMaybe<Scalars['String']['input']>;
  fontWeightDisplay: Scalars['String']['input'];
  fontWeightIsCustom: Scalars['Boolean']['input'];
  fontWeightValue: Scalars['String']['input'];
  isCustomFont?: Scalars['Boolean']['input'];
};

export type ThemeInput = {
  blocksRounded?: InputMaybe<Scalars['Boolean']['input']>;
  bodyFont?: InputMaybe<ThemeFontInput>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  headingFont?: InputMaybe<ThemeFontInput>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  inputsRounded?: InputMaybe<Scalars['Boolean']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  mainTextColor?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  purchaseColor?: InputMaybe<Scalars['String']['input']>;
  removeCloudshelfBranding?: InputMaybe<Scalars['Boolean']['input']>;
  subheadingFont?: InputMaybe<ThemeFontInput>;
};

export type ThemePageInfo = {
  __typename?: 'ThemePageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ThemePaginatedPayload = {
  __typename?: 'ThemePaginatedPayload';
  edges?: Maybe<Array<ThemeEdge>>;
  pageInfo?: Maybe<ThemePageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type ThemeRadius = {
  __typename?: 'ThemeRadius';
  drawer: Scalars['Float']['output'];
  inputs: Scalars['Float']['output'];
  modal: Scalars['Float']['output'];
  tiles: Scalars['Float']['output'];
};

export type ThemeUpsertPayload = {
  __typename?: 'ThemeUpsertPayload';
  /** The theme that was created or updated */
  theme?: Maybe<Theme>;
  /** An array of errors that occurred during the upsert operation */
  userErrors: Array<UserError>;
};

export enum TouchIndicator {
  BouncingArrow = 'BOUNCING_ARROW',
  ClassicHandPointer = 'CLASSIC_HAND_POINTER',
  None = 'NONE'
}

export type User = {
  __typename?: 'User';
  actingAs?: Maybe<UserOrganisationAccess>;
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firebaseIdentifier?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  lastAccess?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  metadata: Array<Metadata>;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  userOrganisationAccessRights: Array<UserOrganisationAccess>;
};

export type UserError = {
  __typename?: 'UserError';
  /** An error code that can be used to programmatically identify the error */
  code: UserErrorCode;
  /** This field provides more explicit information about the error */
  message: Scalars['String']['output'];
};

/** A high level error code which is used to indicate the type of error that has occurred. For more information see the message field. */
export enum UserErrorCode {
  /** The data provided for the given upsert function was missing and is required for entity creation */
  EntityCreationMissingField = 'ENTITY_CREATION_MISSING_FIELD',
  /** The data provided for the given upsert function was invalid for entity creation or updating */
  EntityInvalidField = 'ENTITY_INVALID_FIELD',
  EntityNotFound = 'ENTITY_NOT_FOUND',
  /** An error occurred while attempting to upload an image */
  ImageUploadError = 'IMAGE_UPLOAD_ERROR',
  InvalidArgument = 'INVALID_ARGUMENT',
  InvalidHmac = 'INVALID_HMAC',
  UnknownError = 'UNKNOWN_ERROR'
}

export type UserInput = {
  /** The first name of the user */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Use this field to provide either a Cloudshelf gid, or your own external gid. If the external gid already exists, the existing record will be updated. If the external gid does not exist, a new record will be created. */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** The last name of the user */
  lastName?: InputMaybe<Scalars['String']['input']>;
};

export type UserOrganisationAccess = {
  __typename?: 'UserOrganisationAccess';
  apiKey?: Maybe<Scalars['String']['output']>;
  hasAdminAccess: Scalars['Boolean']['output'];
  hasDeleteAccess: Scalars['Boolean']['output'];
  hasManagerAccess: Scalars['Boolean']['output'];
  hasWriteAccess: Scalars['Boolean']['output'];
  id: Scalars['GlobalId']['output'];
  isSalesAssistant: Scalars['Boolean']['output'];
  organisation: Organisation;
  reference?: Maybe<Scalars['String']['output']>;
  user: User;
};

export enum VersionType {
  Backend = 'BACKEND',
  Engine = 'ENGINE',
  Manager = 'MANAGER',
  Storefinder = 'STOREFINDER',
  Worker = 'WORKER'
}

export enum VisibilityType {
  CloudshelfInternal = 'CLOUDSHELF_INTERNAL',
  Retailer = 'RETAILER'
}

export type Webhook = {
  __typename?: 'Webhook';
  /** The date and time this entity was created. */
  createdAt: Scalars['DateTime']['output'];
  /** A unique internal GlobalId for this entity. */
  id: Scalars['GlobalId']['output'];
  owningOrganisation: Organisation;
  subject: WebhookSubject;
  /** The date and time this entity was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** The URL to send the webhook payload to */
  url: Scalars['String']['output'];
};

export type WebhookEdge = {
  __typename?: 'WebhookEdge';
  /** The cursor for provided node to be used in pagination */
  cursor?: Maybe<Scalars['String']['output']>;
  /** The Webhook entity */
  node?: Maybe<Webhook>;
};

export type WebhookPageInfo = {
  __typename?: 'WebhookPageInfo';
  /** The cursor for the last node in the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether or not there is a another page of data */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether or not there is a previous page of data */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor for the first node in the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type WebhookPaginatedPayload = {
  __typename?: 'WebhookPaginatedPayload';
  edges?: Maybe<Array<WebhookEdge>>;
  pageInfo?: Maybe<WebhookPageInfo>;
  /** The total number of items available */
  totalCount: Scalars['Int']['output'];
};

export type WebhookRegisterInput = {
  subject: WebhookSubject;
  url: Scalars['String']['input'];
};

export type WebhookRegisterPayload = {
  __typename?: 'WebhookRegisterPayload';
  /** An array of errors that occurred during the registration of the webhook */
  userErrors: Array<UserError>;
  /** The registered webhooks */
  webhooks: Array<Webhook>;
};

/** A subject for a webhook */
export enum WebhookSubject {
  ProductUpsert = 'ProductUpsert'
}

/** Input for unregistering webhooks. ID or subject must be provided. If ID is provided, only the webhook with the given ID will be unregistered. If subject is provided, all webhooks for that subject will be unregistered. */
export type WebhookUnregisterInput = {
  /** The ID of the webhook to unregister, if subject is not provided */
  id?: InputMaybe<Scalars['GlobalId']['input']>;
  /** The subject to unregister from, if ID is not provided */
  subject?: InputMaybe<WebhookSubject>;
};


export const ExchangeTokenDocument = gql`
    query ExchangeToken($token: String!) {
  customTokenFromShopifySessionToken(sessionToken: $token)
}
    `;
export const UpsertStoreDocument = gql`
    mutation UpsertStore($input: ShopifyStoreInput!, $hmac: String!, $nonce: String!) {
  upsertShopifyOrganisation(input: $input, hmac: $hmac, nonce: $nonce) {
    organisation {
      id
    }
    userErrors {
      message
      code
    }
  }
}
    `;
export const ProductsTestDocument = gql`
    query ProductsTest {
  products(first: 3) {
    edges {
      node {
        id
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
  }
}
    `;
export type ExchangeTokenQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type ExchangeTokenQuery = { __typename?: 'Query', customTokenFromShopifySessionToken: string };

export type UpsertStoreMutationVariables = Exact<{
  input: ShopifyStoreInput;
  hmac: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
}>;


export type UpsertStoreMutation = { __typename?: 'Mutation', upsertShopifyOrganisation: { __typename?: 'OrganisationUpsertPayload', organisation?: { __typename?: 'Organisation', id: any } | null, userErrors: Array<{ __typename?: 'UserError', message: string, code: UserErrorCode }> } };

export type ProductsTestQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductsTestQuery = { __typename?: 'Query', products: { __typename?: 'ProductPaginatedPayload', edges?: Array<{ __typename?: 'ProductEdge', node?: { __typename?: 'Product', id: any } | null }> | null, pageInfo?: { __typename?: 'ProductPageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null } | null } };
