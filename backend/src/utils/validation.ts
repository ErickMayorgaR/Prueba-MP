import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateDTO = async <T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<ValidationResult> => {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors: ValidationError[] = await validate(dtoInstance);

  if (errors.length > 0) {
    const errorMessages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : []
    );
    return {
      isValid: false,
      errors: errorMessages,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
