import { Card, Badge } from '../components/UI'

export default function About() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#181816]">About Cognara</h2>
          <Badge variant="accent">VORTEXA 3.0</Badge>
        </div>
        <p className="mt-1 text-xs text-[#575753] max-w-2xl leading-relaxed">
          Cognara is an adaptive educational platform engineered to identify and resolve root-cause misconceptions
          in student reasoning through formative dialogue and diagnostic sequencing.
        </p>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card header={<h3 className="text-sm font-bold text-[#181816]">Pedagogical Framework</h3>}>
          <p className="text-xs text-[#575753] leading-relaxed">
            Conventional assessments simply label answers as correct or incorrect. Cognara analyzes the underlying
            reasoning step to identify systematic transfer errors, such as whole-number bias in fractional arithmetic.
          </p>
        </Card>

        <Card header={<h3 className="text-sm font-bold text-[#181816]">Adaptive Tutor Integration</h3>}>
          <p className="text-xs text-[#575753] leading-relaxed">
            Powered by local inference models (Node.js/Express + Ollama with Qwen3:4b), the tutor provides Socratic
            nudge prompts that encourage learners to articulate their mental model before receiving corrections.
          </p>
        </Card>
      </div>

      <Card header={<h3 className="text-sm font-bold text-[#181816]">Key Principles</h3>}>
        <ul className="text-xs text-[#494944] space-y-2 leading-relaxed">
          <li><strong>Formative Diagnosis:</strong> Treat incorrect answers as hypotheses to verify, not permanent capability labels.</li>
          <li><strong>Isomorphic Evaluation:</strong> Use pre- and post-assessments to measure actual concept retention.</li>
          <li><strong>Educator Agency:</strong> Surface diagnostic summaries to teachers without automated punitive grading.</li>
        </ul>
      </Card>
    </div>
  )
}
