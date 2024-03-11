import { z } from 'zod'
import { MembershipRoles } from '@/schemas/db'

export const registerUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8)
  })
  .superRefine(({ password }, checkPassComplexity) => {
    const containsUppercase = (ch: string) => /[A-Z]/.test(ch)
    const containsLowercase = (ch: string) => /[a-z]/.test(ch)
    const containsSpecialChar = (ch: string) =>
      /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(ch)
    let countOfUpperCase = 0
    let countOfLowerCase = 0
    let countOfNumbers = 0
    let countOfSpecialChar = 0
    for (let i = 0; i < password.length; i++) {
      const ch = password.charAt(i)
      if (!isNaN(+ch)) {
        countOfNumbers++
      } else if (containsUppercase(ch)) {
        countOfUpperCase++
      } else if (containsLowercase(ch)) {
        countOfLowerCase++
      } else if (containsSpecialChar(ch)) {
        countOfSpecialChar++
      }
    }
    if (
      countOfLowerCase < 1 ||
      countOfUpperCase < 1 ||
      countOfSpecialChar < 1 ||
      countOfNumbers < 1
    ) {
      checkPassComplexity.addIssue({
        code: 'custom',
        message: 'password does not meet complexity requirements'
      })
    }
  })

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
})
export const createOrganizationSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional()
})
export type CreateOrganization = z.infer<typeof createOrganizationSchema> & {
  owner: string
}

export const editOrganizationBodySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional()
})

export const editOrganizationParamsSchema = z.object({
  orgId: z.string()
})

export const getOrganizationsQuerySchema = z.object({
  limit: z.coerce.number().optional().default(10),
  offset: z.coerce.number().optional().default(0),
  members: z.coerce.boolean().optional().default(false),
  projects: z.coerce.boolean().optional().default(false),
  membership: z.coerce.boolean().optional().default(false)
})

export const organizationIdParamsSchema = z.object({
  orgId: z.string()
})

const AllowedRoles = ['member', 'admin'] as const satisfies MembershipRoles[]

export const createMembershipBodySchema = z.object({
  userId: z.string(),
  role: z.enum(AllowedRoles)
})
