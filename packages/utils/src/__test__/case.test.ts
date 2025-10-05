import { describe, expect, test } from "vitest";

import { toCamelCase, toSnakeCase } from "../case.js";

describe("Case Utils", () => {
  test("toCamelCase with nested objects", () => {
    const input = {
      user_name: "John",
      user_profile: {
        first_name: "John",
        last_name: "Doe",
        contact_info: {
          email_address: "john@example.com",
        },
      },
    };

    const result = toCamelCase(input);
    expect(result).toEqual({
      userName: "John",
      userProfile: {
        firstName: "John",
        lastName: "Doe",
        contactInfo: {
          emailAddress: "john@example.com",
        },
      },
    });
  });

  test("toCamelCase with arrays of objects", () => {
    const input = {
      user_list: [
        { user_name: "John", user_age: 30 },
        { user_name: "Jane", user_age: 25 },
      ],
    };

    const result = toCamelCase(input);
    expect(result).toEqual({
      userList: [
        { userName: "John", userAge: 30 },
        { userName: "Jane", userAge: 25 },
      ],
    });
  });

  test("toCamelCase preserves non-object values", () => {
    const input = {
      text_field: "hello",
      number_field: 42,
      boolean_field: true,
      null_field: null,
      array_field: ["a", "b", "c"],
    };

    const result = toCamelCase(input);
    expect(result).toEqual({
      textField: "hello",
      numberField: 42,
      booleanField: true,
      nullField: null,
      arrayField: ["a", "b", "c"],
    });
  });

  test("camel to snake case conversion", () => {
    const input = {
      userName: "John",
      userProfile: {
        firstName: "John",
        lastName: "Doe",
      },
    };

    const result = toSnakeCase(input);
    expect(result).toEqual({
      user_name: "John",
      user_profile: {
        first_name: "John",
        last_name: "Doe",
      },
    });
  });

  test("snake to camel case conversion", () => {
    const input = {
      user_name: "John",
      user_profile: {
        first_name: "John",
        last_name: "Doe",
      },
    };

    const result = toCamelCase(input);
    expect(result).toEqual({
      userName: "John",
      userProfile: {
        firstName: "John",
        lastName: "Doe",
      },
    });
  });

  test("handles edge cases", () => {
    expect(toCamelCase(null as unknown as Record<string, unknown>)).toBe(null);
    expect(toCamelCase("string" as unknown as Record<string, unknown>)).toBe(
      "string"
    );
    expect(toCamelCase(42 as unknown as Record<string, unknown>)).toBe(42);
    expect(toCamelCase([] as never)).toEqual([]);
    expect(toCamelCase({})).toEqual({});
  });

  test("handles arrays with mixed types", () => {
    const input = {
      mixed_array: ["string", 42, { nested_object: "value" }, null],
    };

    const result = toCamelCase(input);
    expect(result).toEqual({
      mixedArray: ["string", 42, { nestedObject: "value" }, null],
    });
  });

  test("round-trip conversion", () => {
    const original = {
      user_name: "John",
      user_profile: {
        first_name: "John",
        contact_info: {
          email_address: "john@example.com",
        },
      },
    };

    const camelCase = toCamelCase(original);
    const backToSnake = toSnakeCase(camelCase);

    expect(backToSnake).toEqual(original);
  });
});
