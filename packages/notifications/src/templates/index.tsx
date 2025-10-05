import {
  EmailVerification,
  propsSchema as EmailVerificationPropertiesSchema,
  getSubject as EmailVerificationSubject
} from './email/email-verification.js'
import {
  ForgotPasswordEmail,
  getSubject as ForgotPasswordEmailSubject,
  propsSchema as ForgotPasswordPropertiesSchema
} from './email/forgot-password.js'
import {
  OrganizationInvitation,
  propsSchema as OrganizationInvitationPropertiesSchema,
  getSubject as OrganizationInvitationSubject
} from './email/organization-invitation.js'

export const emailTemplates = {
  'email-verification': {
    Component: EmailVerification,
    getSubject: EmailVerificationSubject,
    propsSchema: EmailVerificationPropertiesSchema
  },
  'forgot-password': {
    Component: ForgotPasswordEmail,
    getSubject: ForgotPasswordEmailSubject,
    propsSchema: ForgotPasswordPropertiesSchema
  },
  'organization-invitation': {
    Component: OrganizationInvitation,
    getSubject: OrganizationInvitationSubject,
    propsSchema: OrganizationInvitationPropertiesSchema
  }
} as const

export type EmailTemplateType = keyof typeof emailTemplates
