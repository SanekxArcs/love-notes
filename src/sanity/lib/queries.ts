import { defineQuery } from "next-sanity";



// SETTINGS QUERIES
export const SETTINGS_QUERY = defineQuery(`*[_type == "settings"][0]{
  _id,
  contactNumber,
  dailyMessageLimit
}`);

// MESSAGE QUERIES
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

// Get the next message to show (not shown yet, based on category)
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

// USER MESSAGE HISTORY QUERIES
export const USER_MESSAGE_HISTORY_QUERY = defineQuery(`*[_type == "userMessageHistory" && userId == $userId] | order(shownAt desc) {
  _id,
  messageId->{
    _id,
    text,
    category,
    like
  },
  shownAt,
  isExtraMessage
}`);

// Get messages shown to a specific user on a specific date
export const USER_MESSAGES_BY_DATE_QUERY = defineQuery(`*[_type == "userMessageHistory" && userId == $userId && shownAt >= $startDate && shownAt <= $endDate] | order(shownAt desc) {
  _id,
  messageId->{
    _id,
    text,
    category,
    like
  },
  shownAt,
  isExtraMessage
}`);

// Count today's shown messages for a user (useful for daily limit)
export const TODAY_MESSAGE_COUNT_QUERY = defineQuery(`count(*[_type == "userMessageHistory" 
  && userId == $userId 
  && shownAt >= $todayStart 
  && shownAt <= $todayEnd 
  && isExtraMessage == false])`);