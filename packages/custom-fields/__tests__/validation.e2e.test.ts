import { v } from "@omero/schemas";
import { describe, expect, it } from "vitest";

import {
  createCustomFieldsSchema,
  type CustomFieldDefinition,
} from "../src/validation.js";

// Define available icons for the schema
const availableIcons = [
  "apresentacao",
  "codificacao",
  "concepcao",
  "descoberta",
  "entrega",
  "instagram",
  "linkedin",
  "mapeamento",
  "otimizacao-seo",
  "prototipo",
  "mdi:linkedin",
  "mdi:instagram",
  "logos:linkedin-icon",
  "logos:instagram-icon",
  "heroicons:arrow-down",
  "heroicons-outline:chat-alt-2",
];

// Custom field definitions for pedro category schema
const pedroCategoryFieldDefinitions: CustomFieldDefinition[] = [
  {
    entityType: "tag",
    fieldKey: "showcase",
    fieldType: "number",
    required: false,
  },
  {
    entityType: "tag",
    fieldKey: "cta_text",
    fieldType: "text",
    required: false,
  },
  {
    entityType: "tag",
    fieldKey: "features_title",
    fieldType: "text",
    required: false,
  },
  {
    entityType: "tag",
    fieldKey: "features",
    fieldType: "list",
    required: false,
    data: {
      itemType: "object",
      itemSchema: {
        entityType: "tag",
        fieldKey: "feature_item",
        fieldType: "object",
        required: true,
        data: {
          schema: {
            iconName: {
              entityType: "tag",
              fieldKey: "icon_name",
              fieldType: "select",
              required: true,
              data: {
                values: availableIcons,
              },
            },
            title: {
              entityType: "tag",
              fieldKey: "title",
              fieldType: "text",
              required: true,
            },
            description: {
              entityType: "tag",
              fieldKey: "description",
              fieldType: "text",
              required: true,
            },
          },
        },
      },
    },
  },
];

// Generate the schema using createCustomFieldsSchema
const pedroCategorSchema = createCustomFieldsSchema(
  "tag",
  pedroCategoryFieldDefinitions
);

// Test data based on provided information
const testData = {
  showcase: 1,
  ctaText: "Portfólio completo",
  featuresTitle: "Bastidores da inovação da marca",
  features: [
    {
      iconName: "descoberta",
      title: "Descoberta",
      description:
        "Coletamos as informações essenciais para o desenvolvimento através de um briefing detalhado.",
    },
    {
      iconName: "concepcao",
      title: "Concepção",
      description:
        "A direção do projeto é guiada por muita análise, estudos de mercado e referências visuais nesta fase.",
    },
    {
      iconName: "apresentacao",
      title: "Apresentação",
      description:
        "Revelamos o projeto completo, detalhando a evolução e o conceito inerente à solução idealizada.",
    },
    {
      iconName: "entrega",
      title: "Entrega",
      description:
        "Disponibilizamos os documentos para a utilização nas mídias de veiculação, junto a guias práticas.",
    },
  ],
};

// E2E test
describe("pedroCategorSchema", () => {
  it("should parse valid data successfully", () => {
    const result = v.safeParse(pedroCategorSchema, testData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.showcase).toBe(1); // true coerced to 1
      expect(result.output.ctaText).toBe("Portfólio completo");
      expect(result.output.featuresTitle).toBe(
        "Bastidores da inovação da marca"
      );
      expect(result.output.features).toHaveLength(4);
      expect(
        (
          result.output.features as Array<{
            iconName?: string;
          }>
        )[0]?.iconName
      ).toBe("descoberta");
      expect(
        (result.output.features as Array<{ title: string }>)[0].title
      ).toBe("Descoberta");
    }
  });

  it("should handle missing optional fields", () => {
    const minimalData = {
      showcase: 0,
    };

    const result = v.safeParse(pedroCategorSchema, minimalData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.showcase).toBe(0);
      expect(result.output.ctaText).toBeUndefined();
      expect(result.output.featuresTitle).toBeUndefined();
      expect(result.output.features).toBeUndefined(); // Optional fields are undefined when not provided
    }
  });

  it("should fail with invalid icon name", () => {
    const invalidData = {
      showcase: 1,
      features: [
        {
          iconName: "invalid-icon",
          title: "Test",
          description: "Test description",
        },
      ],
    };

    const result = v.safeParse(pedroCategorSchema, invalidData);

    expect(result.success).toBe(false);
  });
});
