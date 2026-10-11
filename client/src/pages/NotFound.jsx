import { Link } from 'react-router-dom'
import { Card, Button } from '../components/UI'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md w-full text-center p-8 space-y-4">
        <div className="text-3xl font-black text-[#3B82F6]">404</div>
        <h2 className="text-base font-bold text-[#F8FAFC]">Page Not Found</h2>
        <p className="text-xs text-[#A8B3C4] leading-relaxed">
          The requested route does not exist in the curriculum sequence or workspace.
        </p>
        <div className="pt-2">
          <Link to="/dashboard">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
