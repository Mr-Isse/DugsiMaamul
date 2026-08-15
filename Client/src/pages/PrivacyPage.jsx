import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center gap-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Privacy Policy</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Privacy and data protection</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Dugsimaamul is committed to protecting the privacy and confidentiality of school data. We collect only the information needed to run the platform and to provide support.
            </p>

            <Card className="mt-10 border-border/50">
              <CardContent className="space-y-6 p-8 text-sm leading-7 text-muted-foreground">
                <p>
                  We use your data to provide authentication, manage school records, process payments, and deliver support services. Access is limited to authorized personnel and enforced through tenant-aware permissions and role-based controls.
                </p>
                <p>
                  Schools can request access to, correction of, or deletion of their data where applicable by contacting support. We maintain reasonable administrative, technical, and physical safeguards to protect information from unauthorized access, loss, or misuse.
                </p>
                <p>
                  By using the platform, you agree to the collection and processing of school and user information in line with this policy and applicable data protection laws.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 flex gap-3">
              <Link to="/contact">
                <Button size="lg">Contact support</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
