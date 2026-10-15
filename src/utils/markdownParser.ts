import type { MCQOption, MCQQuestion, QuestionAttempt } from '../types';

/**
 * Parses markdown MCQ bank format:
 * # Topic Name
 * ### Q 1 Stem question text
 * - Option A [True]
 * - Option B [False]
 * **Explanation:**
 * > Blockquote or text
 * ---
 */
export function parseMCQMarkdown(markdown: string): MCQQuestion[] {
  const lines = markdown.split(/\r?\n/);
  const questions: MCQQuestion[] = [];

  let currentTopic = 'Général';
  let currentTopicId = 'general';
  let currentQuestion: Partial<MCQQuestion> | null = null;
  let currentOptions: MCQOption[] = [];
  let inExplanation = false;
  let explanationLines: string[] = [];
  let questionCounter = 0;

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'topic';

  const finalizeQuestion = () => {
    if (currentQuestion && currentQuestion.title && currentOptions.length > 0) {
      questionCounter++;
      const id = currentQuestion.id || `${currentTopicId}-q${questionCounter}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanExplanation = explanationLines.join('\n').trim();

      questions.push({
        id,
        topicId: currentTopicId,
        topicName: currentTopic,
        questionNumber: currentQuestion.questionNumber || questionCounter,
        title: currentQuestion.title.trim(),
        options: currentOptions,
        explanation: cleanExplanation || undefined,
        bookmarked: false,
        attemptCount: 0,
        failureCount: 0,
      });
    }

    currentQuestion = null;
    currentOptions = [];
    inExplanation = false;
    explanationLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for Topic Header: e.g. "# Infarctus du myocarde"
    if (/^#\s+([^#].*)$/.test(trimmed)) {
      finalizeQuestion();
      const match = trimmed.match(/^#\s+(.+)$/);
      if (match) {
        currentTopic = match[1].trim();
        currentTopicId = slugify(currentTopic);
        questionCounter = 0;
      }
      continue;
    }

    // Check for Question Header: e.g. "### Q 1  Quelles sont...", "### 1. ...", "### ..." or "## Q 1 ..."
    if (/^#{2,4}\s+.*$/.test(trimmed)) {
      finalizeQuestion();

      // Extract question number if present (e.g. Q 1, Q1, 1., Question 1)
      const qNumMatch = trimmed.match(/^#{2,4}\s+(?:Q\s*(\d+)|\bQuestion\s*(\d+)|(\d+)[\.\)])\s*(.*)$/i);
      let qNum: number | undefined;
      let title = trimmed.replace(/^#{2,4}\s+/, '').trim();

      if (qNumMatch) {
        const numStr = qNumMatch[1] || qNumMatch[2] || qNumMatch[3];
        if (numStr) {
          qNum = parseInt(numStr, 10);
        }
        title = (qNumMatch[4] || '').trim();
        if (!title) {
          title = trimmed.replace(/^#{2,4}\s+/, '').trim();
        }
      }

      currentQuestion = {
        title,
        questionNumber: qNum,
      };
      continue;
    }

    // Check for separator ---
    if (/^---+\s*$/.test(trimmed)) {
      finalizeQuestion();
      continue;
    }

    // Check for Explanation header: e.g. "**Explanation:**", "**Explication :**", "Explanation:"
    if (/^\*{0,2}(?:Explanation|Explication)\s*:\*{0,2}/i.test(trimmed)) {
      inExplanation = true;
      const contentAfter = trimmed.replace(/^\*{0,2}(?:Explanation|Explication)\s*:\*{0,2}/i, '').trim();
      if (contentAfter) {
        const cleanContent = contentAfter.replace(/^>\s*/, '').trim();
        if (cleanContent) {
          explanationLines.push(cleanContent);
        }
      }
      continue;
    }

    // If inside explanation block
    if (inExplanation) {
      if (trimmed.startsWith('>')) {
        explanationLines.push(trimmed.replace(/^>\s*/, ''));
        continue;
      } else if (trimmed === '') {
        // empty line inside explanation is allowed, but let's preserve paragraphs
        explanationLines.push('');
        continue;
      } else if (!trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.startsWith('#')) {
        explanationLines.push(trimmed);
        continue;
      } else {
        // Next section encountered
        inExplanation = false;
      }
    }

    // Check for Option: e.g. "- Convexe vers le haut [True]" or "* Diffus [False]"
    const optionMatch = trimmed.match(/^[-*+]\s+(.+?)\s*\[\s*(true|false|vrai|faux|t|f|1|0)\s*\]\s*$/i);
    if (optionMatch && currentQuestion) {
      const optionText = optionMatch[1].trim();
      const truthValStr = optionMatch[2].toLowerCase();
      const isCorrect = truthValStr === 'true' || truthValStr === 'vrai' || truthValStr === 't' || truthValStr === '1';

      currentOptions.push({
        id: `opt-${currentOptions.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
        text: optionText,
        isCorrect,
      });
      continue;
    }
  }

  // Finalize last question
  finalizeQuestion();

  return questions;
}

/**
 * Pure evaluation function for user answers against question options
 */
export function evaluateQuestion(
  question: MCQQuestion,
  userAnswers: Record<string, boolean>
): QuestionAttempt {
  let matchedCount = 0;
  const total = question.options.length;

  for (const option of question.options) {
    // If user marked option as true/false, check against option.isCorrect
    // Default assumption: if key is not present or false, user chose false
    const userSelected = !!userAnswers[option.id];
    if (userSelected === option.isCorrect) {
      matchedCount++;
    }
  }

  const isFullyCorrect = matchedCount === total;
  const scorePercentage = total > 0 ? Math.round((matchedCount / total) * 100) : 0;

  return {
    timestamp: Date.now(),
    userAnswers,
    isFullyCorrect,
    correctAnswersCount: matchedCount,
    totalOptionsCount: total,
    scorePercentage,
  };
}

/**
 * Formats a list of questions back to standard markdown
 */
export function exportToMarkdown(questions: MCQQuestion[]): string {
  const topicsMap = new Map<string, MCQQuestion[]>();

  for (const q of questions) {
    const list = topicsMap.get(q.topicName) || [];
    list.push(q);
    topicsMap.set(q.topicName, list);
  }

  const parts: string[] = [];

  topicsMap.forEach((qList, topicName) => {
    parts.push(`# ${topicName}\n`);

    qList.forEach((q, idx) => {
      const qNum = q.questionNumber || idx + 1;
      parts.push(`### Q ${qNum}  ${q.title}\n`);

      for (const opt of q.options) {
        parts.push(`- ${opt.text} [${opt.isCorrect ? 'True' : 'False'}]`);
      }

      if (q.explanation) {
        parts.push(`\n**Explanation:**\n> ${q.explanation.replace(/\n/g, '\n> ')}`);
      }

      parts.push('\n---\n');
    });
  });

  return parts.join('\n').trim() + '\n';
}
