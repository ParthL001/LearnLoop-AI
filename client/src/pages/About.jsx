import { Card, Badge } from '../components/UI'

export default function About() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">About the Platform</h2>
          <Badge variant="accent">Adaptive Architecture</Badge>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
          An adaptive educational platform engineered to identify and resolve root-cause misconceptions in student reasoning through formative dialogue and diagnostic sequencing.
        </p>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card header={<h3 className="text-sm font-bold text-[var(--text-main)] font-heading">Pedagogical Framework</h3>}>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Conventional assessments simply label answers as correct or incorrect. The platform analyzes the underlying reasoning step to isolate systematic transfer errors, such as whole-number bias in fractional arithmetic.
          </p>
        </Card>

        <Card header={<h3 className="text-sm font-bold text-[var(--text-main)] font-heading">Adaptive Tutor Architecture</h3>}>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Powered by local inference models (Node.js/Express with Ollama/Qwen), the tutor provides Socratic nudge prompts that encourage learners to articulate their mental model before receiving corrections.
          </p>
        </Card>
      </div>

      <Card header={<h3 className="text-sm font-bold text-[var(--text-main)] font-heading">Key Principles</h3>}>
        <ul className="text-xs text-[var(--text-muted)] space-y-2.5 leading-relaxed">
          <li><strong className="text-[var(--text-main)] font-semibold">Formative Diagnosis:</strong> Treat incorrect answers as hypotheses to verify, not permanent capability labels.</li>
          <li><strong className="text-[var(--text-main)] font-semibold">Isomorphic Evaluation:</strong> Use pre- and post-assessments to measure actual concept retention.</li>
          <li><strong className="text-[var(--text-main)] font-semibold">Educator Agency:</strong> Surface diagnostic summaries to teachers without automated punitive grading.</li>
        </ul>
      </Card>
    </div>
  )
}
