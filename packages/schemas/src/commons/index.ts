import * as v from 'valibot'

export const UrlSchema = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your url.'),
  v.url('The url is badly formatted.')
)

export const OptionalUrlSchema = v.optional(UrlSchema)

export const StringSchema = v.pipe(v.string())

export const OptionalStringSchema = v.optional(StringSchema)

export const BooleanSchema = v.union([
  v.pipe(
    OptionalStringSchema,
    v.transform(input => input === 'true')
  ),
  v.boolean()
])
