/**
 * Subjects & Topics Catalog
 * Defines supported subjects (Python & C++) and their respective 5 curriculum topics.
 */

export const SUBJECTS = [
  {
    id: 'python',
    name: 'Python',
    description: 'A versatile, readable programming language ideal for beginners, software development, and foundational algorithms.',
    icon: 'Code2',
    level: 'Beginner to Intermediate',
    topics: [
      {
        id: 'data-types',
        title: 'Data Types',
        description: 'Understand core Python data types including integers, floats, strings, booleans, and type conversion.',
        objective: 'Learn how to identify, assign, and convert between primitive data types in Python.'
      },
      {
        id: 'variables',
        title: 'Variables',
        description: 'Master variable naming rules, assignment, re-assignment, and memory reference principles.',
        objective: 'Declare and manipulate Python variables following PEP 8 naming conventions and scoping basics.'
      },
      {
        id: 'loops',
        title: 'Loops',
        description: 'Automate repetitive tasks with for loops, while loops, range(), and loop control statements.',
        objective: 'Write iterative logic using for and while loops with break and continue statements.'
      },
      {
        id: 'stack',
        title: 'Stack',
        description: 'Understand the Last-In, First-Out (LIFO) data structure, push/pop operations, and list-based implementation.',
        objective: 'Conceptualize stack behavior, implement push and pop operations, and understand practical applications like undo or call stacks.'
      },
      {
        id: 'queue',
        title: 'Queue',
        description: 'Understand the First-In, First-Out (FIFO) data structure, enqueue/dequeue operations, and collections.deque usage.',
        objective: 'Conceptualize queue behavior, implement FIFO buffering, and differentiate queue operations from stack operations.'
      }
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    description: 'A fast, high-performance systems language focused on direct hardware control, typed structures, and memory efficiency.',
    icon: 'Terminal',
    level: 'Beginner to Intermediate',
    topics: [
      {
        id: 'data-types',
        title: 'Data Types',
        description: 'Explore statically typed primitives: int, float, double, char, bool, and their memory representations.',
        objective: 'Select appropriate C++ primitive types, understand memory footprint sizes, and avoid type overflow.'
      },
      {
        id: 'variables',
        title: 'Variables',
        description: 'Master variable declaration, initialization, const qualifiers, and basic variable scope.',
        objective: 'Declare, initialize, and safely modify typed variables within functional and block scopes in C++.'
      },
      {
        id: 'loops',
        title: 'Loops',
        description: 'Control program flow with for loops, while loops, and do-while loops with index boundary safety.',
        objective: 'Construct iterative algorithms in C++ while preventing infinite loops and off-by-one index errors.'
      },
      {
        id: 'stack',
        title: 'Stack',
        description: 'Explore the LIFO data structure using std::stack and manual array/struct management with push, pop, and top.',
        objective: 'Implement stack mechanics in C++, handle underflow/overflow scenarios, and inspect top elements.'
      },
      {
        id: 'queue',
        title: 'Queue',
        description: 'Explore the FIFO data structure using std::queue and circular buffer logic with push, pop, front, and back.',
        objective: 'Implement queue mechanics in C++, understand queue lifecycle operations, and contrast FIFO with LIFO.'
      }
    ]
  }
]

export function getSubjectById(subjectId) {
  if (!subjectId) return null
  return SUBJECTS.find((s) => s.id === subjectId.toLowerCase()) || null
}

export function getTopicById(subjectId, topicId) {
  const subject = getSubjectById(subjectId)
  if (!subject) return null
  return subject.topics.find((t) => t.id === topicId.toLowerCase()) || null
}
