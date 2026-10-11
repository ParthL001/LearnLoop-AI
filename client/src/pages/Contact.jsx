import { useState } from 'react'
import { Card, Button, Input, Badge } from '../components/UI'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-[var(--text-main)] font-heading">Contact & Support</h2>
          <Badge variant="neutral">Inquiries</Badge>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Have questions regarding the adaptive tutor, curriculum alignment, or misconception diagnostics? Send a message to the engineering team.
        </p>
      </Card>

      <Card className="max-w-xl">
        {submitted ? (
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 space-y-2">
            <p className="font-bold text-sm font-heading text-emerald-950">Thank you for reaching out.</p>
            <p className="text-emerald-800 leading-relaxed">Your message has been received by the engineering team.</p>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', subject: '', message: '' })
                }}
              >
                Send another note
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              type="text"
              placeholder="Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Subject"
              type="text"
              placeholder="Tutor feedback or curriculum inquiry"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5 font-sans">
                Message
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your note here..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--border-color)] bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
              />
            </div>
            <Button type="submit" variant="primary">
              Send Message
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
