import {IsDefined, IsString, MinLength} from "class-validator";

export class TestDto {
  @MinLength(3)
  @IsDefined()
  @IsString()
  name!: string;
}
