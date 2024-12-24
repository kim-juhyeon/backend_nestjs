import {
  Contains,
  Equals,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsCreditCard,
  IsDateString,
  IsDefined,
  IsDivisibleBy,
  IsEmpty,
  IsHexColor,
  IsInt,
  IsLatLong,
  IsNegative,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  NotContains,
  NotEquals,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isDefined,
  registerDecorator,
} from 'class-validator';
import { register } from 'module';

@ValidatorConstraint()
class PasswordValidator implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    return value.length > 4 && value.length < 8;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return '비밀번호의 길이는 4~8자 여야 합니다.입력된비밀번호 ($value)';
  }
}
function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: PasswordValidator,
    });
  };
}
export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  genre?: string;

  // null / undefined
  //   @IsDefined()
  //   @Equals('code factory')
  // @NotEquals('code factory')
  //   @IsEmpty()
  //   @IsBoolean()
  //   @IsString()
  //   @IsNumber()
  //   @IsInt()
  //   @IsArray()
  //   @IsDateString()
  //   @IsDivisibleBy(5)
  //   @IsNegative()
  //   @Min(100)
  //   @Max(100)
  //   @Contains('code factory')
  //   @NotContains('code factory')
  //   @IsAlphanumeric() ///TODO 알파벳과 숫자만
  //   @IsCreditCard()
  //   @IsHexColor()
  //   @MaxLength(16)
  //   @IsUUID()
  //   @IsLatLong()
  @IsPasswordValid()
  test: string;
}
