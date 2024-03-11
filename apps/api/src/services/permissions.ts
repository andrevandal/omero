import { ExtractedJWT } from '@/services/auth'
import { type MembershipRoles } from '@/schemas/db'

export const isSuperAdmin = (email: string) => email === 'deregudegu@gmail.com'

export const isMember = (role: MembershipRoles) => role === 'member'
export const isAdmin = (role: MembershipRoles) => role === 'admin'

// export const checkPermissions = ({ email, role }: { email: string, role: MembershipRoles }) => {
//   if (isSuperUser(email)) {
//     return true
//   }
//   if (isMember(role)) {
//     return true
//   }
//   if (isAdmin(role)) {
//     return true
//   }
// }

export const canAssociateMembers = (
  orgs: ExtractedJWT['orgs'],
  orgId: string
) => {
  return (
    orgs.filter(
      org =>
        org.id === orgId && (org.role === 'admin' || org.role === 'owner')
    ).length > 0
  )
}
