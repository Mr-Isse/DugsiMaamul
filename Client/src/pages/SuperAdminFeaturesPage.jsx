import React from 'react'
import { Shield, Server, Zap, HardDrive, Smartphone } from 'lucide-react'
import {
  useGetFeatureRegistryQuery,
} from '@/services/api/superAdminApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const ICONS = {
  academic: <Shield className="h-5 w-5 text-indigo-500" />,
  finance: <Zap className="h-5 w-5 text-green-500" />,
  enterprise: <Server className="h-5 w-5 text-purple-500" />,
  hr: <HardDrive className="h-5 w-5 text-orange-500" />,
  communication: <Smartphone className="h-5 w-5 text-blue-500" />
}

export default function SuperAdminFeaturesPage() {
  const { data: response, isLoading } = useGetFeatureRegistryQuery()

  const categories = response?.byCategory || {}
  const featureList = response?.data || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Registry</h1>
          <p className="text-muted-foreground">Global view of all system features managed by plans.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Total Features: {featureList.length}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(categories).map(([category, features]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                {ICONS[category] || <Shield className="h-5 w-5" />}
                {category.replace('-', ' ')}
              </CardTitle>
              <CardDescription>
                {features.length} available features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
