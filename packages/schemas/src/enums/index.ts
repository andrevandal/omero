export const constants = {
  postType: ['article', 'page'],
  visibility: ['draft', 'private', 'public'],
  mediaType: ['image', 'video', 'document'],
  memberRole: ['member', 'admin', 'owner'],
  invitationStatus: ['pending', 'accepted', 'declined', 'expired'],
  customFields: {
    entityType: ['post', 'tag', 'media'],
    fieldType: [
      'text',
      'textarea',
      'boolean',
      'number',
      'select',
      'object',
      'list',
      'image'
    ]
  }
} as const

export const POST_TYPES = constants.postType
export const VISIBILITY_TYPES = constants.visibility
export const MEDIA_TYPES = constants.mediaType
export const MEMBER_ROLES = constants.memberRole
export const INVITATION_STATUS = constants.invitationStatus
export const CUSTOM_FIELD_ENTITY_TYPES = constants.customFields.entityType
export const CUSTOM_FIELD_TYPES = constants.customFields.fieldType
