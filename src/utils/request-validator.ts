// validationMiddleware.ts
import { plainToInstance } from "class-transformer";
import { validate as v, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";

function formatErrors(
  errors: ValidationError[],
): { [key: string]: string[] }[] {
  return errors.map((error) => {
    const constraints = error.constraints;
    return {
      [error.property]: Object.values(constraints || {}),
    };
  });
}

function validate<T>(type: any): any {
  return (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(type, req.body);
    v(instance).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        return res.status(400).json({
          errors: formatErrors(errors),
        });
      } else {
        req.body = instance;
        next();
      }
    });
  };
}

export default validate;
