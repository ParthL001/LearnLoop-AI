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
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#0f172a]">Contact & Support</h2>
          <Badge variant="neutral">Inquiries</Badge>
        </div>
        <p className="mt-1 text-xs text-[#64748b] max-w-2xl leading-relaxed">
          Have questions regarding the adaptive tutor, curriculum alignment, or misconception diagnostics? Send a message to the engineering team.
        </p>
      </Card>

      <Card className="max-w-xl">
        {submitted ? (
          <div className="p-4 rounded-[5px] border border-[#a7f3d0] bg-[#ecfdf5] text-xs text-[#065f46]">
            <p className="font-bold">Thank you for reaching out.</p>
            <p className="mt-1 text-[#047857]">Your message has been received by the engineering team.</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setSubmitted(false)
                setFormData({ name: '', email: '', subject: '', message: '' })
              }}
            >
              Send another note
            </Button>
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
              <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your note here..."
                className="w-full text-xs p-3 rounded-[5px] border border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] outline-none"
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
