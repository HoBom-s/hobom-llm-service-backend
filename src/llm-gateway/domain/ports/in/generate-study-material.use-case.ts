export interface GenerateStudyMaterialUseCase {
  invoke(request: {
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[];
  }): Promise<{
    summary: string;
    keyPoints: string[];
    quizzes: {
      type: string;
      question: string;
      answer: string;
      explanation: string;
      choices: string[];
    }[];
  }>;
}
