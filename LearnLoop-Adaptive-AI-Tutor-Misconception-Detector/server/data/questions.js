/**
 * Verified Diagnostic Practice Items across all 5 Fraction Concepts.
 * Contains answer keys, misconception rules, and follow-up activities.
 * NOTE: Answer keys and correctIndex must NEVER be exposed through public content endpoints.
 */

export const questions = [
  // -------------------------------------------------------------
  // CONCEPT 1: Understanding Fractions
  // -------------------------------------------------------------
  {
    id: 'q-und-1',
    conceptId: 'understanding-fractions',
    conceptTitle: 'Understanding Fractions',
    difficulty: 'foundational',
    question: 'A rectangular granola bar is cut into 4 equal pieces. You eat 3 of the pieces. What fraction describes the portion you ate, and what does the number 4 signify?',
    options: [
      '3/4; the 4 represents the number of pieces remaining.',
      '3/4; the 4 represents the total equal parts that compose the whole bar.',
      '4/3; the 4 represents the whole and 3 is the eaten part.',
      '1/4; the 4 represents the total length in inches.'
    ],
    correctIndex: 1,
    correctExplanation: 'The denominator (4) represents the number of equal parts into which the whole unit is divided. The numerator (3) counts how many of those equal parts were eaten, giving 3/4.',
    misconceptionRules: {
      0: {
        code: 'MIS-DENOMINATOR-REMAINDER',
        title: 'Denominator as Remainder Confusion',
        category: 'conceptual',
        explanation: 'You interpreted the denominator as the leftover amount rather than the total partition of the whole.',
        suggestion: 'Remember that the denominator always names the total equal pieces that make up the complete single unit.'
      },
      2: {
        code: 'MIS-INVERTED-FRACTION',
        title: 'Numerator/Denominator Inversion',
        category: 'conceptual',
        explanation: 'You placed the whole quantity in the numerator and the part in the denominator.',
        suggestion: 'In fractional notation, the top number (numerator) counts parts, and the bottom number (denominator) names the total partitions.'
      },
      3: {
        code: 'MIS-COMPLEMENT-CONFUSION',
        title: 'Complementary Fraction Slip',
        category: 'arithmetic_slip',
        explanation: 'You calculated the uneaten piece (1/4) rather than the requested portion eaten (3/4).',
        suggestion: 'Double-check the prompt: it asks for the fraction eaten (3 pieces), not what remains.'
      }
    },
    followUpActivity: {
      conceptId: 'understanding-fractions',
      type: 'partition_drill',
      recommendation: 'Review unit fraction definitions and rectangular area models in Lesson 1.'
    }
  },
  {
    id: 'q-und-2',
    conceptId: 'understanding-fractions',
    conceptTitle: 'Understanding Fractions',
    difficulty: 'intermediate',
    question: 'Which of the following representations accurately shows the fraction 2/5?',
    options: [
      'A circle divided into 5 unequal slices with 2 slices shaded.',
      'A set of 5 identical squares with 2 squares shaded.',
      'A line segment divided into 4 intervals with point at mark 2.',
      'Two circles each cut into 5 pieces with all 10 pieces shaded.'
    ],
    correctIndex: 1,
    correctExplanation: '2/5 requires two conditions: a whole partitioned into 5 equal portions, of which 2 are selected. 2 shaded squares out of 5 identical squares satisfies both.',
    misconceptionRules: {
      0: {
        code: 'MIS-UNEQUAL-PARTITIONS',
        title: 'Ignoring Equal Partition Requirement',
        category: 'conceptual',
        explanation: 'Fractions strictly require equal partitions. Unequal slices cannot represent a standard fraction.',
        suggestion: 'Check that every partition covers the exact same area or distance before naming the fraction.'
      },
      2: {
        code: 'MIS-OFF-BY-ONE-PARTITION',
        title: 'Partition Count Slip',
        category: 'arithmetic_slip',
        explanation: 'A line with 4 intervals represents fourths (2/4 = 1/2), not fifths.',
        suggestion: 'Count the total number of sub-intervals between 0 and 1, not just the tick marks.'
      },
      3: {
        code: 'MIS-WHOLE-MULTIPLIER',
        title: 'Multiple Whole Overcount',
        category: 'conceptual',
        explanation: 'This models 10/5 = 2 wholes, rather than 2/5 of a single unit.',
        suggestion: 'A proper fraction like 2/5 must be less than 1 whole unit.'
      }
    },
    followUpActivity: {
      conceptId: 'understanding-fractions',
      type: 'equal_sharing_task',
      recommendation: 'Practice partitioning whole shapes into strictly congruent regions.'
    }
  },

  // -------------------------------------------------------------
  // CONCEPT 2: Equivalent Fractions
  // -------------------------------------------------------------
  {
    id: 'q-eqv-1',
    conceptId: 'equivalent-fractions',
    conceptTitle: 'Equivalent Fractions',
    difficulty: 'foundational',
    question: 'Which fraction is equivalent to 3/4?',
    options: [
      '6/8: obtained by multiplying both numerator and denominator by 2.',
      '5/6: obtained by adding 2 to both numerator and denominator.',
      '6/4: obtained by multiplying only the numerator by 2.',
      '3/8: obtained by doubling the denominator while keeping the numerator.'
    ],
    correctIndex: 0,
    correctExplanation: 'Multiplying both numerator and denominator by 2 is equivalent to multiplying by 2/2 = 1. Therefore, 3/4 = (3*2)/(4*2) = 6/8.',
    misconceptionRules: {
      1: {
        code: 'MIS-ADDITIVE-SCALING',
        title: 'Additive Scaling Misconception',
        category: 'conceptual',
        explanation: 'Adding the same number to numerator and denominator changes the fraction value (3/4 = 0.75, but 5/6 ≈ 0.833).',
        suggestion: 'Equivalent fractions can only be created by multiplication or division by a form of 1 (n/n), never by addition or subtraction.'
      },
      2: {
        code: 'MIS-UNILATERAL-SCALING',
        title: 'One-Sided Scaling Error',
        category: 'conceptual',
        explanation: 'Multiplying only the numerator doubles the whole quantity (6/4 = 1.5, which is twice 3/4).',
        suggestion: 'Whatever scaling factor is applied to the numerator must also be applied to the denominator to preserve proportionality.'
      },
      3: {
        code: 'MIS-DENOMINATOR-DOUBLING-HALVING',
        title: 'Halving Value through Denominator Doubling',
        category: 'conceptual',
        explanation: 'Doubling only the denominator cuts each piece size in half, producing half the original amount (3/8 is half of 3/4).',
        suggestion: 'If pieces are cut into twice as many smaller parts, you must also have twice as many pieces to keep the same amount.'
      }
    },
    followUpActivity: {
      conceptId: 'equivalent-fractions',
      type: 'multiplicative_identity_review',
      recommendation: 'Review equivalent fraction visual bars in Lesson 2.'
    }
  },
  {
    id: 'q-eqv-2',
    conceptId: 'equivalent-fractions',
    conceptTitle: 'Equivalent Fractions',
    difficulty: 'intermediate',
    question: 'Find the missing numerator: 2/3 = ?/15. How do you find it conceptually?',
    options: [
      '14: add 12 to 2 because 3 + 12 = 15.',
      '10: multiply 2 by 5 because 15 is 3 multiplied by 5.',
      '6: multiply 2 by 3 because 15 is 5 times 3.',
      '5: divide 15 by 3 without multiplying the numerator.'
    ],
    correctIndex: 1,
    correctExplanation: 'The denominator scaled from 3 to 15 by a factor of 5 (3 * 5 = 15). To maintain equivalence, the numerator must also be multiplied by 5: 2 * 5 = 10. Thus, 2/3 = 10/15.',
    misconceptionRules: {
      0: {
        code: 'MIS-ADDITIVE-SCALING',
        title: 'Additive Scaling Misconception',
        category: 'conceptual',
        explanation: 'You added 12 to the numerator because 3 + 12 = 15. Fraction scaling is strictly multiplicative.',
        suggestion: 'Determine what factor multiplies 3 to get 15 (which is 5), then multiply the numerator by that same factor.'
      },
      2: {
        code: 'MIS-WRONG-FACTOR-APPLICATION',
        title: 'Calculation Slip on Scaling Factor',
        category: 'arithmetic_slip',
        explanation: 'You multiplied by 3 instead of 5. The denominator ratio 15/3 is 5.',
        suggestion: 'Check your division: 15 divided by 3 equals 5, so the scale factor is 5.'
      },
      3: {
        code: 'MIS-FACTOR-CONFUSION',
        title: 'Factor Extraction without Application',
        category: 'arithmetic_slip',
        explanation: '5 is the scaling factor, not the resulting numerator.',
        suggestion: 'Remember to multiply the original numerator (2) by the scale factor (5) to get 10.'
      }
    },
    followUpActivity: {
      conceptId: 'equivalent-fractions',
      type: 'scaling_ladder',
      recommendation: 'Practice proportional scaling tables for equivalent fractions.'
    }
  },

  // -------------------------------------------------------------
  // CONCEPT 3: Comparing Fractions
  // -------------------------------------------------------------
  {
    id: 'q-cmp-1',
    conceptId: 'comparing-fractions',
    conceptTitle: 'Comparing Fractions',
    difficulty: 'foundational',
    question: 'A recipe calls for 2/3 cup of flour. Your measuring cup has markings for 2/5 cup. Which quantity is greater, and why?',
    options: [
      '2/5 cup is greater because 5 is greater than 3.',
      '2/3 cup is greater because thirds divide the cup into fewer, larger portions.',
      'Both amounts are identical because the numerators are both 2.',
      '2/5 cup is greater because the denominator represents the total volume.'
    ],
    correctIndex: 1,
    correctExplanation: 'When numerators are equal (2 pieces in each), the fraction with the smaller denominator has larger individual pieces. Therefore, 2 larger pieces (2/3) is greater than 2 smaller pieces (2/5).',
    misconceptionRules: {
      0: {
        code: 'MIS-WHOLE-NUMBER-BIAS',
        title: 'Whole Number Value Bias',
        category: 'conceptual',
        explanation: 'You compared the denominators as standalone integers (5 > 3). In fractions, larger denominators create smaller individual pieces.',
        suggestion: 'Visualize dividing a pizza into 3 slices versus 5 slices: 2 of the bigger thirds give you more pizza than 2 fifths.'
      },
      2: {
        code: 'MIS-NUMERATOR-EQUALITY-TRAP',
        title: 'Numerator Equality Trap',
        category: 'conceptual',
        explanation: 'Equal numerators mean equal slice count, but the size of those slices differs drastically based on the denominator.',
        suggestion: 'Having 2 dimes is not the same value as having 2 quarters even though the count is 2!'
      },
      3: {
        code: 'MIS-DENOMINATOR-VOLUME-CONFUSION',
        title: 'Denominator as Total Volume Error',
        category: 'conceptual',
        explanation: 'The denominator reflects partitioning frequency, not the physical amount.',
        suggestion: 'Revisit unit fraction definitions in Lesson 1.'
      }
    },
    followUpActivity: {
      conceptId: 'comparing-fractions',
      type: 'visual_bar_comparison',
      recommendation: 'Work through the interactive partition comparison diagram in Lesson 3.'
    }
  },
  {
    id: 'q-cmp-2',
    conceptId: 'comparing-fractions',
    conceptTitle: 'Comparing Fractions',
    difficulty: 'intermediate',
    question: 'Compare 5/8 and 3/8. Which statement is correct?',
    options: [
      '5/8 > 3/8 because both share eighths as the unit, and 5 parts is more than 3 parts.',
      '3/8 > 5/8 because smaller numerators mean larger slices.',
      'They cannot be compared without finding a common denominator first.',
      'Both are equal to 1/2.'
    ],
    correctIndex: 0,
    correctExplanation: 'Since both fractions have identical denominators (eighths), the pieces are the exact same size. 5 of those pieces is strictly greater than 3 of those pieces.',
    misconceptionRules: {
      1: {
        code: 'MIS-INVERTED-NUMERATOR-LOGIC',
        title: 'Inverted Numerator Reasoning',
        category: 'conceptual',
        explanation: 'You applied denominator inverse logic to the numerator. Numerators directly count pieces, so more pieces of the same size always means a larger quantity.',
        suggestion: 'Remember: smaller denominator = bigger slice; but bigger numerator = more slices.'
      },
      2: {
        code: 'MIS-UNNECESSARY-ALGORITHM',
        title: 'Unnecessary Common Denominator Search',
        category: 'conceptual',
        explanation: 'Both fractions already share the common denominator of 8. No conversion is needed.',
        suggestion: 'When denominators already match, simply compare the numerators directly.'
      },
      3: {
        code: 'MIS-BENCHMARK-ROUGH-ESTIMATE',
        title: 'Inaccurate Benchmark Estimation',
        category: 'arithmetic_slip',
        explanation: '4/8 is 1/2; 3/8 is less than half and 5/8 is greater than half.',
        suggestion: 'Use 4/8 (1/2) as a benchmark to see that 3/8 < 1/2 < 5/8.'
      }
    },
    followUpActivity: {
      conceptId: 'comparing-fractions',
      type: 'benchmark_half_drill',
      recommendation: 'Practice sorting fractions around the benchmark of 1/2.'
    }
  },

  // -------------------------------------------------------------
  // CONCEPT 4: Addition and Subtraction with Same Denominator
  // -------------------------------------------------------------
  {
    id: 'q-same-1',
    conceptId: 'same-denominator-operations',
    conceptTitle: 'Addition & Subtraction with the Same Denominator',
    difficulty: 'foundational',
    question: 'Evaluate the sum: 1/5 + 2/5. What is the resulting fraction?',
    options: [
      '3/10: add both numerators (1+2) and both denominators (5+5).',
      '3/5: combine the counts (1+2) while retaining the shared unit fifths.',
      '2/25: multiply across both numerator and denominator.',
      '3/25: add numerators and multiply denominators.'
    ],
    correctIndex: 1,
    correctExplanation: 'Since both fractions share the common unit (fifths), you add the counts of those units: 1 + 2 = 3. The unit size remains fifths, giving 3/5.',
    misconceptionRules: {
      0: {
        code: 'MIS-ADD-DENOMINATORS',
        title: 'Additive Denominator Misconception',
        category: 'conceptual',
        explanation: 'You added the denominators (5 + 5 = 10). Denominators are unit names, not additional quantities to sum.',
        suggestion: 'Think: 1 fifth + 2 fifths = 3 fifths. You would not say 1 meter + 2 meters = 3 double-meters.'
      },
      2: {
        code: 'MIS-OPERATION-CONFUSION-MULTIPLICATION',
        title: 'Multiplying Instead of Adding',
        category: 'conceptual',
        explanation: 'You applied fraction multiplication rules (1*2)/(5*5) to an addition problem.',
        suggestion: 'Check the operation symbol (+). In addition with like denominators, only the numerators are combined.'
      },
      3: {
        code: 'MIS-HYBRID-OPERATION-SLIP',
        title: 'Hybrid Addition-Multiplication Error',
        category: 'conceptual',
        explanation: 'You added numerators but multiplied denominators (5 * 5 = 25).',
        suggestion: 'The denominator names the partition size and does not change during like-denominator addition.'
      }
    },
    followUpActivity: {
      conceptId: 'same-denominator-operations',
      type: 'unit_name_reinforcement',
      recommendation: 'Complete the like-denominator addition bar activity in Lesson 4.'
    }
  },
  {
    id: 'q-same-2',
    conceptId: 'same-denominator-operations',
    conceptTitle: 'Addition & Subtraction with the Same Denominator',
    difficulty: 'intermediate',
    question: 'Calculate: 7/9 - 4/9. What is the exact difference?',
    options: [
      '3/0: 7 - 4 = 3 and 9 - 9 = 0.',
      '3/9: 7 - 4 = 3 while retaining the ninths denominator.',
      '3/18: subtract numerators and add denominators.',
      '11/9: added the numerators instead of subtracting.'
    ],
    correctIndex: 1,
    correctExplanation: 'Subtracting 4 ninths from 7 ninths leaves 3 ninths (3/9). The denominator remains 9.',
    misconceptionRules: {
      0: {
        code: 'MIS-SUBTRACT-DENOMINATORS-ZERO',
        title: 'Subtracting Denominators to Zero',
        category: 'conceptual',
        explanation: 'You subtracted 9 - 9 = 0. Division by zero is undefined, and the denominator names the piece size, which remains ninths.',
        suggestion: 'Keep the denominator unchanged: 7 pieces minus 4 pieces leaves 3 pieces of size 1/9.'
      },
      2: {
        code: 'MIS-ADD-DENOMINATORS-ON-SUBTRACTION',
        title: 'Denominator Addition during Subtraction',
        category: 'conceptual',
        explanation: 'You added the denominators (9 + 9 = 18) while subtracting numerators.',
        suggestion: 'The denominator is the constant unit name and does not change.'
      },
      3: {
        code: 'MIS-SIGN-OPERATION-SLIP',
        title: 'Operation Sign Inversion Slip',
        category: 'arithmetic_slip',
        explanation: 'You added 7 + 4 = 11 instead of subtracting 7 - 4 = 3.',
        suggestion: 'Notice the minus sign (-) in the expression 7/9 - 4/9.'
      }
    },
    followUpActivity: {
      conceptId: 'same-denominator-operations',
      type: 'subtraction_model',
      recommendation: 'Practice like-denominator subtraction on number line models.'
    }
  },

  // -------------------------------------------------------------
  // CONCEPT 5: Addition and Subtraction with Unlike Denominators
  // -------------------------------------------------------------
  {
    id: 'q-unl-1',
    conceptId: 'unlike-denominator-operations',
    conceptTitle: 'Addition & Subtraction with Unlike Denominators',
    difficulty: 'intermediate',
    question: 'Evaluate: 1/2 + 1/3. What is the principled method and correct result?',
    options: [
      '2/5: add numerators 1 + 1 = 2 and denominators 2 + 3 = 5.',
      '5/6: convert to common denominator (3/6 + 2/6) then sum numerators 3 + 2 = 5.',
      '1/5: multiply numerators and add denominators.',
      '2/6: keep the common denominator 6 but add numerators as 1 + 1 = 2.'
    ],
    correctIndex: 1,
    correctExplanation: 'Because halves and thirds are different unit sizes, rename both into sixths: 1/2 = 3/6 and 1/3 = 2/6. Now with like units: 3/6 + 2/6 = 5/6.',
    misconceptionRules: {
      0: {
        code: 'MIS-ADD-UNLIKE-DENOMINATORS',
        title: 'Direct Addition of Unlike Denominators',
        category: 'conceptual',
        explanation: 'You added across top and bottom (1+1)/(2+3) = 2/5. Notice that 2/5 (0.4) is smaller than 1/2 (0.5), which is impossible when adding two positive quantities!',
        suggestion: 'Pieces of different sizes cannot be combined directly. Always rename to a common denominator first.'
      },
      2: {
        code: 'MIS-OPERATION-CONFUSION',
        title: 'Mixed Multiplicative-Additive Rule',
        category: 'conceptual',
        explanation: 'You multiplied numerators and added denominators.',
        suggestion: 'Step 1: Find common denominator. Step 2: Convert equivalent numerators. Step 3: Add numerators.'
      },
      3: {
        code: 'MIS-OMITTED-NUMERATOR-SCALING',
        title: 'Omitted Numerator Scaling during Renaming',
        category: 'conceptual',
        explanation: 'You changed the denominator to 6 but forgot to scale the numerators (1/2 must become 3/6, not 1/6).',
        suggestion: 'When multiplying the denominator by 3, you must also multiply the numerator by 3: 1/2 * 3/3 = 3/6.'
      }
    },
    followUpActivity: {
      conceptId: 'unlike-denominator-operations',
      type: 'common_unit_renaming_drill',
      recommendation: 'Review the two-step renaming procedure in Lesson 5.'
    }
  },
  {
    id: 'q-unl-2',
    conceptId: 'unlike-denominator-operations',
    conceptTitle: 'Addition & Subtraction with Unlike Denominators',
    difficulty: 'advanced',
    question: 'Calculate: 3/4 - 1/2. What is the simplified difference?',
    options: [
      '2/2 = 1: subtract 3 - 1 = 2 and 4 - 2 = 2.',
      '1/4: rename 1/2 as 2/4, then compute 3/4 - 2/4 = 1/4.',
      '2/4: subtract numerators without renaming 1/2.',
      '1/2: subtract denominators and keep numerator.'
    ],
    correctIndex: 1,
    correctExplanation: 'Rename 1/2 to fourths: 1/2 = 2/4. Then 3/4 - 2/4 = (3 - 2)/4 = 1/4.',
    misconceptionRules: {
      0: {
        code: 'MIS-SUBTRACT-ACROSS-COMPONENTS',
        title: 'Component-Wise Independent Subtraction',
        category: 'conceptual',
        explanation: 'You subtracted numerators and denominators independently (3-1)/(4-2) = 2/2 = 1. 3/4 is less than 1, so subtracting from it cannot equal 1!',
        suggestion: 'Never subtract denominators. Convert both fractions into fourths first.'
      },
      2: {
        code: 'MIS-UNCONVERTED-SUBTRACTION-SLIP',
        title: 'Subtracting Numerators without Matching Units',
        category: 'conceptual',
        explanation: 'You computed 3 - 1 = 2 fourths, forgetting that the 1 was halves (1 half = 2 fourths).',
        suggestion: 'Always write out the equivalent fractions before subtracting: 3/4 - 2/4 = 1/4.'
      },
      3: {
        code: 'MIS-DENOMINATOR-DIFFERENCE-CONFUSION',
        title: 'Inverted Operation Pattern',
        category: 'conceptual',
        explanation: 'You subtracted denominators 4 - 2 = 2 and kept a numerator of 1.',
        suggestion: 'Follow standard order: Find common denominator -> Rename numerators -> Subtract numerators.'
      }
    },
    followUpActivity: {
      conceptId: 'unlike-denominator-operations',
      type: 'equivalent_subtraction_drill',
      recommendation: 'Practice converting halves to fourths using visual ruler models.'
    }
  }
]

/**
 * Strips confidential answer keys and diagnostic rules before serving publicly.
 * @param {object} q Question object
 * @returns {object} Public question representation
 */
export function sanitizeQuestionForPublic(q) {
  const { correctIndex, correctExplanation, misconceptionRules, ...publicData } = q
  return publicData
}
