import { Transform } from 'class-transformer';

export const OptionalTransform = () =>
  Transform(({ value }: { value: unknown }) =>
    value === '' ? undefined : value,
  );

export const OptionalTransformArray = () =>
  Transform(({ value }: { value: unknown }) => {
    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === 'string')
    ) {
      return value;
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  });
