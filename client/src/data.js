export const topics = [
  { id: 'fractions', title: 'Fractions made simple', subject: 'Mathematics', level: 'Beginner', duration: '18 min', progress: 68, symbol: '½', color: 'violet', description: 'Compare fractions, visualize parts, and understand why the denominator matters.', lessons: 5, students: 24 },
  { id: 'algebra', title: 'Algebra foundations', subject: 'Mathematics', level: 'Beginner', duration: '24 min', progress: 35, symbol: 'ƒ(x)', color: 'blue', description: 'Understand variables and solve simple equations one step at a time.', lessons: 6, students: 18 },
  { id: 'logic', title: 'Programming logic', subject: 'Computer Science', level: 'Intermediate', duration: '30 min', progress: 12, symbol: '{ }', color: 'green', description: 'Practice conditions, loops, and tracing code with small examples.', lessons: 8, students: 32 },
  { id: 'probability', title: 'Probability basics', subject: 'Mathematics', level: 'Intermediate', duration: '20 min', progress: 0, symbol: '✳', color: 'amber', description: 'Explore chance, outcomes, and simple probability experiments.', lessons: 4, students: 15 },
]
export const initialStudents = [
  { id: 's1', name: 'Aarav Shah', email: 'aarav@example.com', concept: 'Equivalent fractions', mastery: 82, status: 'On track', activity: 'Today, 9:42 AM', attempts: 14 },
  { id: 's2', name: 'Mira Joshi', email: 'mira@example.com', concept: 'Comparing denominators', mastery: 46, status: 'Needs support', activity: 'Today, 9:15 AM', attempts: 8 },
  { id: 's3', name: 'Kabir Patel', email: 'kabir@example.com', concept: 'Fraction visualisation', mastery: 67, status: 'On track', activity: 'Yesterday', attempts: 11 },
  { id: 's4', name: 'Anaya Deshmukh', email: 'anaya@example.com', concept: 'Equivalent fractions', mastery: 31, status: 'Needs support', activity: 'Yesterday', attempts: 6 },
]
export const sampleCases = [
  { id: 'm1', student: 'Mira Joshi', concept: 'Comparing denominators', quote: '2/5 is larger because 5 is bigger than 3.', hypothesis: 'May be applying whole-number comparison to denominators.', confidence: 'Medium', followUp: 'If the same pizza is cut into 3 equal pieces versus 5 equal pieces, which single piece is larger?', next: 'Use a visual model and ask the follow-up before assigning practice.', status: 'Needs review' },
  { id: 'm2', student: 'Anaya Deshmukh', concept: 'Equivalent fractions', quote: '1/2 and 2/4 are different because the numbers are different.', hypothesis: 'May be focusing on the digits rather than the value represented.', confidence: 'Medium', followUp: 'Can you shade one half and two quarters of the same rectangle and compare the shaded area?', next: 'Compare area models and ask the learner to explain what stays the same.', status: 'Needs review' },
  { id: 'm3', student: 'Kabir Patel', concept: 'Calculation slip', quote: 'The method is right, but the final arithmetic is incorrect.', hypothesis: 'Could be a one-off calculation slip rather than a conceptual misconception.', confidence: 'Low', followUp: 'Can you repeat the last calculation slowly and check each step?', next: 'Avoid assigning a misconception label until another example confirms a pattern.', status: 'Clarify' },
]
