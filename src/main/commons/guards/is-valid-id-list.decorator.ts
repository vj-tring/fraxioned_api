import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface ValidIdObject {
  id: number;
}

@ValidatorConstraint({ async: false })
class IsValidIdArrayConstraint implements ValidatorConstraintInterface {
  validate(values: ValidIdObject[]): boolean {
    if (!Array.isArray(values)) {
      return false;
    }
    return values.every(
      (value) =>
        typeof value === 'object' &&
        value !== null &&
        typeof value.id === 'number' &&
        value.id >= 1,
    );
  }

  defaultMessage(): string {
    return 'Each property must be an object with a valid id where (id >= 1)';
  }
}

export function IsValidIdArray(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidIdArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidIdArrayConstraint,
    });
  };
}
