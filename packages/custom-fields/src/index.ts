export {
  createCustomFieldsSchema,
  validateCustomFields,
  type CustomFieldDefinition,
  type FieldValidation
} from './validation.js'

export const defaults = [
  {
    entityType: 'post',
    fieldKey: 'seo_title',
    fieldType: 'text',
    required: false,
    validation: {
      minLength: 30,
      maxLength: 60
    }
  },
  {
    entityType: 'post',
    fieldKey: 'seo_description',
    fieldType: 'textarea',
    required: false,
    validation: {
      minLength: 120,
      maxLength: 160
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_title',
    fieldType: 'text',
    required: false,
    validation: {
      maxLength: 95
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_type',
    fieldType: 'select',
    required: false,
    validation: {
      values: [
        'website',
        'article',
        'book',
        'profile',
        'music.song',
        'music.album',
        'music.playlist',
        'music.radio_station',
        'video.movie',
        'video.episode',
        'video.tv_show',
        'video.other'
      ]
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_url',
    fieldType: 'text',
    required: false,
    validation: {
      url: true
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_image',
    fieldType: 'text',
    required: false,
    validation: {
      url: true
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_image_type',
    fieldType: 'select',
    required: false,
    validation: {
      values: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_image_width',
    fieldType: 'number',
    required: false,
    validation: {
      int: true,
      positive: true,
      min: 200,
      max: 2000
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_image_height',
    fieldType: 'number',
    required: false,
    validation: {
      int: true,
      positive: true,
      min: 200,
      max: 2000
    }
  },
  {
    entityType: 'post',
    fieldKey: 'og_image_alt',
    fieldType: 'text',
    required: false,
    validation: {
      maxLength: 125
    }
  },
  {
    entityType: 'post',
    fieldKey: 'schema_markup',
    fieldType: 'textarea',
    required: false,
    validation: {
      maxLength: 5000
    }
  }
] as const
