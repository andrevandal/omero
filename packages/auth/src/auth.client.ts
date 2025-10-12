import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient as createAuthClientFn } from "better-auth/react";

import { ac, admin, member, owner } from "./permissions.js";

export const createAuthClient: ReturnType<typeof createAuthClientFn> =
  createAuthClientFn({
    plugins: [
      organizationClient({
        ac,
        roles: {
          owner,
          admin,
          member,
        },
      }),
      emailOTPClient(),
    ],
  });
