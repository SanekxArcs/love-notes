import { defineQuery } from "next-sanity";

export const SETTINGS_QUERY = defineQuery(`*[_type == "settings"][0]{
  _id,
  contactNumber,
  dailyMessageLimit
}`);

export const ALL_MESSAGES_QUERY = defineQuery(`*[_type == "message"] | order(lastShownAt desc) {
  _id,
  text,
  category,
  isShown,
  like,
  lastShownAt
}`);

export const UNSHOWN_MESSAGES_QUERY = defineQuery(`*[_type == "message" && isShown == false] {
  _id,
  text,
  category
}`);

export const MESSAGES_BY_CATEGORY_QUERY = defineQuery(`*[_type == "message" && category == $category] {
  _id,
  text,
  isShown,
  like,
  lastShownAt
}`);

export const LIKED_MESSAGES_QUERY = defineQuery(`*[_type == "message" && like == true] | order(lastShownAt desc) {
  _id,
  text,
  category,
  lastShownAt
}`);

export const NEXT_DAILY_MESSAGE_QUERY = defineQuery(`*[_type == "message" && isShown == false && category == "daily"][0] {
  _id,
  text,
  category
}`);

export const NEXT_EXTRA_MESSAGE_QUERY = defineQuery(`*[_type == "message" && isShown == false && category == "extra"][0] {
  _id,
  text,
  category
}`);
