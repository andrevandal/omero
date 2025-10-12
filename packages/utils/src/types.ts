export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type DeepWriteable<T> = {
  -readonly [P in keyof T]: DeepWriteable<T[P]>;
};

export const makeWriteable = <T>(value: T): value is Writeable<T> => !!value;
