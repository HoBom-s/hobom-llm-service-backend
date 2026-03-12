import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsString,
  ValidateNested,
} from "class-validator";

export class ArticleDto {
  @ApiProperty({ example: "제39조의3" })
  @IsString()
  articleNo: string;

  @ApiProperty({ example: "개인정보의 이동 요구" })
  @IsString()
  articleTitle: string;

  @ApiProperty({
    example:
      "정보주체는 개인정보처리자에 대하여 본인에 관한 개인정보를 본인 또는 제3자에게 전송하도록 요구할 수 있다.",
  })
  @IsString()
  content: string;
}

export class RecentChangeDto {
  @ApiProperty({ example: "제15조" })
  @IsString()
  articleNo: string;

  @ApiProperty({ example: "신설", enum: ["신설", "개정", "삭제"] })
  @IsString()
  changeType: string;

  @ApiProperty({ example: "" })
  @IsString()
  before: string;

  @ApiProperty({
    example:
      "개인정보처리자는 정보주체의 동의를 받을 때 개인정보의 보유 및 이용 기간을 알려야 한다.",
  })
  @IsString()
  after: string;
}

export class AskQuestionRequestDto {
  @ApiProperty({
    example:
      "개인정보 이동권이 새로 도입됐는데, 기업 입장에서 어떤 준비가 필요한가요?",
  })
  @IsString()
  question: string;

  @ApiProperty({ type: [ArticleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleDto)
  articles: ArticleDto[];

  @ApiProperty({ type: [RecentChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecentChangeDto)
  recentChanges: RecentChangeDto[];
}

export class AskQuestionResponseDto {
  @ApiProperty({
    example:
      "개인정보 이동권(제39조의3)이 도입됨에 따라 기업은 다음을 준비해야 합니다: 1) 개인정보 전송 시스템 구축 2) 표준 데이터 형식 지원 3) 전송 요구 처리 절차 마련",
  })
  answer: string;

  @ApiProperty({ example: ["제39조의3", "제15조"] })
  referencedArticles: string[];
}
