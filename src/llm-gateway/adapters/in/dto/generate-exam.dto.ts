import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class ExamArticleDto {
  @ApiProperty({ example: "제15조" })
  @IsString()
  articleNo: string;

  @ApiProperty({ example: "개인정보의 수집·이용" })
  @IsString()
  articleTitle: string;

  @ApiProperty({ example: "개인정보처리자는 다음 각 호의 어느 하나에 ..." })
  @IsString()
  content: string;
}

export class GenerateExamRequestDto {
  @ApiProperty({ type: [ExamArticleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamArticleDto)
  articles: ExamArticleDto[];

  @ApiProperty({ example: "개인정보 보호법 총칙 및 개인정보 보호 원칙" })
  @IsString()
  subject: string;

  @ApiProperty({ example: 34 })
  @IsNumber()
  @Min(1)
  questionCount: number;
}

class ExamQuestionDto {
  @ApiProperty({ example: "개인정보 보호법 총칙 및 개인정보 보호 원칙" })
  subject: string;

  @ApiProperty({ example: "OX", enum: ["OX", "MULTIPLE_CHOICE"] })
  type: string;

  @ApiProperty({ example: "개인정보처리자는 정보주체의 동의 없이 ..." })
  question: string;

  @ApiProperty({ example: ["선택지1", "선택지2", "선택지3", "선택지4"] })
  choices: string[];

  @ApiProperty({ example: "X" })
  answer: string;

  @ApiProperty({ example: "제15조에 따르면 ..." })
  explanation: string;
}

export class GenerateExamResponseDto {
  @ApiProperty({ type: [ExamQuestionDto] })
  questions: ExamQuestionDto[];
}
