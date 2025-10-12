import { v, enums } from "@omero/schemas";
import { camelCase } from "@omero/utils";
// Type guard utilities
function isObjectWithProperty<T extends string>(
  data: unknown,
  property: T
): data is Record<T, unknown> {
  return typeof data === "object" && data !== null && property in data;
}

function hasStringProperty<T extends string>(
  data: unknown,
  property: T
): data is Record<T, string> {
  return (
    isObjectWithProperty(data, property) && typeof data[property] === "string"
  );
}

function hasNumberProperty<T extends string>(
  data: unknown,
  property: T
): data is Record<T, number> {
  return (
    isObjectWithProperty(data, property) && typeof data[property] === "number"
  );
}

function hasOptionalNumberProperties<T extends string>(
  data: unknown,
  ...properties: T[]
): data is Record<T, number | undefined> {
  if (typeof data !== "object" || data === null) return false;
  return properties.every(
    (property) =>
      !(property in data) ||
      typeof (data as Record<string, unknown>)[property] === "number"
  );
}

// Helper to make schema optional based on required flag
function makeOptional<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(schema: T, required: boolean) {
  return required ? schema : v.optional(schema);
}

export const fieldValidationSchema = v.object({
  // Text/Textarea
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
  pattern: v.optional(v.string()),
  email: v.optional(v.boolean()),
  url: v.optional(v.boolean()),
  // Number
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  int: v.optional(v.boolean()),
  positive: v.optional(v.boolean()),
  // Select
  values: v.optional(v.array(v.string())),
  // Image
  allowedTypes: v.optional(v.array(v.string())),
  maxSize: v.optional(v.number()),
  maxWidth: v.optional(v.number()),
  maxHeight: v.optional(v.number()),
  // List
  minItems: v.optional(v.number()),
  maxItems: v.optional(v.number()),
  // Object
  requiredFields: v.optional(v.array(v.string())),
});

export const customFieldDefinitionSchema = v.object({
  id: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  entityType: v.picklist(
    enums.constants.customFields.entityType
    // ["post", "tag", "media"]
  ),
  fieldKey: v.pipe(
    v.string(),
    v.regex(/^[a-z_][a-z0-9_]*$/i, "Field key must be snake_case")
  ),
  fieldType: v.picklist([
    "text",
    "textarea",
    "boolean",
    "number",
    "select",
    "object",
    "list",
    "image",
  ]),
  required: v.boolean(),
  data: v.optional(v.record(v.string(), v.unknown())),
  validation: v.optional(fieldValidationSchema),
});

export type CustomFieldDefinition = v.InferOutput<
  typeof customFieldDefinitionSchema
>;

export type FieldValidation = v.InferOutput<typeof fieldValidationSchema>;

/**
 * Create a Valibot schema from custom field definitions
 */
export function createCustomFieldsSchema(
  entityType: "post" | "tag" | "media",
  definitions: CustomFieldDefinition[]
) {
  const schemaObject: Record<
    string,
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  > = {};

  for (const def of definitions.filter((d) => d.entityType === entityType)) {
    const fieldSchema = buildFieldSchema(def);
    schemaObject[camelCase(def.fieldKey)] = fieldSchema;
  }

  return v.object(schemaObject);
}

/**
 * Build a Valibot schema for a specific field definition
 */
function buildFieldSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  switch (def.fieldType) {
    case "text":
    case "textarea": {
      return buildTextSchema(def);
    }
    case "number": {
      return buildNumberSchema(def);
    }
    case "boolean": {
      return buildBooleanSchema(def);
    }
    case "select": {
      return buildSelectSchema(def);
    }
    case "image": {
      return buildImageSchema(def);
    }
    case "object": {
      return buildObjectSchema(def);
    }
    case "list": {
      return buildListSchema(def);
    }
    default: {
      throw new Error(`Unsupported field type: ${def.fieldType}`);
    }
  }
}

/**
 * Build schema for text/textarea fields
 */
function buildTextSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const pipes: Array<v.BaseValidation<string, string, v.BaseIssue<unknown>>> =
    [];

  if (def.validation?.minLength !== undefined) {
    pipes.push(v.minLength(def.validation.minLength));
  }
  if (def.validation?.maxLength !== undefined) {
    pipes.push(v.maxLength(def.validation.maxLength));
  }
  if (def.validation?.email) {
    pipes.push(v.email());
  }
  if (def.validation?.url) {
    pipes.push(v.url());
  }
  if (def.validation?.pattern) {
    pipes.push(v.regex(new RegExp(def.validation.pattern)));
  }

  const schema = pipes.length > 0 ? v.pipe(v.string(), ...pipes) : v.string();

  return makeOptional(schema, def.required);
}

/**
 * Build schema for number fields
 */
function buildNumberSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const pipes: Array<v.BaseValidation<number, number, v.BaseIssue<unknown>>> =
    [];

  if (def.validation?.min !== undefined) {
    pipes.push(v.minValue(def.validation.min));
  }
  if (def.validation?.max !== undefined) {
    pipes.push(v.maxValue(def.validation.max));
  }
  if (def.validation?.int) {
    pipes.push(v.integer());
  }
  if (def.validation?.positive) {
    pipes.push(v.minValue(0));
  }

  const schema = pipes.length > 0 ? v.pipe(v.number(), ...pipes) : v.number();

  return makeOptional(schema, def.required);
}

/**
 * Build schema for boolean fields
 */
function buildBooleanSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const schema = v.boolean();
  return makeOptional(schema, def.required);
}

/**
 * Build schema for select fields
 */
function buildSelectSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const values = def.data?.values || def.validation?.values || [];

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`Select field '${def.fieldKey}' must have values defined`);
  }

  const schema = v.picklist(values as [string, ...string[]]);
  return makeOptional(schema, def.required);
}

/**
 * Build schema for image fields
 */
function buildImageSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const baseSchema = v.object({
    url: v.pipe(v.string(), v.url()),
    type: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  });

  const validations: Array<
    v.BaseValidation<
      v.InferOutput<typeof baseSchema>,
      v.InferOutput<typeof baseSchema>,
      v.BaseIssue<unknown>
    >
  > = [];

  if (def.validation?.allowedTypes) {
    validations.push(
      v.check(
        (data) =>
          hasStringProperty(data, "type") &&
          def.validation!.allowedTypes!.includes(data.type),
        `Image type must be one of: ${def.validation.allowedTypes.join(", ")}`
      )
    );
  }

  if (def.validation?.maxSize) {
    validations.push(
      v.check(
        (data) =>
          hasNumberProperty(data, "size") &&
          data.size <= def.validation!.maxSize!,
        `Image size must be less than ${def.validation.maxSize} bytes`
      )
    );
  }

  if (def.validation?.maxWidth && def.validation?.maxHeight) {
    validations.push(
      v.check(
        (data) =>
          hasOptionalNumberProperties(data, "width", "height") &&
          (data.width || 0) <= def.validation!.maxWidth! &&
          (data.height || 0) <= def.validation!.maxHeight!,
        `Image dimensions must be ${def.validation.maxWidth}x${def.validation.maxHeight} or smaller`
      )
    );
  }

  const schema =
    validations.length > 0 ? v.pipe(baseSchema, ...validations) : baseSchema;

  return makeOptional(schema, def.required);
}

/**
 * Build schema for object fields (nested objects)
 */
function buildObjectSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const nestedSchema: Record<
    string,
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  > = {};

  for (const [key, fieldDef] of Object.entries(def.data?.schema || {})) {
    nestedSchema[key] = buildFieldSchema(fieldDef as CustomFieldDefinition);
  }

  const schema = v.object(nestedSchema);
  return makeOptional(schema, def.required);
}

/**
 * Build schema for list fields (arrays)
 */
function buildListSchema(
  def: CustomFieldDefinition
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  const itemType =
    typeof def?.data?.itemType === "string" ? `${def?.data?.itemType}` : "text";
  const itemSchema = buildItemSchema(itemType, def.data?.itemSchema);

  const pipes: Array<
    v.BaseValidation<unknown[], unknown[], v.BaseIssue<unknown>>
  > = [];

  if (def.validation?.minItems !== undefined) {
    pipes.push(v.minLength(def.validation.minItems));
  }
  if (def.validation?.maxItems !== undefined) {
    pipes.push(v.maxLength(def.validation.maxItems));
  }

  const schema =
    pipes.length > 0
      ? v.pipe(v.array(itemSchema), ...pipes)
      : v.array(itemSchema);

  return makeOptional(schema, def.required);
}

/**
 * Build schema for individual items in a list
 */
function buildItemSchema(
  itemType: string,
  itemSchema?: unknown
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  if (itemType === "object" && itemSchema) {
    return buildFieldSchema(itemSchema as CustomFieldDefinition);
  }

  switch (itemType) {
    case "text":
    case "textarea": {
      return v.string();
    }
    case "number": {
      return v.number();
    }
    case "boolean": {
      return v.boolean();
    }
    default: {
      return v.string();
    }
  }
}

/**
 * Validate custom field data against a schema
 */
export function validateCustomFields<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(data: unknown, schema: T): v.SafeParseResult<T> {
  return v.safeParse(schema, data);
}
