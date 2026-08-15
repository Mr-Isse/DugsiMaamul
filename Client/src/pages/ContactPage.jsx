import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  Building2,
  User,
  ChevronLeft,
  Phone,
  Globe,
  Loader2,
} from 'lucide-react'
import { useSubmitLeadMutation } from '@/services/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

const planLabels = {
  starter: 'Starter (Frontend Only)',
  professional: 'Pro (Full System)',
  business: 'Business',
  enterprise: 'Enterprise',
}

export function ContactPage() {
  const [params] = useSearchParams()
  const selectedPlan = params.get('plan') || ''
  const leadType = params.get('type') || 'contact'

  const [submitLead, { isLoading }] = useSubmitLeadMutation()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    country: '',
    message: selectedPlan ? `Interested in: ${planLabels[selectedPlan] || selectedPlan}` : '',
    type: leadType,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await submitLead(form).unwrap()
      toast.success('Message received. Our team will contact you shortly.')
      setForm({ name: '', email: '', phone: '', schoolName: '', country: '', message: '', type: 'contact' })
    } catch (error) {
      toast.error(error.data?.userMessage || 'Failed to submit request. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
      <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-6">
                  <Sparkles className="w-4 h-4" /> {form.type === 'demo' ? 'Request a Demo' : 'Let\'s Talk Growth'}
                </div>
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-[0.95] text-foreground">
                  {form.type === 'demo' ? 'See the' : 'Scale your'} <br/>
                  <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">{form.type === 'demo' ? 'Future' : 'Institution'}</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  {form.type === 'demo'
                    ? 'Book a personalized walkthrough of the DugsiKabe platform and see how we can transform your school operations.'
                    : 'Request a specialized demo, mobile app architecture quote, or discuss enterprise-level on-premise deployments.'
                  }
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-border/50">
                  <CardContent className="p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Direct Channel</p>
                      <p className="text-lg font-bold text-foreground">hello@dugsihub.com</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Expert Support</p>
                      <p className="text-lg font-bold text-foreground">Sales & Architecture</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative">
              <Card className="border-border/50 shadow-xl">
                <CardContent className="p-8 sm:p-10">
                  {selectedPlan && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest text-center mb-6">
                      Project Context: {planLabels[selectedPlan] || selectedPlan}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name"
                              placeholder="Your Name"
                              className="pl-10"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email Address"
                              className="pl-10"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              placeholder="Phone Number"
                              className="pl-10"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="schoolName"
                              placeholder="School Name"
                              className="pl-10"
                              value={form.schoolName}
                              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="country"
                            placeholder="Country"
                            className="pl-10"
                            value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder={form.type === 'demo' ? 'Tell us about your school size and requirements for the demo...' : 'Tell us about your school goals...'}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full text-base font-bold"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {form.type === 'demo' ? 'Request Demo' : 'Submit Message'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </main>
      
      <PublicFooter />
    </div>
  )
}
