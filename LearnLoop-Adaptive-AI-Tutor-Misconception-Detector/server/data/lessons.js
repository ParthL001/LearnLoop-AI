/**
 * Structured Verified Lessons for the 5 Fraction Concepts
 */
export const lessons = [
  {
    id: 'lesson-understanding-fractions',
    conceptId: 'understanding-fractions',
    title: 'The Meaning of Fractions & Partitioning',
    duration: '20 mins',
    summary: 'Explore fractions as single quantities that measure parts of a whole unit, not independent top and bottom numbers.',
    objectives: [
      'Interpret a/b as a pieces of size 1/b.',
      'Explain the role of the denominator as equal partition frequency.',
      'Identify unit fractions on a number line.'
    ],
    sections: [
      {
        heading: 'What is a Fraction?',
        content: 'A fraction like 3/4 represents three copies of the unit fraction 1/4. The denominator (4) divides the whole unit into 4 equal segments. The numerator (3) indicates that we are considering 3 of those equal parts.'
      },
      {
        heading: 'Why Equal Parts Matter',
        content: 'Fractions strictly require equal partitioning. If a rectangle is cut into four unequal pieces, shading three of them does NOT represent 3/4 because the unit of measure is inconsistent.'
      }
    ],
    visualModel: {
      type: 'fraction_bar',
      wholeUnit: 1,
      partitions: 4,
      shaded: 3,
      label: '3/4 is 3 pieces of size 1/4'
    },
    takeaways: [
      'Denominator = how many equal pieces create one whole.',
      'Numerator = how many of those equal pieces are being considered.',
      'A fraction is one unified number on the number line.'
    ]
  },
  {
    id: 'lesson-equivalent-fractions',
    conceptId: 'equivalent-fractions',
    title: 'Generating Equivalent Fractions',
    duration: '25 mins',
    summary: 'Discover how renaming fractions by multiplying or dividing by forms of 1 preserves their value.',
    objectives: [
      'Show that multiplying numerator and denominator by the same integer produces an equivalent fraction.',
      'Understand that equivalent fractions cover the exact same distance or area.'
    ],
    sections: [
      {
        heading: 'The Multiplicative Identity Principle',
        content: 'In mathematics, multiplying any number by 1 does not change its value. Since 2/2 = 1, multiplying 1/2 by 2/2 produces 2/4. The number of pieces doubles, but each piece is halved in size, keeping the total quantity identical.'
      },
      {
        heading: 'Common Error: Additive Scaling',
        content: 'Adding the same number to numerator and denominator (such as adding 2 to get 3/4 from 1/2) changes the fraction! Scaling must always be multiplicative.'
      }
    ],
    visualModel: {
      type: 'comparison_bars',
      comparisons: [
        { partitions: 2, shaded: 1, label: '1/2' },
        { partitions: 4, shaded: 2, label: '2/4' },
        { partitions: 8, shaded: 4, label: '4/8' }
      ]
    },
    takeaways: [
      'Equivalent fractions represent the identical amount of a whole.',
      'Multiply or divide numerator and denominator by the same non-zero number.',
      'Never add or subtract to create equivalent fractions.'
    ]
  },
  {
    id: 'lesson-comparing-fractions',
    conceptId: 'comparing-fractions',
    title: 'Comparing Fractions & Overcoming Whole Number Bias',
    duration: '25 mins',
    summary: 'Compare fraction magnitudes by reasoning about piece size and count instead of isolated numbers.',
    objectives: [
      'Compare fractions with equal numerators.',
      'Use 1/2 as a benchmark for comparison.',
      'Recognize that a larger denominator produces smaller unit pieces.'
    ],
    sections: [
      {
        heading: 'The Inverse Relationship of Denominators',
        content: 'When dividing a whole into more pieces, each individual piece becomes smaller. For example, 1/3 is larger than 1/5 because dividing a cake into 3 slices produces larger slices than dividing it into 5 slices.'
      },
      {
        heading: 'Comparing 2/3 vs 2/5',
        content: 'Both fractions have 2 pieces. But thirds are larger pieces than fifths. Therefore, 2 larger pieces (2/3) is greater than 2 smaller pieces (2/5).'
      }
    ],
    visualModel: {
      type: 'partition_comparison',
      models: [
        { partitions: 3, shaded: 2, label: '2/3 (Two large slices)' },
        { partitions: 5, shaded: 2, label: '2/5 (Two small slices)' }
      ]
    },
    takeaways: [
      'If numerators are identical, the smaller denominator is the larger fraction.',
      'Never judge fraction size solely by which individual number is bigger.',
      'Always consider the size of the fractional unit.'
    ]
  },
  {
    id: 'lesson-same-denominator-operations',
    conceptId: 'same-denominator-operations',
    title: 'Addition & Subtraction with Like Denominators',
    duration: '20 mins',
    summary: 'Add and subtract fractions that already share the same unit partition.',
    objectives: [
      'Add numerators while keeping the shared denominator unchanged.',
      'Explain why denominators are not added.'
    ],
    sections: [
      {
        heading: 'Denominators as Unit Names',
        content: 'Think of the denominator as a unit of measurement. 1 seventh + 2 sevenths = 3 sevenths. Just as 1 apple + 2 apples = 3 apples (not 3 double-apples), 1/7 + 2/7 = 3/7, NOT 3/14.'
      }
    ],
    visualModel: {
      type: 'addition_bar',
      partitions: 7,
      addendA: 1,
      addendB: 2,
      result: 3,
      label: '1/7 + 2/7 = 3/7'
    },
    takeaways: [
      'When denominators match, only add or subtract the numerators.',
      'The denominator names the unit and stays the same.',
      'Adding denominators divides the whole into smaller pieces instead of combining them.'
    ]
  },
  {
    id: 'lesson-unlike-denominator-operations',
    conceptId: 'unlike-denominator-operations',
    title: 'Addition & Subtraction with Unlike Denominators',
    duration: '30 mins',
    summary: 'Rename unlike fractions into a shared common unit before adding or subtracting.',
    objectives: [
      'Explain why unlike fractions cannot be added directly.',
      'Find a common denominator using equivalent fractions.',
      'Execute multi-step fraction addition and subtraction.'
    ],
    sections: [
      {
        heading: 'The Need for Common Units',
        content: 'You cannot add halves and thirds directly because their piece sizes differ. To combine 1/2 and 1/3, we rename both into sixths: 1/2 = 3/6 and 1/3 = 2/6. Now both share the unit of sixths: 3/6 + 2/6 = 5/6.'
      }
    ],
    visualModel: {
      type: 'renaming_steps',
      step1: '1/2 (halves) + 1/3 (thirds) -> unequal parts',
      step2: 'Rename: 3/6 + 2/6 -> equal sixths',
      step3: 'Combine: 5/6'
    },
    takeaways: [
      'Always convert fractions to a common denominator before adding or subtracting.',
      'Find the common denominator by multiplying units or finding the LCM.',
      'Never add across denominators (e.g. 1/2 + 1/3 != 2/5).'
    ]
  }
]
