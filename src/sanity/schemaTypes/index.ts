import { type SchemaTypeDefinition } from 'sanity'
import { messageType } from './message'
import { settingsType } from './settings'
import { userMessageHistoryType } from './userMessageHistory'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ messageType, settingsType, userMessageHistoryType],
}
