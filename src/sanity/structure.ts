
import { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Settings singleton
      S.listItem()
        .title("Settings")
        .child(S.document().schemaType("settings").documentId("settings")),

      // Messages list
      S.listItem()
        .title("Love Messages")
        .schemaType("message")
        .child(S.documentTypeList("message")),

      // User Message History list
      S.listItem()
        .title("User Message History")
        .schemaType("userMessageHistory")
        .child(S.documentTypeList("userMessageHistory")),
        
      // Users list
      S.listItem()
        .title("Users")
        .schemaType("user")
        .child(S.documentTypeList("user")),
    ]);

    
