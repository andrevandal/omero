import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements,
  ownerAc
} from 'better-auth/plugins/organization/access'

const statement = {
  ...defaultStatements,
  post: ['create', 'update', 'delete'],
  tags: ['create', 'update', 'delete'],
  medias: ['create', 'update', 'delete']
} as const

export const ac = createAccessControl(statement)

export const member = ac.newRole({
  post: ['create', 'update'],
  tags: ['create', 'update'],
  medias: ['create', 'update']
})

export const admin = ac.newRole({
  post: ['create', 'update', 'delete'],
  tags: ['create', 'update', 'delete'],
  medias: ['create', 'update', 'delete'],
  ...adminAc.statements
})

export const owner = ac.newRole({
  post: ['create', 'update', 'delete'],
  tags: ['create', 'update', 'delete'],
  medias: ['create', 'update', 'delete'],
  ...ownerAc.statements
})
