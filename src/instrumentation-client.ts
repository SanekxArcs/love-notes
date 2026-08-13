import { initBotId } from "botid/client/core";

const basic = { checkLevel: "basic" as const };

initBotId({
  protect: [
    { path: "/api/auth/callback/credentials", method: "POST", advancedOptions: basic },
    { path: "/api/users/register", method: "POST", advancedOptions: basic },
    { path: "/api/users/check-login", method: "GET", advancedOptions: basic },
    { path: "/api/messages/generate", method: "POST", advancedOptions: basic },
    { path: "/api/messages/scan-image", method: "POST", advancedOptions: basic },
    { path: "/api/notes/chat", method: "POST", advancedOptions: basic },
    { path: "/api/notes/topics", method: "POST", advancedOptions: basic },
    { path: "/api/notes/match", method: "POST", advancedOptions: basic },
  ],
});
