/**
 * Fixed standardized pre-test and post-test assessment battery.
 * Both pre-test and post-test use the exact same fixed items, scoring rules,
 * and diagnostic rubrics to guarantee direct comparability without item variance.
 */

export const ASSESSMENT_VERSION = 'v1.0'

export const fixedAssessmentItems = [
  {
    id: 'asm-q1',
    conceptId: 'understanding-fractions',
    conceptTitle: 'Understanding Fractions',
    prompt: 'A circular pizza is divided into 6 equal slices. Carlos eats 2 slices. What fraction of the pizza did Carlos eat, and what does the number 6 tell us?',
    options: [
      '2/6; 6 is the total number of equal parts that make up the whole pizza.',
      '2/4; 6 means there are 4 slices left over.',
      '6/2; 6 is the number of slices eaten and 2 is the total.',
      '2/8; 6 is added to the 2 slices Carlos ate.'
    ],
    correctIndex: 0,
    explanation: 'Carlos ate 2 of the 6 equal slices (2/6). The denominator 6 defines the equal partitions into which the unit whole is divided.',
    misconceptionRules: [
      {
        distractorIndex: 1,
        code: 'MIS-PART-REMAINDER-RATIO',
        name: 'Part-to-Remainder Confusion',
        description: 'Learner wrote fraction as eaten parts over remaining parts instead of eaten parts over total whole.'
      },
      {
        distractorIndex: 2,
        code: 'MIS-INVERTED-COMPONENTS',
        name: 'Inverted Component Ratio',
        description: 'Learner swapped the numerator and denominator positions.'
      }
    ]
  },
  {
    id: 'asm-q2',
    conceptId: 'equivalent-fractions',
    conceptTitle: 'Equivalent Fractions',
    prompt: 'Which fraction is equivalent to 2/3, and why?',
    options: [
      '4/6, because multiplying both top and bottom by 2 multiplies the value by 2/2 (which equals 1).',
      '3/4, because you add 1 to the top and 1 to the bottom.',
      '4/3, because doubling the numerator makes the fraction double.',
      '5/6, because 2 + 3 = 5 and 3 + 3 = 6.'
    ],
    correctIndex: 0,
    explanation: 'Multiplying numerator and denominator by 2 gives (2*2)/(3*2) = 4/6. This preserves the quantity because 2/2 = 1.',
    misconceptionRules: [
      {
        distractorIndex: 1,
        code: 'MIS-ADDITIVE-EQUIVALENCE',
        name: 'Additive Scaling Misconception',
        description: 'Learner assumed adding equal numbers to numerator and denominator creates an equivalent fraction.'
      },
      {
        distractorIndex: 3,
        code: 'MIS-ADDITIVE-SUM-TRAP',
        name: 'Additive Component Sum Error',
        description: 'Learner added arbitrary amounts across components rather than multiplicative scaling.'
      }
    ]
  },
  {
    id: 'asm-q3',
    conceptId: 'comparing-fractions',
    conceptTitle: 'Comparing Fractions',
    prompt: 'Which statement correctly compares 3/4 and 3/8?',
    options: [
      '3/4 > 3/8 because fourths are larger pieces than eighths, and we have 3 of each.',
      '3/8 > 3/4 because 8 is greater than 4.',
      '3/4 = 3/8 because the numerators are both 3.',
      '3/8 > 3/4 because eighths give you more pieces.'
    ],
    correctIndex: 0,
    explanation: 'Since numerators are equal (3 pieces each), the fraction with the larger piece size is bigger. Cutting a whole into 4 pieces produces larger pieces than cutting it into 8 pieces, so 3/4 > 3/8.',
    misconceptionRules: [
      {
        distractorIndex: 1,
        code: 'MIS-WHOLE-NUMBER-BIAS',
        name: 'Whole Number Value Bias',
        description: 'Learner assumed 3/8 is larger simply because whole number 8 is larger than 4.'
      },
      {
        distractorIndex: 2,
        code: 'MIS-NUMERATOR-EQUALITY-TRAP',
        name: 'Numerator Equality Trap',
        description: 'Learner judged equality solely based on identical numerators, ignoring piece sizes.'
      }
    ]
  },
  {
    id: 'asm-q4',
    conceptId: 'same-denominator-operations',
    conceptTitle: 'Addition with Same Denominator',
    prompt: 'Calculate: 2/7 + 3/7',
    options: [
      '5/7',
      '5/14',
      '6/7',
      '5/0'
    ],
    correctIndex: 0,
    explanation: 'Both fractions are measured in sevenths. We add the counts of parts (2 + 3 = 5) while the unit partition remains sevenths: 5/7.',
    misconceptionRules: [
      {
        distractorIndex: 1,
        code: 'MIS-ADD-DENOMINATORS',
        name: 'Additive Denominators Misconception',
        description: 'Learner added denominators together (7 + 7 = 14) instead of retaining the common unit.'
      },
      {
        distractorIndex: 2,
        code: 'MIS-MULTIPLICATION-CONFUSION',
        name: 'Operation Confusion',
        description: 'Learner multiplied numerators (2 * 3 = 6) instead of adding.'
      }
    ]
  },
  {
    id: 'asm-q5',
    conceptId: 'unlike-denominator-operations',
    conceptTitle: 'Addition with Unlike Denominators',
    prompt: 'What is 1/2 + 1/4?',
    options: [
      '3/4',
      '2/6',
      '2/8',
      '1/6'
    ],
    correctIndex: 0,
    explanation: 'Halves and fourths have different piece sizes. Converting 1/2 to fourths gives 2/4. Then 2/4 + 1/4 = 3/4.',
    misconceptionRules: [
      {
        distractorIndex: 1,
        code: 'MIS-ADD-UNLIKE-DENOMINATORS',
        name: 'Additive Denominators Misconception',
        description: 'Learner added numerators across (1 + 1 = 2) and denominators across (2 + 4 = 6) without finding a common denominator.'
      },
      {
        distractorIndex: 2,
        code: 'MIS-CROSS-DENOM-MULTIPLY',
        name: 'Uncalibrated Cross-Multiplication',
        description: 'Learner multiplied denominators without adjusting numerators proportionally.'
      }
    ]
  },
  {
    id: 'asm-q6',
    conceptId: 'unlike-denominator-operations',
    conceptTitle: 'Subtraction with Unlike Denominators',
    prompt: 'Calculate: 5/6 - 1/3',
    options: [
      '3/6 (which simplifies to 1/2)',
      '4/3',
      '4/6',
      '4/9'
    ],
    correctIndex: 0,
    explanation: 'Convert 1/3 to sixths by multiplying top and bottom by 2, yielding 2/6. Then subtract: 5/6 - 2/6 = 3/6, which is equivalent to 1/2.',
    misconceptionRules: [
      {
        distractorIndex: 1,
        code: 'MIS-SUBTRACT-CROSS-DIRECT',
        name: 'Direct Subtraction Error',
        description: 'Learner subtracted numerators (5 - 1 = 4) and denominators (6 - 3 = 3) directly.'
      },
      {
        distractorIndex: 2,
        code: 'MIS-NO-NUMERATOR-SCALING',
        name: 'Incomplete Denominator Conversion',
        description: 'Learner changed denominator to 6 but forgot to scale the numerator 1 by 2.'
      }
    ]
  }
]

/**
 * Sanitizes assessment items for public / student consumption.
 * Answer keys (correctIndex, explanation, misconceptionRules) are stripped.
 */
export function sanitizeAssessmentItemForPublic(item) {
  const { correctIndex, explanation, misconceptionRules, ...safe } = item
  return safe
}

export function getPublicAssessment(type = 'pre') {
  return {
    type: ['pre', 'post'].includes(type) ? type : 'pre',
    version: ASSESSMENT_VERSION,
    title: type === 'pre'
      ? 'Fraction Foundations: Pre-Learning Diagnostic Baseline'
      : 'Fraction Foundations: Post-Learning Diagnostic Verification',
    description: 'Fixed isomorphic assessment battery covering understanding, equivalence, comparison, and fractional operations.',
    totalQuestions: fixedAssessmentItems.length,
    estimatedMinutes: 10,
    questions: fixedAssessmentItems.map(sanitizeAssessmentItemForPublic)
  }
}
