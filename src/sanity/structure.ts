import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Users list — each user's messages are embedded and shown inline when opened
      S.listItem()
        .title("Users")
        .schemaType("user")
        .child(S.documentTypeList("user")),
    ]);
