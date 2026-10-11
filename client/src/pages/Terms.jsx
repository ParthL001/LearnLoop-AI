import { Card, Badge } from '../components/UI'

export default function Terms() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#0f172a]">Terms and Conditions</h2>
          <Badge variant="neutral">Version 1.0</Badge>
        </div>
        <p className="mt-1 text-xs text-[#64748b]">
          Terms governing the use of the adaptive diagnostic tutoring system.
        </p>
      </Card>

      <Card>
        <div className="space-y-6 text-xs text-[#334155] leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#0f172a]">1. Educational Purpose</h3>
            <p>
              This is an adaptive educational platform engineered for concept exploration, practice, and formative diagnostic feedback. It is intended to support, not replace, certified educational instruction.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#0f172a]">2. Responsible Use of AI Tutor</h3>
            <p>
              Learners agree to use the tutor interface for exploratory learning. Misconception detections are pedagogical recommendations meant to guide follow-up drills and reflective thinking.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#0f172a]">3. Integrity of Assessments</h3>
            <p>
              Pre and post assessments are designed to measure conceptual change. Users are encouraged to provide genuine reasoning so the adaptive system can formulate meaningful next steps.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#0f172a]">4. Availability & Modification</h3>
            <p>
              Features are subject to continuous adaptation as diagnostic models and curriculum units are expanded.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}
