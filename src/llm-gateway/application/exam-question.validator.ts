import { Logger } from "@nestjs/common";

const logger = new Logger("ExamQuestionValidator");

export const EXAM_QUESTION_TYPE = {
  OX: "OX",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
} as const;

const TYPE_NORMALIZATION: Record<string, string> = {
  OX: EXAM_QUESTION_TYPE.OX,
  ox: EXAM_QUESTION_TYPE.OX,
  Ox: EXAM_QUESTION_TYPE.OX,
  OX문제: EXAM_QUESTION_TYPE.OX,
  ox문제: EXAM_QUESTION_TYPE.OX,
  MULTIPLE_CHOICE: EXAM_QUESTION_TYPE.MULTIPLE_CHOICE,
  multiple_choice: EXAM_QUESTION_TYPE.MULTIPLE_CHOICE,
  객관식: EXAM_QUESTION_TYPE.MULTIPLE_CHOICE,
  "4지선다": EXAM_QUESTION_TYPE.MULTIPLE_CHOICE,
  사지선다: EXAM_QUESTION_TYPE.MULTIPLE_CHOICE,
};

export interface ValidatedExamQuestion {
  subject: string;
  type: string;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export function validateExamQuestion(
  raw: Record<string, unknown>,
  index: number,
): ValidatedExamQuestion | null {
  if (
    typeof raw.subject !== "string" ||
    !raw.subject.trim() ||
    typeof raw.question !== "string" ||
    !raw.question.trim() ||
    typeof raw.answer !== "string" ||
    !raw.answer.trim() ||
    typeof raw.explanation !== "string" ||
    !raw.explanation.trim()
  ) {
    logger.warn(`문제 #${index}: 필수 문자열 필드 누락 또는 빈 값`);
    return null;
  }

  if (typeof raw.type !== "string") {
    logger.warn(
      `문제 #${index}: type 필드가 문자열이 아님 (${typeof raw.type})`,
    );
    return null;
  }

  const normalizedType = TYPE_NORMALIZATION[raw.type.trim()];
  if (!normalizedType) {
    logger.warn(`문제 #${index}: 인식할 수 없는 type "${raw.type}"`);
    return null;
  }

  if (!Array.isArray(raw.choices)) {
    logger.warn(`문제 #${index}: choices가 배열이 아님`);
    return null;
  }

  const answer = raw.answer.trim();

  if (normalizedType === EXAM_QUESTION_TYPE.OX) {
    if (answer !== "O" && answer !== "X") {
      logger.warn(
        `문제 #${index}: OX 문제 answer가 "O" 또는 "X"가 아님: "${answer}"`,
      );
      return null;
    }
    return {
      subject: raw.subject.trim(),
      type: normalizedType,
      question: raw.question.trim(),
      choices: [],
      answer,
      explanation: raw.explanation.trim(),
    };
  }

  // MULTIPLE_CHOICE
  const choices = raw.choices.filter(
    (c): c is string => typeof c === "string" && c.trim().length > 0,
  );

  if (choices.length !== 4) {
    logger.warn(
      `문제 #${index}: 4지선다 문제인데 choices가 ${choices.length}개`,
    );
    return null;
  }

  const trimmedChoices = choices.map((c) => c.trim());
  if (!trimmedChoices.includes(answer)) {
    logger.warn(`문제 #${index}: answer "${answer}"가 choices에 포함되지 않음`);
    return null;
  }

  return {
    subject: raw.subject.trim(),
    type: normalizedType,
    question: raw.question.trim(),
    choices: trimmedChoices,
    answer,
    explanation: raw.explanation.trim(),
  };
}

export function validateExamQuestions(
  raw: unknown,
  requestedCount: number,
): ValidatedExamQuestion[] {
  if (!raw || typeof raw !== "object" || !("questions" in raw)) {
    throw new Error("LLM 응답에 questions 필드가 없어요.");
  }

  const { questions } = raw as { questions: unknown };
  if (!Array.isArray(questions)) {
    throw new Error("LLM 응답의 questions가 배열이 아니에요.");
  }

  const validated: ValidatedExamQuestion[] = [];
  for (let i = 0; i < questions.length; i++) {
    const result = validateExamQuestion(
      questions[i] as Record<string, unknown>,
      i + 1,
    );
    if (result) {
      validated.push(result);
    }
  }

  const minRequired = Math.ceil(requestedCount * 0.5);
  if (validated.length < minRequired) {
    throw new Error(
      `유효한 문제가 너무 적어요: ${validated.length}/${questions.length}개 유효 (최소 ${minRequired}개 필요)`,
    );
  }

  if (validated.length < requestedCount) {
    logger.warn(
      `요청 ${requestedCount}개 중 ${validated.length}개만 유효 (${questions.length - validated.length}개 필터링됨)`,
    );
  }

  return validated;
}
