import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditBookmarkDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;
}
