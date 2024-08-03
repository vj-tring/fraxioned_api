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
class IsValidIdConstraint implements ValidatorConstraintInterface {
  validate(value: ValidIdObject): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof value.id === 'number' &&
      value.id >= 1
    );
  }

  defaultMessage(): string {
    return 'The property must be an object with a valid id where (id >= 1)';
  }
}

export function IsValidId(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidIdConstraint,
    });
  };
}
