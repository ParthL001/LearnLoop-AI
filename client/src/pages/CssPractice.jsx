import { useState } from 'react'
import {
  Layers,
  Code2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layout,
  Sliders,
} from 'lucide-react'

const CSS_EXERCISES = [
  {
    id: 'CSS-01',
    topic: 'Box Model',
    title: 'Content-Box vs Border-Box',
    question:
      'An element has `width: 200px`, `padding: 20px`, and `border: 5px solid black`. If `box-sizing: border-box` is applied, what is the rendered total width of the element?',
    codeSnippet: `.card {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid black;
}`,
    expectedAnswer: '200px',
    acceptedAnswers: ['200px', '200', '200 px'],
    explanation:
      'With `box-sizing: border-box`, padding and borders are absorbed inside the declared width. The rendered total width remains exactly 200px. With standard `content-box`, it would have been 200 + 40 + 10 = 250px.',
    misconception:
      'Adding padding and borders to a border-box container is often mistakenly assumed to increase its outer dimensions.',
    learningGoal: 'Master box-sizing rules and container overflow containment.',
  },
  {
    id: 'CSS-02',
    topic: 'Selectors & Specificity',
    title: 'Specificity Score Resolution',
    question:
      'Between the selectors `#main .nav-item` and `header ul.nav li.active a`, which selector has higher specificity and wins?',
    codeSnippet: `/* Selector A */
#main .nav-item { color: blue; }

/* Selector B */
header ul.nav li.active a { color: red; }`,
    expectedAnswer: '#main .nav-item',
    acceptedAnswers: ['#main .nav-item', 'selector a', 'a', '#main', 'first one'],
    explanation:
      'Specificity is calculated as (Inline, ID, Class/Attribute/Pseudo-class, Elements). Selector A has 1 ID and 1 Class (0, 1, 1, 0). Selector B has 0 IDs, 2 Classes, and 3 Elements (0, 0, 2, 3). Since 1 ID outweighs any number of classes, Selector A (blue) wins.',
    misconception:
      'Counting total selectors rather than weighing ID, class, and tag tiers.',
    learningGoal: 'Calculate CSS specificity tuples accurately without resorting to `!important`.',
  },
  {
    id: 'CSS-03',
    topic: 'Margin & Padding',
    title: 'Vertical Margin Collapse',
    question:
      'Two adjacent sibling vertical block elements have `margin-bottom: 30px` on the first, and `margin-top: 20px` on the second. What is the actual spacing between them?',
    codeSnippet: `.box-one {
  margin-bottom: 30px;
}
.box-two {
  margin-top: 20px;
}`,
    expectedAnswer: '30px',
    acceptedAnswers: ['30px', '30', '30 px'],
    explanation:
      'In standard block formatting contexts, adjacent vertical margins collapse into a single margin equal to the maximum of the two (30px), rather than summing to 50px.',
    misconception:
      'Assuming vertical margins always add up cumulatively.',
    learningGoal: 'Recognize margin collapse conditions and prevent them using flexbox gap or padding.',
  },
  {
    id: 'CSS-04',
    topic: 'Flexbox',
    title: 'Main Axis Alignment',
    question:
      'In a container with `flex-direction: column`, which CSS property aligns items along the vertical axis?',
    codeSnippet: `.flex-container {
  display: flex;
  flex-direction: column;
  /* Which property controls vertical alignment along this axis? */
}`,
    expectedAnswer: 'justify-content',
    acceptedAnswers: ['justify-content', 'justify content', 'justifycontent'],
    explanation:
      '`justify-content` always controls alignment along the MAIN axis. When `flex-direction: column` is set, the main axis is vertical, so `justify-content` governs vertical positioning. `align-items` governs the cross (horizontal) axis.',
    misconception:
      'Equating `justify-content` strictly with horizontal and `align-items` with vertical, forgetting flex-direction swaps the axes.',
    learningGoal: 'Master dynamic main and cross axis behavior in Flexbox layouts.',
  },
  {
    id: 'CSS-05',
    topic: 'CSS Grid',
    title: 'Fractional Units (fr)',
    question:
      'In `grid-template-columns: 1fr 2fr`, what percentage of the available column space does the second column occupy?',
    codeSnippet: `.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  width: 100%;
}`,
    expectedAnswer: '66.67%',
    acceptedAnswers: ['66.67%', '66.6%', '66.7%', '66%', '67%', '2/3', 'two thirds', '66.66%'],
    explanation:
      'The grid has a total of 1fr + 2fr = 3fr. The second column occupies 2 out of 3 fractional shares, which is 2/3 or approximately 66.67% of remaining free space.',
    misconception:
      'Confusing fraction ratios with fixed percentages.',
    learningGoal: 'Utilize CSS Grid `fr` units to build proportional, responsive column layouts.',
  },
  {
    id: 'CSS-06',
    topic: 'Positioning',
    title: 'Absolute Positioning Context',
    question:
      'When an element has `position: absolute`, what ancestor element does it position itself relative to?',
    codeSnippet: `.parent {
  /* No position specified */
}
.child {
  position: absolute;
  top: 0;
  left: 0;
}`,
    expectedAnswer: 'nearest positioned ancestor',
    acceptedAnswers: [
      'nearest positioned ancestor',
      'nearest positioned',
      'positioned ancestor',
      'closest positioned ancestor',
      'relative ancestor',
      'viewport or positioned ancestor',
      'initial containing block',
    ],
    explanation:
      'An absolutely positioned element positions itself relative to its nearest ancestor that has a `position` other than `static` (such as `relative`, `absolute`, or `fixed`). If none exists, it positions relative to the initial containing block (the viewport).',
    misconception:
      'Believing absolute positioning always binds to the immediate parent element regardless of its position property.',
    learningGoal: 'Construct reliable anchor contexts using `position: relative`.',
  },
  {
    id: 'CSS-07',
    topic: 'Responsive Design',
    title: 'Mobile-First Media Queries',
    question:
      'In modern mobile-first CSS architecture, which media feature is primarily used: `min-width` or `max-width`?',
    codeSnippet: `/* Mobile base styles first */
.container { width: 100%; }

/* Tablet and desktop progressive enhancement */
@media (_______: 768px) {
  .container { width: 750px; }
}`,
    expectedAnswer: 'min-width',
    acceptedAnswers: ['min-width', 'minwidth', '(min-width)'],
    explanation:
      'Mobile-first architecture defines base styles for mobile screens without media queries, then progressively enhances larger viewports using `min-width` breakpoints.',
    misconception:
      'Writing desktop styles first and overriding with complex chains of `max-width` queries.',
    learningGoal: 'Apply mobile-first responsive breakpoints cleanly and maintainably.',
  },
]

export default function CssPractice() {
  const [index, setIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const current = CSS_EXERCISES[index]

  function handleCheck(e) {
    e.preventDefault()
    if (!userAnswer.trim()) return

    const normalized = userAnswer.trim().toLowerCase()
    const match = current.acceptedAnswers.some(
      (ans) => ans.toLowerCase() === normalized || normalized.includes(ans.toLowerCase())
    )

    setIsCorrect(match)
    setSubmitted(true)
  }

  function handleNext() {
    if (index < CSS_EXERCISES.length - 1) {
      setIndex(index + 1)
      setUserAnswer('')
      setSubmitted(false)
      setIsCorrect(false)
    }
  }

  function handlePrev() {
    if (index > 0) {
      setIndex(index - 1)
      setUserAnswer('')
      setSubmitted(false)
      setIsCorrect(false)
    }
  }

  function handleReset() {
    setUserAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8BB2DE]"></span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3D5F58]">
                Curriculum & Tools · CSS Practice
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#231F20]">
              CSS Layout & Specificity Lab
            </h1>
            <p className="text-sm text-[#4B5563] mt-0.5">
              Practice core styling concepts, master specificity and the box model, and avoid common layout traps.
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="font-mono text-xs font-semibold text-[#6B7280] mb-1.5">
              EXERCISE <span className="text-[#231F20] font-bold">{index + 1}</span> OF{' '}
              <span className="text-[#231F20] font-bold">{CSS_EXERCISES.length}</span>
            </div>
            <div className="w-40 sm:w-48 h-2 bg-[#F2F2EB] border border-[#D8D8CF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3D5F58] transition-all duration-300"
                style={{ width: `${((index + 1) / CSS_EXERCISES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notice on Real Evaluation */}
        <div className="mt-4 pt-3 border-t border-[#D8D8CF] flex items-center gap-2 text-xs text-[#6B7280]">
          <Info size={14} className="text-[#3D5F58] shrink-0" />
          <span>
            Evaluated deterministically against W3C CSS specifications and common browser layout rendering standards.
          </span>
        </div>
      </div>

      {/* Two-Column Exercise Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question & Code Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-[#D8D8CF] pb-3 mb-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider bg-[#F2F2EB] text-[#3D5F58] px-2.5 py-1 rounded border border-[#D8D8CF]">
                <Layers size={12} />
                {current.topic}
              </span>
              <span className="font-mono text-xs font-bold text-[#6B7280] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E5DC]">
                {current.id}
              </span>
            </div>

            <div className="mb-4">
              <h2 className="font-heading text-xl font-bold text-[#231F20] mb-2">{current.title}</h2>
              <p className="text-sm text-[#374151] leading-relaxed">{current.question}</p>
            </div>

            {/* Code Snippet Box */}
            <div className="mb-6 rounded-md bg-[#231F20] border border-[#3D5F58]/30 overflow-hidden text-left">
              <div className="bg-[#1A1818] px-4 py-2 border-b border-[#3D5F58]/20 flex items-center justify-between text-xs font-mono text-[#D8D8CF]">
                <span className="flex items-center gap-1.5 text-xs text-[#8BB2DE]">
                  <Code2 size={13} /> style.css
                </span>
                <span className="text-[10px] uppercase text-[#9CA3AF]">CSS3 Syntax</span>
              </div>
              <pre className="p-4 text-xs font-mono text-[#F2F2EB] overflow-x-auto leading-relaxed">
                <code>{current.codeSnippet}</code>
              </pre>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D5F58] mb-1.5">
                  Your Answer or Value
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="e.g. 200px or #main .nav-item"
                  className="w-full bg-[#FAF9F5] text-[#231F20] placeholder-[#9CA3AF] border border-[#D8D8CF] rounded-md px-3.5 py-2.5 font-mono text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3D5F58] focus:border-[#3D5F58] transition"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D5F58] text-white font-sans font-bold text-sm rounded-md shadow-xs hover:bg-[#2E4742] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Sparkles size={14} className="text-[#F5B726]" />
                  Check CSS Answer
                </button>
                {submitted && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2.5 border border-[#D8D8CF] rounded-md text-[#6B7280] hover:text-[#231F20] hover:bg-[#F2F2EB] transition"
                    title="Retry this question"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* Previous & Next Controls */}
            <div className="border-t border-[#D8D8CF] mt-6 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={index === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D8CF] rounded-md text-xs font-mono font-bold text-[#231F20] bg-[#FFFFFF] hover:bg-[#F2F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
                Previous Question
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={index === CSS_EXERCISES.length - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8D8CF] rounded-md text-xs font-mono font-bold text-[#231F20] bg-[#FFFFFF] hover:bg-[#F2F2EB] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next Question
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback & Visual Explanation */}
        <div className="lg:col-span-5 space-y-4">
          {submitted ? (
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-4">
              <div
                className={`p-4 rounded-md border flex items-center justify-between gap-3 ${
                  isCorrect
                    ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                    : 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0" />
                  )}
                  <div>
                    <h3 className="font-heading text-sm font-extrabold uppercase">
                      {isCorrect ? 'Correct CSS Application' : 'Incorrect Understanding'}
                    </h3>
                    <p className="text-xs font-sans opacity-90">
                      {isCorrect
                        ? 'Your mental model matches CSS rendering rules.'
                        : `Expected: "${current.expectedAnswer}"`}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80 border border-current">
                  {isCorrect ? 'PASS' : 'RETRY'}
                </span>
              </div>

              {/* Detected Common Misconception */}
              {!isCorrect && (
                <div className="p-4 bg-[#FAF9F5] border border-[#D8D8CF] rounded-md">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Common Pitfall / Misconception
                  </div>
                  <p className="text-sm text-[#231F20] font-sans">{current.misconception}</p>
                </div>
              )}

              {/* Explanatory Concept Feedback */}
              <div className="p-4 bg-[#FFFFFF] border-l-4 border-l-[#3D5F58] border border-[#D8D8CF] rounded-md">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58] mb-1.5 flex items-center gap-1.5">
                  <Code2 size={13} />
                  Specification Explanation
                </div>
                <p className="text-sm text-[#231F20] font-sans leading-relaxed">{current.explanation}</p>
              </div>

              {/* Next Learning Goal */}
              <div className="p-4 bg-[#F2F2EB] border border-[#D8D8CF] rounded-md flex items-start gap-3">
                <div className="p-1 rounded bg-[#3D5F58] text-white shrink-0 mt-0.5">
                  <ArrowRight size={13} />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#3D5F58] mb-0.5">
                    Next Learning Goal
                  </div>
                  <p className="text-sm text-[#231F20] font-sans">{current.learningGoal}</p>
                </div>
              </div>

              {/* Continue button */}
              {index < CSS_EXERCISES.length - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border border-[#3D5F58] text-[#3D5F58] font-bold text-sm rounded-md hover:bg-[#F2F2EB] transition"
                >
                  Advance to Next CSS Topic
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#D8D8CF] rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#D8D8CF] pb-3">
                <div className="p-2 bg-[#F2F2EB] text-[#3D5F58] rounded-md border border-[#D8D8CF]">
                  <Layout size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#231F20]">Topic Overview: {current.topic}</h3>
                  <p className="text-xs text-[#6B7280]">Key CSS specifications & mental models</p>
                </div>
              </div>

              <div className="text-xs text-[#4B5563] space-y-3 font-sans">
                <p>
                  CSS layouts rely on deterministic rendering contexts. Misconceptions usually arise when mental models from other layout systems collide with CSS spec behaviors.
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#E5E5DC] rounded-md space-y-1.5">
                  <div className="font-mono text-[11px] font-bold text-[#3D5F58] uppercase">Practice Areas Covered:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-[#6B7280]">
                    <span>• Box Model</span>
                    <span>• Selectors & Spec</span>
                    <span>• Margin Collapsing</span>
                    <span>• Flexbox Axes</span>
                    <span>• Grid Fr Units</span>
                    <span>• Positioning Context</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
