export interface LlmClientPort {
  generateStudyMaterial(
    changes: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[],
  ): Promise<{
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

  askQuestion(
    question: string,
    articles: {
      articleNo: string;
      articleTitle: string;
      content: string;
    }[],
    recentChanges: {
      articleNo: string;
      changeType: string;
      before: string;
      after: string;
    }[],
  ): Promise<{
    answer: string;
    referencedArticles: string[];
  }>;

  generateExamQuestions(
    articles: { articleNo: string; articleTitle: string; content: string }[],
    subject: string,
    questionCount: number,
  ): Promise<{
    questions: {
      subject: string;
      type: string;
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }[];
  }>;
}
