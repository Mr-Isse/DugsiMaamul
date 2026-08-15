import React, { useState } from 'react'
import { Play, Pause, Clock, Settings, RefreshCw, Zap } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetScheduledJobsQuery,
  useToggleScheduledJobMutation,
  useRunScheduledJobNowMutation
} from '@/services/api/automationApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AutomationEnginePage() {
  const { data: response, isLoading, refetch } = useGetScheduledJobsQuery()
  const [toggleJob] = useToggleScheduledJobMutation()
  const [runJob] = useRunScheduledJobNowMutation()

  const jobs = response?.data || []

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleJob(id).unwrap()
      toast.success(`Job ${currentStatus === 'active' ? 'paused' : 'resumed'} successfully`)
      refetch()
    } catch (err) {
      toast.error('Failed to toggle job status')
    }
  }

  const handleRunNow = async (id) => {
    try {
      await runJob(id).unwrap()
      toast.success('Job started manually')
    } catch (err) {
      toast.error('Failed to trigger job')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Automation Engine
          </h1>
          <p className="text-muted-foreground">
            Manage scheduled jobs, automated workflows, and system cron tasks.
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No automated jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-xs text-muted-foreground">{job.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm font-mono">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {job.schedule}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(job._id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Run Now
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(job._id, job.status)}
                      >
                        {job.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
