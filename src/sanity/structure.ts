
import { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Messages list
      S.listItem()
        .title("Love Messages")
        .schemaType("message")
        .child(S.documentTypeList("message")),

      // Users list
      S.listItem()
        .title("Users")
        .schemaType("user")
        .child(S.documentTypeList("user")),
    ]);

    
        