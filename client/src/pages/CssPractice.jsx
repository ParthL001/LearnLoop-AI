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
} from 'lucide-react'

const CSS_EXERCISES = [
  {
    id: 'CSS-01',
    topic: 'Box Model',
    title: 'Content-Box vs Border-Box',
    question:
      'An element has width: 200px, padding: 20px, and border: 5px solid black. If box-sizing: border-box is applied, what is the rendered total width of the element?',
    codeSnippet: `.card {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid black;
}`,
    expectedAnswer: '200px',
    acceptedAnswers: ['200px', '200', '200 px'],
    explanation:
      'With box-sizing: border-box, padding and borders are absorbed inside the declared width. The rendered total width remains exactly 200px. With standard content-box, it would have been 200 + 40 + 10 = 250px.',
    misconception:
      'Adding padding and borders to a border-box container is often mistakenly assumed to increase its outer dimensions.',
    learningGoal: 'Master box-sizing rules and container overflow containment.',
  },
  {
    id: 'CSS-02',
    topic: 'Selectors & Specificity',
    title: 'Specificity Score Resolution',
    question:
      'Between the selectors #main .nav-item and header ul.nav li.active a, which selector has higher specificity and wins?',
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
    learningGoal: 'Calculate CSS specificity tuples accurately without resorting to !important.',
  },
  {
    id: 'CSS-03',
    topic: 'Margin & Padding',
    title: 'Vertical Margin Collapse',
    question:
      'Two adjacent sibling vertical block elements have margin-bottom: 30px on the first, and margin-top: 20px on the second. What is the actual spacing between them?',
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
      'In a container with flex-direction: column, which CSS property aligns items along the vertical axis?',
    codeSnippet: `.flex-container {
  display: flex;
  flex-direction: column;
  /* Which property controls vertical alignment along this axis? */
}`,
    expectedAnswer: 'justify-content',
    acceptedAnswers: ['justify-content', 'justify content', 'justifycontent'],
    explanation:
      'justify-content always controls alignment along the MAIN axis. When flex-direction: column is set, the main axis is vertical, so justify-content governs vertical positioning. align-items governs the cross (horizontal) axis.',
    misconception:
      'Equating justify-content strictly with horizontal and align-items with vertical, forgetting flex-direction swaps the axes.',
    learningGoal: 'Master dynamic main and cross axis behavior in Flexbox layouts.',
  },
  {
    id: 'CSS-05',
    topic: 'CSS Grid',
    title: 'Fractional Units (fr)',
    question:
      'In grid-template-columns: 1fr 2fr, what percentage of the available column space does the second column occupy?',
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
    learningGoal: 'Utilize CSS Grid fr units to build proportional, responsive column layouts.',
  },
  {
    id: 'CSS-06',
    topic: 'Positioning',
    title: 'Absolute Positioning Context',
    question:
      'When an element has position: absolute, what ancestor element does it position itself relative to?',
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
      'An absolutely positioned element positions itself relative to its nearest ancestor that has a position other than static (such as relative, absolute, or fixed). If none exists, it positions relative to the initial containing block (the viewport).',
    misconception:
      'Believing absolute positioning always binds to the immediate parent element regardless of its position property.',
    learningGoal: 'Construct reliable anchor contexts using position: relative.',
  },
  {
    id: 'CSS-07',
    topic: 'Responsive Design',
    title: 'Mobile-First Media Queries',
    question:
      'In modern mobile-first CSS architecture, which media feature is primarily used: min-width or max-width?',
    codeSnippet: `/* Mobile base styles first */
.container { width: 100%; }

/* Tablet and desktop progressive enhancement */
@media (_______: 768px) {
  .container { width: 750px; }
}`,
    expectedAnswer: 'min-width',
    acceptedAnswers: ['min-width', 'minwidth', '(min-width)'],
    explanation:
      'Mobile-first architecture defines base styles for mobile screens without media queries, then progressively enhances larger viewports using min-width breakpoints.',
    misconception:
      'Writing desktop styles first and overriding with complex chains of max-width queries.',
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

  const progressPercent = ((index + 1) / CSS_EXERCISES.length) * 100

  return (
    <div className="reveal-stagger space-y-6">
      {/* Header Banner */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow mb-1">
              Curriculum & Tools · Layout Engine
            </div>
            <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]">
              CSS Layout & Specificity Lab
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              Master specificity calculations, Flexbox main vs cross axes, margin collapse, and box-sizing rendering.
            </p>
          </div>

          <div className="sm:text-right shrink-0 space-y-1.5">
            <div className="font-mono text-xs font-semibold text-[var(--text-muted)]">
              EXERCISE <span className="text-[var(--text-main)] font-bold">{index + 1}</span> OF{' '}
              <span className="text-[var(--text-main)] font-bold">{CSS_EXERCISES.length}</span>
            </div>
            <div className="progress w-44 sm:w-52">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Notice on Real Evaluation */}
        <div className="mt-4 pt-3 border-t border-[var(--border-soft)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Info size={14} className="text-[var(--accent-primary)] shrink-0" />
          <span>
            Evaluated deterministically against W3C CSS specifications and modern browser rendering standards.
          </span>
        </div>
      </div>

      {/* Two-Column Exercise Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question & Code Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-soft)]">
              <span className="badge badge-sky flex items-center gap-1.5">
                <Layers size={12} />
                {current.topic}
              </span>
              <span className="badge badge-neutral">
                {current.id}
              </span>
            </div>

            <div>
              <span className="eyebrow text-xs mb-1">
                Exercise Prompt
              </span>
              <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--text-main)] mb-1.5">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-body)] leading-relaxed">{current.question}</p>
            </div>

            {/* Code Snippet Box with Mac Dots */}
            <div className="rounded-lg overflow-hidden border border-black/20 shadow-card">
              <div className="bg-[#1A1818] px-4 py-2 flex items-center justify-between text-xs font-mono text-[#D8D8CF]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E97B77] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F5B726] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3D8B6A] inline-block" />
                  </div>
                  <span className="text-[#8BB2DE] ml-2 flex items-center gap-1.5">
                    <Code2 size={13} /> style.css
                  </span>
                </div>
                <span className="badge badge-on-dark-ochre text-[9px]">CSS3</span>
              </div>
              <pre>
                <code>{current.codeSnippet}</code>
              </pre>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleCheck} className="space-y-4 pt-1">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1.5">
                  Your Answer or Value
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="e.g. 200px, #main .nav-item, justify-content..."
                  className="input font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="btn btn-primary flex-1"
                >
                  <Sparkles size={14} className="text-[#F5B726]" />
                  <span>Check CSS Answer</span>
                </button>
                {submitted && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary p-2.5"
                    title="Retry this question"
                  >
                    <RefreshCw size={15} />
                  </button>
                )}
              </div>
            </form>

            {/* Previous & Next Controls */}
            <div className="pt-4 border-t border-[var(--border-soft)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={index === 0}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={14} />
                Previous Question
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={index === CSS_EXERCISES.length - 1}
                className="btn btn-secondary btn-sm"
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
            <div className="card space-y-4">
              <div
                className={`alert ${
                  isCorrect ? 'alert-success' : 'alert-danger'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-2.5">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-heading text-sm font-extrabold uppercase">
                      {isCorrect ? 'Correct CSS Application' : 'Misconception Detected'}
                    </h3>
                    <p className="text-xs font-sans opacity-90">
                      {isCorrect
                        ? 'Your mental model matches W3C layout calculations.'
                        : `Expected: "${current.expectedAnswer}"`}
                    </p>
                  </div>
                </div>

                <span className="badge badge-neutral text-[10px]">
                  {isCorrect ? 'PASS' : 'RETRY'}
                </span>
              </div>

              {/* Detected Common Misconception */}
              {!isCorrect && (
                <div className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-soft)] rounded-md space-y-1">
                  <span className="eyebrow text-[10px]">
                    Common Pitfall / Trap
                  </span>
                  <p className="text-xs text-[var(--text-body)] font-sans">{current.misconception}</p>
                </div>
              )}

              {/* Explanatory Concept Feedback */}
              <div className="p-4 bg-[var(--bg-surface)] border-l-4 border-l-[var(--accent-primary)] border border-[var(--border-soft)] rounded-md space-y-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                  <Code2 size={13} />
                  Specification Explanation
                </span>
                <p className="text-xs text-[var(--text-body)] font-sans leading-relaxed">{current.explanation}</p>
              </div>

              {/* Next Learning Goal */}
              <div className="alert alert-info flex items-start gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                    Next Learning Goal
                  </span>
                  <p className="text-xs font-sans">{current.learningGoal}</p>
                </div>
              </div>

              {/* Continue button */}
              {index < CSS_EXERCISES.length - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-secondary w-full"
                >
                  <span>Advance to Next CSS Topic</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="card space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-soft)]">
                <div className="icon-tile">
                  <Layout size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--text-main)]">
                    Topic Overview: {current.topic}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Key CSS specifications & mental models</p>
                </div>
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-3 font-sans leading-relaxed">
                <p>
                  CSS layouts rely on deterministic rendering contexts. Misconceptions usually arise when mental models from desktop canvas coordinates collide with CSS flow and formatting contexts.
                </p>
                <div className="p-3.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-soft)] rounded-md space-y-2">
                  <div className="eyebrow text-[10px]">Practice Topics in this Lab:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-[var(--text-body)]">
                    <span>• Box Model</span>
                    <span>• Selectors & Spec</span>
                    <span>• Margin Collapsing</span>
                    <span>• Flexbox Axes</span>
                    <span>• Grid Fr Units</span>
                    <span>• Positioning Anchor</span>
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
