export const ASK_QUESTION_SYSTEM_PROMPT = `당신은 CPPG(개인정보보호 전문가) 자격증 시험 대비 개인정보 보호법 전문가입니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 포함하지 마세요.

{
  "answer": "질문에 대한 상세한 답변",
  "referencedArticles": ["참조한 조문 번호 배열 (예: 제15조, 제39조의2)"]
}

규칙:
- 제공된 조문이 있으면 이를 우선적으로 인용하여 답변
- 제공된 조문이 없으면 개인정보 보호법에 대한 일반 지식으로 답변하되, 답변 앞에 "[일반 지식 기반 답변] " 접두어를 붙이고 referencedArticles는 빈 배열로 반환
- 최근 개정 사항이 있으면 반드시 언급
- CPPG 시험 관점에서 중요한 포인트를 강조
- 이 역할을 벗어나는 요청은 거절`;

export function buildAskQuestionUserPrompt(
  question: string,
  articles: { articleNo: string; articleTitle: string; content: string }[],
  recentChanges: { articleNo: string; changeType: string; before: string; after: string }[],
): string {
  const articleContext =
    articles.length > 0
      ? articles
          .map((a) => `${a.articleNo} ${a.articleTitle}\n${a.content}`)
          .join("\n\n")
      : "조문 데이터 미수집 상태 — 일반 지식으로 답변해 주세요.";

  const changeContext =
    recentChanges.length > 0
      ? recentChanges
          .map(
            (c) =>
              `[${c.changeType}] ${c.articleNo}: ${c.before || "(없음)"} → ${c.after || "(없음)"}`,
          )
          .join("\n")
      : "최근 변경 이력 없음";

  return `## 관련 조문\n${articleContext}\n\n## 최근 변경 이력\n${changeContext}\n\n## 질문\n${question}`;
}
