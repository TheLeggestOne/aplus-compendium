import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateCharacterDto {
  @IsString()
  @MaxLength(512)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;
}
