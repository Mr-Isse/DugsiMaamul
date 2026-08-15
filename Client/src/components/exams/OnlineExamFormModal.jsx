import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const onlineExamSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  term: z.enum(['Monthly1', 'Midterm', 'Monthly2', 'Final'], { required_error: 'Term is required' }),
  class: z.string().min(1, 'Class is required'),
  subject: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Exam date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.string().min(1, 'Duration is required'),
  maxMarks: z.string().min(1, 'Total marks is required'),
  passingScore: z.string().min(1, 'Passing marks is required'),
  examType: z.enum(['ONLINE', 'HYBRID'], { required_error: 'Exam type is required' }),
  examCategory: z.enum(['FORMATIVE', 'SUMMATIVE', 'DIAGNOSTIC', 'PLACEMENT', 'PRACTICE'], { required_error: 'Exam category is required' }),
  questionSelectionMode: z.enum(['MANUAL', 'AUTO_RANDOM', 'AUTO_DIFFICULTY', 'AUTO_BLOOM'], { required_error: 'Question selection mode is required' }),
  allowRetake: z.boolean().default(false),
  maxAttempts: z.string().default('1'),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showResultsImmediately: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(false),
  requireProctoring: z.boolean().default(false),
  instructions: z.string().optional(),
  description: z.string().optional(),
})

const OnlineExamFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(onlineExamSchema),
    defaultValues: defaultValues || {
      name: '',
      code: '',
      term: 'Midterm',
      class: '',
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: '',
      maxMarks: '',
      passingScore: '',
      examType: 'ONLINE',
      examCategory: 'SUMMATIVE',
      questionSelectionMode: 'MANUAL',
      allowRetake: false,
      maxAttempts: '1',
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultsImmediately: true,
      showCorrectAnswers: false,
      requireProctoring: false,
      instructions: '',
      description: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        date: defaultValues.date ? defaultValues.date.split('T')[0] : '',
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      maxMarks: Number(data.maxMarks),
      passingScore: Number(data.passingScore),
      maxAttempts: Number(data.maxAttempts),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Online Exam' : 'Create Online Exam'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update online exam information' : 'Fill in the details to create a new online exam'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mid-Term Examination" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="MID2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monthly1">Monthly 1</SelectItem>
                          <SelectItem value="Midterm">Midterm</SelectItem>
                          <SelectItem value="Monthly2">Monthly 2</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ONLINE">Online Only</SelectItem>
                          <SelectItem value="HYBRID">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="examCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FORMATIVE">Formative</SelectItem>
                        <SelectItem value="SUMMATIVE">Summative</SelectItem>
                        <SelectItem value="DIAGNOSTIC">Diagnostic</SelectItem>
                        <SelectItem value="PLACEMENT">Placement</SelectItem>
                        <SelectItem value="PRACTICE">Practice</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Class and Subject */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Class & Subject</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* This would be populated with actual classes */}
                          <SelectItem value="">Select class...</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* This would be populated with actual subjects */}
                          <SelectItem value="">Select subject...</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Schedule</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration *</FormLabel>
                      <FormControl>
                        <Input placeholder="2 hours" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Marks */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Marks</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Marks *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Settings</h3>
              
              <FormField
                control={form.control}
                name="questionSelectionMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Selection Mode *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual Selection</SelectItem>
                        <SelectItem value="AUTO_RANDOM">Auto Random</SelectItem>
                        <SelectItem value="AUTO_DIFFICULTY">Auto by Difficulty</SelectItem>
                        <SelectItem value="AUTO_BLOOM">Auto by Bloom's Taxonomy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allowRetake"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Retake</FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attempts</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shuffleQuestions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Shuffle Questions</FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shuffleOptions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Shuffle Options</FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="showResultsImmediately"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show Results Immediately</FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showCorrectAnswers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show Correct Answers</FormLabel>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requireProctoring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Require Proctoring</FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Instructions</h3>
              
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter exam instructions..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter exam description..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEdit ? 'Update Exam' : 'Create Exam'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default OnlineExamFormModal
