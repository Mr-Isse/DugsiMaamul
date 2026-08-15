import React from 'react'
import { Sparkles, Brain, Bot, Lightbulb, Activity, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetAiInsightsQuery, useGetAiPredictionsQuery } from '@/services/api/aiApi'

export default function AiDashboardPage() {
  const { data: insightsResponse, isLoading: isLoadingInsights } = useGetAiInsightsQuery()
  const { data: predictionsResponse, isLoading: isLoadingPredictions } = useGetAiPredictionsQuery()

  const insights = insightsResponse?.data || []
  const predictions = predictionsResponse?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" />
            AI Learning Assistant
          </h1>
          <p className="text-muted-foreground">
            Smart insights, predictions, and AI-driven analytics for your school.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{predictions.length || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> updated 5 mins ago
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.length || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Sparkles className="h-3 w-3 text-indigo-500" /> ready to review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Optimal</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Activity className="h-3 w-3" /> ML pipelines online
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Latest Insights
            </CardTitle>
            <CardDescription>AI generated anomalies and performance patterns</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent insights found.</p>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-card/50 flex gap-3">
                    <div className="mt-0.5"><Sparkles className="h-4 w-4 text-indigo-500" /></div>
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Risk Predictions
            </CardTitle>
            <CardDescription>Students at risk of dropping performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPredictions ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : predictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No risk predictions at this time.</p>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${pred.riskLevel === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-medium">{pred.studentName}</span>
                    </div>
                    <span className="text-xs font-mono">{Math.round(pred.probability * 100)}% risk</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
