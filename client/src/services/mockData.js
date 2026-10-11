// Initial mock data for Cognara Adaptive Learning Platform

export const initialLearner = {
  id: 'learner-01',
  name: 'Alex Rivera',
  email: 'alex.rivera@edu.org',
  grade: 'Grade 8',
  learningGoal: 'Master Fractional Reasoning & Algebra Foundations',
  streakDays: 5,
  hoursLearnedThisWeek: 3.8,
  overallMastery: 72,
}

export const topics = [
  {
    id: 'fractions',
    title: 'Fractional Reasoning & Sense',
    subject: 'Mathematics',
    level: 'Foundational',
    symbol: '⅔',
    color: 'violet',
    description: 'Understand fractions as relative quantities, visualize piece size across denominators, and avoid whole-number traps.',
    mastery: 68,
    totalLessons: 6,
    completedLessons: 4,
    duration: '45 mins',
    misconceptionsTracked: 3,
    misconceptionStatus: 'Needs follow-up on unlike denominators',
    objectives: [
      'Compare fraction magnitudes without cross-multiplication shortcuts',
      'Explain how denominator growth affects piece size',
      'Model addition and subtraction using common units',
      'Identify and self-correct whole-number bias in fractions'
    ]
  },
  {
    id: 'algebra',
    title: 'Algebraic Balancing & Equations',
    subject: 'Mathematics',
    level: 'Intermediate',
    symbol: 'x²',
    color: 'sky',
    description: 'Master the concept of the equal sign as balance, preserve equality across inverse operations, and manipulate variables conceptually.',
    mastery: 54,
    totalLessons: 8,
    completedLessons: 3,
    duration: '60 mins',
    misconceptionsTracked: 4,
    misconceptionStatus: 'Developing operational fluency',
    objectives: [
      'Interpret the equal sign as relational balance, not "do the operation"',
      'Apply inverse operations symmetrically to both sides',
      'Distribute negative signs across parentheses reliably',
      'Translate word scenarios into single-variable equations'
    ]
  },
  {
    id: 'logic',
    title: 'Computational Logic & Conditionals',
    subject: 'Computer Science',
    level: 'Intermediate',
    symbol: '&&',
    color: 'emerald',
    description: 'Dissect compound boolean expressions, De Morgan’s laws, and understand truth tables without rote memorization.',
    mastery: 82,
    totalLessons: 5,
    completedLessons: 4,
    duration: '40 mins',
    misconceptionsTracked: 2,
    misconceptionStatus: 'Mastered core conditionals',
    objectives: [
      'Evaluate nested AND/OR expressions accurately',
      'Apply negation to compound statements (De Morgan)',
      'Recognize short-circuit evaluation in code branches',
      'Construct truth tables for multi-condition branching'
    ]
  },
  {
    id: 'probability',
    title: 'Probabilistic Intuition & Odds',
    subject: 'Mathematics & Data',
    level: 'Foundational',
    symbol: 'P(A)',
    color: 'amber',
    description: 'Disentangle independent events, overcome the gambler’s fallacy, and reason systematically about sample spaces.',
    mastery: 38,
    totalLessons: 6,
    completedLessons: 2,
    duration: '50 mins',
    misconceptionsTracked: 3,
    misconceptionStatus: 'Active misconception: Independent trials',
    objectives: [
      'Define sample spaces for multi-stage experiments',
      'Distinguish between independent and dependent trials',
      'Identify the gambler’s fallacy in streak predictions',
      'Calculate theoretical vs empirical relative frequency'
    ]
  }
]

export const learningPathMilestones = [
  {
    id: 'm1',
    topicId: 'fractions',
    title: 'Milestone 1: The Meaning of the Denominator',
    description: 'Explore the denominator as the number of equal parts that constitute a whole. Contrast larger numbers with smaller slice sizes.',
    status: 'completed',
    type: 'concept',
    duration: '15 mins',
    score: 95
  },
  {
    id: 'm2',
    topicId: 'fractions',
    title: 'Milestone 2: Unit Fractions Comparison',
    description: 'Compare fractions with identical numerators (e.g., 1/3 vs 1/5) using visual bar and circle models.',
    status: 'completed',
    type: 'concept',
    duration: '20 mins',
    score: 88
  },
  {
    id: 'm3',
    topicId: 'fractions',
    title: 'Milestone 3: Misconception Checkpoint — Unlike Denominators',
    description: 'Diagnostic probe: why can’t we simply compute 1/2 + 1/3 as (1+1)/(2+3)? Unpack the common unit requirement.',
    status: 'in_progress',
    type: 'diagnostic',
    duration: '25 mins',
    score: null
  },
  {
    id: 'm4',
    topicId: 'fractions',
    title: 'Milestone 4: Common Denominator Conversion',
    description: 'Scale equivalent fractions symmetrically using multiplying by form of 1.',
    status: 'next_up',
    type: 'practice',
    duration: '30 mins',
    score: null
  },
  {
    id: 'm5',
    topicId: 'fractions',
    title: 'Milestone 5: Post-Assessment & Mastery Synthesis',
    description: 'Validate growth against baseline assessment items and solidify retention.',
    status: 'locked',
    type: 'assessment',
    duration: '20 mins',
    score: null
  }
]

export const practiceQuestions = [
  {
    id: 'q-frac-1',
    topicId: 'fractions',
    concept: 'Comparing Fraction Magnitudes',
    question: 'A recipe calls for 2/3 cup of flour. Your measuring cup has markings for 2/5 cup. Which quantity is greater, and why?',
    options: [
      '2/5 cup is greater because 5 is greater than 3.',
      '2/3 cup is greater because thirds divide the cup into fewer, larger portions.',
      'Both amounts are identical because the numerators are both 2.',
      '2/5 cup is greater because the denominator represents the total volume.'
    ],
    correctIndex: 1,
    misconceptionTags: {
      0: {
        code: 'MIS-FRAC-01',
        title: 'Whole Number Value Bias',
        explanation: 'You compared the denominators as isolated integers (5 > 3). Remember that the denominator indicates partition frequency: more partitions mean each portion is smaller.',
        suggestion: 'Visualize dividing a loaf of bread into 3 slices versus 5 slices. 2 of the larger slices yield more bread.'
      },
      2: {
        code: 'MIS-FRAC-02',
        title: 'Numerator Equality Trap',
        explanation: 'Equal numerators mean equal slice count, but the size of those slices differs drastically based on the denominator.',
        suggestion: '2 quarters (2/4) is not the same amount as 2 halves (2/2)!'
      },
      3: {
        code: 'MIS-FRAC-03',
        title: 'Denominator as Total Quantity Confusion',
        explanation: 'The denominator reflects division density, not total standalone volume.',
        suggestion: 'Revisit unit fraction definitions in Lesson 1.'
      }
    },
    hint: 'Think about splitting a pizza among 3 friends vs among 5 friends. Who gets a bigger slice?',
    explanation: 'When numerators are equal, the fraction with the smaller denominator is larger because each fractional piece is larger.'
  },
  {
    id: 'q-frac-2',
    topicId: 'fractions',
    concept: 'Fraction Addition & Common Units',
    question: 'Evaluate the sum: 1/4 + 2/4. What is the resulting quantity?',
    options: [
      '3/8 — add both numerators and denominators',
      '3/4 — the units are identical (fourths), so we combine parts',
      '2/16 — multiply denominators and add numerators',
      '1/2 — simplify immediately'
    ],
    correctIndex: 1,
    misconceptionTags: {
      0: {
        code: 'MIS-FRAC-04',
        title: 'Additive Denominator Misconception',
        explanation: 'Denominators define the unit name ("fourths"). You do not add the unit names together; you only add how many units you have.',
        suggestion: '1 apple + 2 apples = 3 apples, not 3 "double-apples".'
      }
    },
    hint: 'Notice that both fractions already share the same denominator.',
    explanation: 'Since fourths are already a shared common unit, we add the numerators 1 + 2 = 3 while retaining the unit (fourths), giving 3/4.'
  },
  {
    id: 'q-alg-1',
    topicId: 'algebra',
    concept: 'Inverse Operations & Equality',
    question: 'Solve for x in: 3x - 7 = 14. What is the first principled step?',
    options: [
      'Subtract 7 from both sides to cancel out the 7.',
      'Add 7 to both sides to balance and undo the subtraction of 7.',
      'Divide both sides by 3 before dealing with the 7.',
      'Multiply 14 by 3 to simplify the variable coefficient.'
    ],
    correctIndex: 1,
    misconceptionTags: {
      0: {
        code: 'MIS-ALG-01',
        title: 'Sign Inversion Reversal',
        explanation: 'To undo a negative term (-7), the inverse operation is addition (+7), not subtraction.',
        suggestion: 'Adding 7 to (-7) produces 0, leaving 3x isolated.'
      },
      2: {
        code: 'MIS-ALG-02',
        title: 'Premature Coefficient Division',
        explanation: 'Dividing by 3 first is technically possible if applied to EVERY term (including -7/3), but introduces unwieldy fractions early.',
        suggestion: 'Isolate variable terms first by adding/subtracting constants.'
      }
    },
    hint: 'What operation inverses subtracting 7?',
    explanation: 'Adding 7 to both sides maintains balance: 3x - 7 + 7 = 14 + 7 => 3x = 21, then dividing by 3 yields x = 7.'
  }
]

export const activityTrendData = [
  { day: 'Mon', minutes: 25, questionsSolved: 6, accuracy: 83 },
  { day: 'Tue', minutes: 40, questionsSolved: 11, accuracy: 72 },
  { day: 'Wed', minutes: 30, questionsSolved: 8, accuracy: 88 },
  { day: 'Thu', minutes: 55, questionsSolved: 14, accuracy: 64 },
  { day: 'Fri', minutes: 45, questionsSolved: 12, accuracy: 91 },
  { day: 'Sat', minutes: 60, questionsSolved: 16, accuracy: 85 },
  { day: 'Sun', minutes: 20, questionsSolved: 5, accuracy: 80 }
]

export const recentMisconceptions = [
  {
    id: 'mis-rec-1',
    concept: 'Comparing Unlike Denominators',
    studentHypothesis: 'Student assumes larger denominator implies larger overall fraction quantity (5 > 3 implies 2/5 > 2/3).',
    status: 'In Remediation',
    confidence: 'High (3 consistent occurrences)',
    detectedAt: 'Yesterday',
    remedyAction: 'Tutor intervention scheduled with visual bar partitioning.'
  },
  {
    id: 'mis-rec-2',
    concept: 'Cross-Denominator Addition',
    studentHypothesis: 'Tendency to add across numerators and denominators independently when denominators differ.',
    status: 'Resolved',
    confidence: 'Verified via 4 follow-up probes',
    detectedAt: '3 days ago',
    remedyAction: 'Completed common-unit equivalence drill.'
  }
]
