import { type SchemaTypeDefinition } from 'sanity'
import { messageType } from './message'
import { userType } from './user'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [messageType, userType],
}
