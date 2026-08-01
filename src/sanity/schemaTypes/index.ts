import type { SchemaTypeDefinition } from 'sanity'
import { messageType } from './message'
import { calendarEventType } from './calendarEvent'
import { userType } from './user'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [messageType, calendarEventType, userType],
}
