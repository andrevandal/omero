import { emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { ac, admin, member, owner } from './permissions.js'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    plugins: [
      organizationClient({
        ac,
        roles: {
          owner,
          admin,
          member
        }
      }),
      emailOTPClient()
    ]
  }
)
