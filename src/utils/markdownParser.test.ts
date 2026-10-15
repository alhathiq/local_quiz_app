import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMCQMarkdown, evaluateQuestion, exportToMarkdown } from './markdownParser.ts';

const SAMPLE_MARKDOWN = `# Infarctus du myocarde

### Q 1  Quelles sont les caractéristiques du sus-décalage du segment ST dans un IDM ?

- Convexe vers le haut [True]
- Concave vers le haut [False]
- Systématisé à un territoire vasculaire [True]
- Diffus [False]
- Évolutif [True]

**Explanation:**
> Sus-décalage du segment ST dans un SCA ST+ = onde de Pardee : convexe vers le haut, évolutif, systématisé dans un territoire de vasculaire coronaire, présence d'un miroir, association avec une onde Q.

---

### Q 2  Quels sont les critères de validité du sus-décalage du segment ST dans un IDM ?

- > 2 mm dans les dérivations V1, V2, V3 [True]
- >1 mm dans les dérivations frontales et en V4, V5, V6 [True]
- > 2 mm en DII, DIII, aVF, aVR, AVL [False]
- Supérieur à l'onde R [False]
- Caractère permanent [True]

---

# Tuberculose Pulmonaire

### Q 1  Signes radiologiques typiques de la tuberculose pulmonaire commune de l'adulte ?

- Infiltrats apicaux ou sous-claviculaires [True]
- Présence d'adénopathies hilaires volumineuses constantes [False]
- Caverne tuberculeuse à paroi épaisse [True]
- Atteinte prédominante des bases pulmonaires [False]

**Explanation:**
> La tuberculose pulmonaire de réinfection chez l'adulte siège préférentiellement aux sommets et segments postérieurs. Les adénopathies médiastinales sont l'apanage de la primo-infection chez l'enfant.
`;

test('parseMCQMarkdown parses topics, questions, options and explanations accurately', () => {
  const questions = parseMCQMarkdown(SAMPLE_MARKDOWN);

  assert.equal(questions.length, 3, 'Should parse exactly 3 questions');

  // Check Question 1
  const q1 = questions[0];
  assert.equal(q1.topicName, 'Infarctus du myocarde');
  assert.equal(q1.questionNumber, 1);
  assert.match(q1.title, /Quelles sont les caractéristiques du sus-décalage/);
  assert.equal(q1.options.length, 5);
  assert.equal(q1.options[0].text, 'Convexe vers le haut');
  assert.equal(q1.options[0].isCorrect, true);
  assert.equal(q1.options[1].text, 'Concave vers le haut');
  assert.equal(q1.options[1].isCorrect, false);
  assert.equal(q1.options[2].isCorrect, true);
  assert.equal(q1.options[3].isCorrect, false);
  assert.equal(q1.options[4].isCorrect, true);
  assert.ok(q1.explanation?.includes('onde de Pardee'));

  // Check Question 2
  const q2 = questions[1];
  assert.equal(q2.topicName, 'Infarctus du myocarde');
  assert.equal(q2.questionNumber, 2);
  assert.equal(q2.options.length, 5);

  // Check Question 3 (Topic: Tuberculose Pulmonaire)
  const q3 = questions[2];
  assert.equal(q3.topicName, 'Tuberculose Pulmonaire');
  assert.equal(q3.questionNumber, 1);
  assert.equal(q3.options.length, 4);
  assert.equal(q3.options[0].isCorrect, true);
  assert.equal(q3.options[1].isCorrect, false);
  assert.ok(q3.explanation?.includes('primo-infection'));
});

test('evaluateQuestion correctly scores full match and partial match', () => {
  const questions = parseMCQMarkdown(SAMPLE_MARKDOWN);
  const q1 = questions[0];

  // User selects exactly the 3 True options: opt 0, opt 2, opt 4
  const perfectAnswers: Record<string, boolean> = {
    [q1.options[0].id]: true,
    [q1.options[1].id]: false,
    [q1.options[2].id]: true,
    [q1.options[3].id]: false,
    [q1.options[4].id]: true,
  };

  const perfectResult = evaluateQuestion(q1, perfectAnswers);
  assert.equal(perfectResult.isFullyCorrect, true);
  assert.equal(perfectResult.correctAnswersCount, 5);
  assert.equal(perfectResult.scorePercentage, 100);

  // User made one mistake (marked opt 1 as true instead of false)
  const flawedAnswers: Record<string, boolean> = {
    [q1.options[0].id]: true,
    [q1.options[1].id]: true, // Wrong!
    [q1.options[2].id]: true,
    [q1.options[3].id]: false,
    [q1.options[4].id]: true,
  };

  const flawedResult = evaluateQuestion(q1, flawedAnswers);
  assert.equal(flawedResult.isFullyCorrect, false);
  assert.equal(flawedResult.correctAnswersCount, 4);
  assert.equal(flawedResult.scorePercentage, 80);
});

test('exportToMarkdown recreates valid markdown that can be re-parsed', () => {
  const originalQuestions = parseMCQMarkdown(SAMPLE_MARKDOWN);
  const exported = exportToMarkdown(originalQuestions);

  const reParsed = parseMCQMarkdown(exported);
  assert.equal(reParsed.length, originalQuestions.length);
  assert.equal(reParsed[0].title, originalQuestions[0].title);
  assert.equal(reParsed[0].options.length, originalQuestions[0].options.length);
  assert.equal(reParsed[0].options[0].isCorrect, originalQuestions[0].options[0].isCorrect);
});
