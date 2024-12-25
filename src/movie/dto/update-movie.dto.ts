import {
  ArrayNotEmpty,
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

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @IsOptional()
  genreIds?: number[];

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  detail?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  directorId?: number;
}
