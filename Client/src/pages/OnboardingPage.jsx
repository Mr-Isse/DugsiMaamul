import React, { useState } from 'react'
import {
  CheckCircle2,
  Building2,
  GitBranch,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Image,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useUpdateSchoolProfileMutation, useCreateAcademicTermMutation } from '@/services/api'

// Step config
const STEPS = [
  { id: 1, label: 'School Profile', icon: Building2 },
  { id: 2, label: 'Branch Setup',   icon: GitBranch },
  { id: 3, label: 'Academic Setup', icon: GraduationCap },
  { id: 4, label: 'Complete',        icon: CheckCircle2 },
]

function Stepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isActive    = currentStep === step.id
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function Step1Form({ onNext }) {
  const [updateSchoolProfile, { isLoading }] = useUpdateSchoolProfileMutation()
  const form = useForm({
    defaultValues: { name: '', logoUrl: '', address: '', phone: '', email: '', website: '' },
  })
  const onSubmit = async (data) => {
    try {
      await updateSchoolProfile(data).unwrap()
      toast.success('School profile saved!')
    } catch {
      toast.error('Could not save profile on the server. Continuing setup...')
    }
    onNext(data)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" rules={{ required: 'School name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Name *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Dugsimaamul Academy" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Image className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="https://example.com/logo.png" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField control={form.control} name="address" rules={{ required: 'Address is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9" placeholder="123 Education Street, Mogadishu" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="phone" rules={{ required: 'Phone is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="+252 61 234 5678" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="email"
            rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" type="email" placeholder="info@school.edu" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField control={form.control} name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9" placeholder="https://www.school.edu" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <>Next <ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function Step2Form({ onNext, onBack }) {
  const form = useForm({ defaultValues: { branchName: '', branchAddress: '', branchPhone: '' } })
  const onSubmit = (data) => { toast.success('Branch information saved!'); onNext(data) }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="branchName" rules={{ required: 'Branch name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name *</FormLabel>
              <FormControl>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9" placeholder="Main Campus" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="branchAddress" rules={{ required: 'Branch address is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Address *</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9" placeholder="123 Education Street" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="branchPhone" rules={{ required: 'Branch phone is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Phone *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9" placeholder="+252 61 234 5678" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Button type="submit">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
        </div>
      </form>
    </Form>
  )
}

function Step3Form({ onNext, onBack }) {
  const [createAcademicTerm, { isLoading }] = useCreateAcademicTermMutation()
  const form = useForm({ defaultValues: { yearName: '', startDate: '', endDate: '' } })
  const onSubmit = async (data) => {
    try {
      await createAcademicTerm({ name: data.yearName, startDate: data.startDate, endDate: data.endDate }).unwrap()
      toast.success('Academic year configured!')
    } catch {
      toast.error('Could not save academic term on the server. Continuing...')
    }
    onNext(data)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="yearName" rules={{ required: 'Academic year name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year Name *</FormLabel>
              <FormControl><Input placeholder="2025 - 2026" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="startDate" rules={{ required: 'Start date is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="endDate" rules={{ required: 'End date is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <>Finish <ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function Step4Success() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Complete! 🎉</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Your school profile has been configured successfully. You are all set to start managing your school with Dugsimaamul ERP.
      </p>
      <div className="flex gap-3 mt-2">
        <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700">
          Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const { selectedBranch } = useSelector((state) => state.branch)
  const [currentStep, setCurrentStep] = useState(1)
  const [collectedData, setCollectedData] = useState({})

  const handleNext = (stepData) => {
    setCollectedData((prev) => ({ ...prev, ...stepData }))
    setCurrentStep((s) => Math.min(s + 1, 4))
  }
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const stepConfig = {
    1: { title: 'School Profile',  description: "Set up your school's basic information and contact details." },
    2: { title: 'Branch Setup',    description: 'Configure your first school branch or campus.' },
    3: { title: 'Academic Setup',  description: 'Define the current academic year for your school.' },
    4: { title: 'All Done!',       description: 'Your school is ready to use.' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Dugsimaamul ERP</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Let's set up your school in a few simple steps</p>
        </div>

        <div className="mb-4 text-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        <Stepper currentStep={currentStep} />

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{stepConfig[currentStep].title}</CardTitle>
            <CardDescription>{stepConfig[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <Step1Form onNext={handleNext} />}
            {currentStep === 2 && <Step2Form onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <Step3Form onNext={handleNext} onBack={handleBack} />}
            {currentStep === 4 && <Step4Success />}
          </CardContent>
          {currentStep < 4 && (
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-gray-400">All fields marked with * are required</p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
