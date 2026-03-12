import { ApiProperty } from "@nestjs/swagger";

export class ArticleDto {
  @ApiProperty({ example: "제39조의3" })
  articleNo: string;

  @ApiProperty({ example: "개인정보의 이동 요구" })
  articleTitle: string;

  @ApiProperty({
    example:
      "정보주체는 개인정보처리자에 대하여 본인에 관한 개인정보를 본인 또는 제3자에게 전송하도록 요구할 수 있다.",
  })
  content: string;
}

export class RecentChangeDto {
  @ApiProperty({ example: "제15조" })
  articleNo: string;

  @ApiProperty({ example: "신설", enum: ["신설", "개정", "삭제"] })
  changeType: string;

  @ApiProperty({ example: "" })
  before: string;

  @ApiProperty({
    example:
      "개인정보처리자는 정보주체의 동의를 받을 때 개인정보의 보유 및 이용 기간을 알려야 한다.",
  })
  after: string;
}

export class AskQuestionRequestDto {
  @ApiProperty({
    example:
      "개인정보 이동권이 새로 도입됐는데, 기업 입장에서 어떤 준비가 필요한가요?",
  })
  question: string;

  @ApiProperty({ type: [ArticleDto] })
  articles: ArticleDto[];

  @ApiProperty({ type: [RecentChangeDto] })
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
