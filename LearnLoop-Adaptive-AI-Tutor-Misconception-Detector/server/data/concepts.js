/**
 * 5 Core Learning Concepts for Fractions
 */
export const concepts = [
  {
    id: 'understanding-fractions',
    title: 'Understanding Fractions',
    sequence: 1,
    description: 'Fractions represent part-whole relations. The denominator represents the number of equal parts partitioning a whole unit, and the numerator counts those parts.',
    prerequisites: [],
    keyMisconceptions: ['MIS-INDEPENDENT-COMPONENTS', 'MIS-DENOMINATOR-COUNT-ONLY'],
    objectives: [
      'Define a fraction as a single number representing a quantity, not two isolated integers.',
      'Explain that the denominator denotes equal partition size and frequency.',
      'Recognize unit fractions (1/b) as the foundational building blocks of all fractions.'
    ]
  },
  {
    id: 'equivalent-fractions',
    title: 'Equivalent Fractions',
    sequence: 2,
    description: 'Fractions are equivalent when they represent the same amount of the same whole. Equivalent fractions are created by multiplying or dividing numerator and denominator by the same non-zero number.',
    prerequisites: ['understanding-fractions'],
    keyMisconceptions: ['MIS-ADDITIVE-SCALING', 'MIS-UNILATERAL-SCALING'],
    objectives: [
      'Demonstrate that multiplying numerator and denominator by n/n preserves value (multiplication by 1).',
      'Generate equivalent fractions using visual area and number line models.',
      'Identify when two fractions name the same relative partition.'
    ]
  },
  {
    id: 'comparing-fractions',
    title: 'Comparing Fractions',
    sequence: 3,
    description: 'Comparing fraction magnitudes requires reasoning about piece sizes and counts, using benchmarks (like 1/2 or 1) or finding a shared unit of comparison.',
    prerequisites: ['understanding-fractions', 'equivalent-fractions'],
    keyMisconceptions: ['MIS-WHOLE-NUMBER-BIAS', 'MIS-NUMERATOR-EQUALITY-TRAP'],
    objectives: [
      'Compare unit fractions: recognize that larger denominators yield smaller unit slices.',
      'Compare fractions with equal numerators by reasoning about partition sizes.',
      'Compare fractions using benchmark values without premature algorithmic tricks.'
    ]
  },
  {
    id: 'same-denominator-operations',
    title: 'Addition & Subtraction with the Same Denominator',
    sequence: 4,
    description: 'When denominators are identical, fractional pieces share the same unit name. We combine or separate the count of parts (numerators) while retaining the common unit (denominator).',
    prerequisites: ['understanding-fractions'],
    keyMisconceptions: ['MIS-ADD-DENOMINATORS', 'MIS-SUBTRACT-DENOMINATORS-ZERO'],
    objectives: [
      'Explain why adding fractions with identical denominators preserves the denominator.',
      'Compute sums and differences: a/d ± b/d = (a ± b)/d.',
      'Model fraction addition as joining parts of the same unit partition.'
    ]
  },
  {
    id: 'unlike-denominator-operations',
    title: 'Addition & Subtraction with Unlike Denominators',
    sequence: 5,
    description: 'Fractions with unlike denominators cannot be added or subtracted directly because their pieces are different sizes. They must first be renamed into a common unit partition.',
    prerequisites: ['equivalent-fractions', 'same-denominator-operations'],
    keyMisconceptions: ['MIS-ADD-UNLIKE-DENOMINATORS', 'MIS-CROSS-MULTIPLICATION-CONFUSION'],
    objectives: [
      'Articulate why pieces of different sizes cannot be combined without finding a shared unit.',
      'Convert unlike fractions into equivalent fractions sharing a common denominator.',
      'Accurately sum and difference fractions with unlike denominators.'
    ]
  }
]
