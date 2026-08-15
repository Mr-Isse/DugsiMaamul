import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronDown, Search, Sparkles, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full py-8 flex items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn(
          'text-xl font-bold transition-colors',
          isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary'
        )}>
          {question}
        </span>
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center transition-all',
          isOpen ? 'bg-primary/10 rotate-180' : 'bg-muted'
        )}>
          <ChevronDown className={cn('w-5 h-5', isOpen ? 'text-primary' : 'text-muted-foreground')} />
        </div>
      </button>
      {isOpen && (
        <div className="pb-8">
          <p className="text-muted-foreground leading-relaxed text-lg font-medium">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const faqs = [
    {
      category: 'General',
      items: [
        {
          question: 'What is DugsiKabe?',
          answer: 'DugsiKabe is a comprehensive enterprise school management system that helps educational institutions manage everything from student registration to financial reporting in one unified platform.'
        },
        {
          question: 'Is DugsiKabe cloud-based?',
          answer: 'Yes, DugsiKabe is a 100% cloud-based SaaS platform. You can access it from anywhere in the world with an internet connection.'
        },
        {
          question: 'Does it support multiple branches?',
          answer: 'Absolutely. DugsiKabe is built for multi-tenant and multi-branch operations, allowing school groups to manage all their locations from a single dashboard.'
        }
      ]
    },
    {
      category: 'Pricing & Plans',
      items: [
        {
          question: 'How much does DugsiKabe cost?',
          answer: 'We offer flexible pricing based on the number of students and features required. Please visit our Pricing page for detailed plans.'
        },
        {
          question: 'Do you offer a free trial?',
          answer: 'Yes, we offer a 14-day free trial for new schools to explore the platform and see how it fits their needs.'
        }
      ]
    },
    {
      category: 'Technical & Security',
      items: [
        {
          question: 'Is my data secure?',
          answer: 'Security is our top priority. We use industry-standard encryption, regular backups, and secure hosting to ensure your school data is always protected.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes, you can export reports and data in multiple formats including CSV, Excel, and PDF.'
        }
      ]
    }
  ]

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-4 h-4" /> Support Knowledge Base
          </div>
          <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-[0.95] tracking-tight text-foreground">
            How can we <br/>
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">Help you?</span>
          </h1>

          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="h-16 pl-16 pr-8 text-lg bg-background border-2 border-border focus:border-primary/30 outline-none transition-all shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-24">
              {filteredFaqs.map((category, idx) => (
                <div key={idx}>
                  <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
                    {category.category}
                    <div className="h-px flex-1 bg-border" />
                  </h2>
                  <Card className="border-border/50">
                    <CardContent className="p-10">
                      {category.items.map((item, i) => (
                        <FAQItem key={i} {...item} />
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try searching for different keywords or categories.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/30 border-border/50 p-12 md:p-20 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">Still have questions?</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-12 font-medium">
              Our team is here to help you with any technical or administrative inquiries you may have.
            </p>
            <Link to="/contact">
              <Button size="lg" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Contact Support
              </Button>
            </Link>
          </Card>
        </div>
      </section>
      </main>
      
      <PublicFooter />
    </div>
  )
}
