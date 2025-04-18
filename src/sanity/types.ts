/**
 * ---------------------------------------------------------------------------------
 * This file has been generated by Sanity TypeGen.
 * Command: `sanity typegen generate`
 *
 * Any modifications made directly to this file will be overwritten the next time
 * the TypeScript definitions are generated. Please make changes to the Sanity
 * schema definitions and/or GROQ queries if you need to update these types.
 *
 * For more information on how to use Sanity TypeGen, visit the official documentation:
 * https://www.sanity.io/docs/sanity-typegen
 * ---------------------------------------------------------------------------------
 */

// Source: schema.json
export type SanityImagePaletteSwatch = {
  _type: "sanity.imagePaletteSwatch";
  background?: string;
  foreground?: string;
  population?: number;
  title?: string;
};

export type SanityImagePalette = {
  _type: "sanity.imagePalette";
  darkMuted?: SanityImagePaletteSwatch;
  lightVibrant?: SanityImagePaletteSwatch;
  darkVibrant?: SanityImagePaletteSwatch;
  vibrant?: SanityImagePaletteSwatch;
  dominant?: SanityImagePaletteSwatch;
  lightMuted?: SanityImagePaletteSwatch;
  muted?: SanityImagePaletteSwatch;
};

export type SanityImageDimensions = {
  _type: "sanity.imageDimensions";
  height?: number;
  width?: number;
  aspectRatio?: number;
};

export type SanityFileAsset = {
  _id: string;
  _type: "sanity.fileAsset";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  originalFilename?: string;
  label?: string;
  title?: string;
  description?: string;
  altText?: string;
  sha1hash?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  assetId?: string;
  uploadId?: string;
  path?: string;
  url?: string;
  source?: SanityAssetSourceData;
};

export type Geopoint = {
  _type: "geopoint";
  lat?: number;
  lng?: number;
  alt?: number;
};

export type Slug = {
  _type: "slug";
  current?: string;
  source?: string;
};

export type Message = {
  _id: string;
  _type: "message";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  text?: string;
  isShown?: boolean;
  userName?: string;
  category?: "unknown" | "daily" | "extra";
  like?: boolean;
  shownAt?: string;
  creator?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "user";
  };
  shownBy?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "user";
  };
};

export type User = {
  _id: string;
  _type: "user";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  image?: {
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
  };
  name?: string;
  login?: string;
  password?: string;
  role?: "user" | "admin";
  partnerIdToSend?: string;
  phone?: string;
  dayMessageLimit?: number;
  partnerIdToReceiveFrom?: string;
};

export type SanityImageCrop = {
  _type: "sanity.imageCrop";
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type SanityImageHotspot = {
  _type: "sanity.imageHotspot";
  x?: number;
  y?: number;
  height?: number;
  width?: number;
};

export type SanityImageAsset = {
  _id: string;
  _type: "sanity.imageAsset";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  originalFilename?: string;
  label?: string;
  title?: string;
  description?: string;
  altText?: string;
  sha1hash?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  assetId?: string;
  uploadId?: string;
  path?: string;
  url?: string;
  metadata?: SanityImageMetadata;
  source?: SanityAssetSourceData;
};

export type SanityAssetSourceData = {
  _type: "sanity.assetSourceData";
  name?: string;
  id?: string;
  url?: string;
};

export type SanityImageMetadata = {
  _type: "sanity.imageMetadata";
  location?: Geopoint;
  dimensions?: SanityImageDimensions;
  palette?: SanityImagePalette;
  lqip?: string;
  blurHash?: string;
  hasAlpha?: boolean;
  isOpaque?: boolean;
};

export type AllSanitySchemaTypes = SanityImagePaletteSwatch | SanityImagePalette | SanityImageDimensions | SanityFileAsset | Geopoint | Slug | Message | User | SanityImageCrop | SanityImageHotspot | SanityImageAsset | SanityAssetSourceData | SanityImageMetadata;
export declare const internalGroqTypeReferenceTo: unique symbol;
// Source: ./src/sanity/lib/queries.ts
// Variable: SETTINGS_QUERY
// Query: *[_type == "settings"][0]{  _id,  contactNumber,  dailyMessageLimit}
export type SETTINGS_QUERYResult = null;
// Variable: ALL_MESSAGES_QUERY
// Query: *[_type == "message"] | order(lastShownAt desc) {  _id,  text,  category,  isShown,  like,  lastShownAt}
export type ALL_MESSAGES_QUERYResult = Array<{
  _id: string;
  text: string | null;
  category: "daily" | "extra" | "unknown" | null;
  isShown: boolean | null;
  like: boolean | null;
  lastShownAt: null;
}>;
// Variable: UNSHOWN_MESSAGES_QUERY
// Query: *[_type == "message" && isShown == false] {  _id,  text,  category}
export type UNSHOWN_MESSAGES_QUERYResult = Array<{
  _id: string;
  text: string | null;
  category: "daily" | "extra" | "unknown" | null;
}>;
// Variable: MESSAGES_BY_CATEGORY_QUERY
// Query: *[_type == "message" && category == $category] {  _id,  text,  isShown,  like,  lastShownAt}
export type MESSAGES_BY_CATEGORY_QUERYResult = Array<{
  _id: string;
  text: string | null;
  isShown: boolean | null;
  like: boolean | null;
  lastShownAt: null;
}>;
// Variable: LIKED_MESSAGES_QUERY
// Query: *[_type == "message" && like == true] | order(lastShownAt desc) {  _id,  text,  category,  lastShownAt}
export type LIKED_MESSAGES_QUERYResult = Array<{
  _id: string;
  text: string | null;
  category: "daily" | "extra" | "unknown" | null;
  lastShownAt: null;
}>;
// Variable: NEXT_DAILY_MESSAGE_QUERY
// Query: *[_type == "message" && isShown == false && category == "daily"][0] {  _id,  text,  category}
export type NEXT_DAILY_MESSAGE_QUERYResult = {
  _id: string;
  text: string | null;
  category: "daily" | "extra" | "unknown" | null;
} | null;
// Variable: NEXT_EXTRA_MESSAGE_QUERY
// Query: *[_type == "message" && isShown == false && category == "extra"][0] {  _id,  text,  category}
export type NEXT_EXTRA_MESSAGE_QUERYResult = {
  _id: string;
  text: string | null;
  category: "daily" | "extra" | "unknown" | null;
} | null;

// Query TypeMap
import "@sanity/client";
declare module "@sanity/client" {
  interface SanityQueries {
    "*[_type == \"settings\"][0]{\n  _id,\n  contactNumber,\n  dailyMessageLimit\n}": SETTINGS_QUERYResult;
    "*[_type == \"message\"] | order(lastShownAt desc) {\n  _id,\n  text,\n  category,\n  isShown,\n  like,\n  lastShownAt\n}": ALL_MESSAGES_QUERYResult;
    "*[_type == \"message\" && isShown == false] {\n  _id,\n  text,\n  category\n}": UNSHOWN_MESSAGES_QUERYResult;
    "*[_type == \"message\" && category == $category] {\n  _id,\n  text,\n  isShown,\n  like,\n  lastShownAt\n}": MESSAGES_BY_CATEGORY_QUERYResult;
    "*[_type == \"message\" && like == true] | order(lastShownAt desc) {\n  _id,\n  text,\n  category,\n  lastShownAt\n}": LIKED_MESSAGES_QUERYResult;
    "*[_type == \"message\" && isShown == false && category == \"daily\"][0] {\n  _id,\n  text,\n  category\n}": NEXT_DAILY_MESSAGE_QUERYResult;
    "*[_type == \"message\" && isShown == false && category == \"extra\"][0] {\n  _id,\n  text,\n  category\n}": NEXT_EXTRA_MESSAGE_QUERYResult;
  }
}
