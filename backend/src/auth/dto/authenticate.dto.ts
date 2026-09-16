import { IsString, MinLength } from 'class-validator';

export class AuthenticateDto {
  @IsString()
  @MinLength(1)
  ticket!: string;
}
