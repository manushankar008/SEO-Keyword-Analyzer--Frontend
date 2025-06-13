"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Search,
  Globe,
  Mail,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Award,
  ArrowRight,
  FileText,
  BarChart3,
  Lightbulb,
  Target,
} from "lucide-react"

interface KeywordOpportunities {
  total_found: number
  priority_keywords: string[]
  long_tail_opportunities: string[]
}

interface ContentGaps {
  missing_topics: string[]
  gap_count: number
  coverage_score: number
}

interface CompetitorAnalysis {
  competitors_found: number
  competitor_domains: string[]
}

interface SEOReport {
  analysis_date: string
  seo_score: number
  current_keywords: string[]
  keyword_opportunities: KeywordOpportunities
  content_gaps: ContentGaps
  competitor_analysis: CompetitorAnalysis
  recommendations: string[]
  next_steps: string[]
}

interface LeadInfo {
  email: string
  analysis_date: string
}

interface DetailedAnalysis {
  overview: {
    analysis_date: string
    website_url: string
    overall_score: number
    grade: string
    status: string
  }
  page_details: {
    title: string
    meta_description: string
    content_length: number
    reading_time: number
    headings_count: number
  }
  seo_factors: {
    title_analysis: {
      length: number
      status: string
      score: number
      feedback: string[]
    }
    meta_description_analysis: {
      length: number
      status: string
      score: number
      feedback: string[]
    }
    content_analysis: {
      word_count: number
      character_count: number
      reading_time: number
      status: string
      score: number
      feedback: string[]
    }
    keyword_analysis: {
      total_keywords: number
      status: string
      score: number
      feedback: string[]
    }
  }
  top_keywords: Array<{
    keyword: string
    frequency: number
    importance: string
  }>
  recommendations: Array<{
    priority: string
    category: string
    issue: string
    solution: string
    impact: string
  }>
  action_items: string[]
}

interface AnalysisResult {
  seo_report: SEOReport
  lead_info: LeadInfo
  detailed_analysis?: DetailedAnalysis
}

export default function SEOAnalyzer() {
  const [formData, setFormData] = useState({
    websiteUrl: "",
    mainTopic: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateEmail = (email: string) => {
    if (!email) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResults(null)

    // Validation
    if (!formData.websiteUrl || !formData.mainTopic) {
      setError("Please fill in your website URL and main topic so we can help you better.")
      return
    }

    if (!validateUrl(formData.websiteUrl)) {
      setError("That doesn't look like a valid website URL. Try something like https://example.com")
      return
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError("Please check your email address format.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        setResults(data)
      } else if (data && typeof data === "object") {
        setResults([data])
      } else {
        throw new Error("Invalid response format from server")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-yellow-600"
    return "text-orange-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-blue-100"
    if (score >= 40) return "bg-yellow-100"
    return "bg-orange-100"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent! Your website is performing great!"
    if (score >= 60) return "Good job! There's room for improvement."
    if (score >= 40) return "Not bad! With some work, you can improve your SEO."
    return "We found several opportunities to boost your website's visibility."
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "recently"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) return "just now"
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

      return date.toLocaleDateString()
    } catch (e) {
      return "recently"
    }
  }

  // Safe access to the first result
  const firstResult = results?.[0]
  const seoReport = firstResult?.seo_report
  const leadInfo = firstResult?.lead_info
  const detailedAnalysis = firstResult?.detailed_analysis

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-3 bg-blue-600 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900">SEO Growth Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover untapped keywords and content opportunities to grow your website's visibility
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>Analyze Your Website</span>
            </CardTitle>
            <CardDescription>
              Fill in the details below and we'll analyze your website for SEO opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Website URL</span>
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">Enter the full URL of your website</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainTopic">Main Topic</Label>
                  <Input
                    id="mainTopic"
                    type="text"
                    placeholder="e.g., digital marketing"
                    value={formData.mainTopic}
                    onChange={(e) => handleInputChange("mainTopic", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">What's your website primarily about?</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>Email Address (Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500">We'll send you a detailed report to this email</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Your Website...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Start Free Analysis
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && results.length > 0 && seoReport && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>Analysis Complete!</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Analyzed {formatDate(seoReport.analysis_date)}</span>
                  </CardDescription>
                </div>
                {typeof seoReport.seo_score === "number" && (
                  <div className={`p-3 rounded-full ${getScoreBackground(seoReport.seo_score)}`}>
                    <div className="text-2xl font-bold text-center">
                      <span className={getScoreColor(seoReport.seo_score)}>{seoReport.seo_score}</span>
                      <span className="text-gray-400 text-sm">/100</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="action">Action Plan</TabsTrigger>
                  {detailedAnalysis && <TabsTrigger value="detailed">Detailed</TabsTrigger>}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* SEO Score */}
                  {typeof seoReport.seo_score === "number" && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">SEO Health Score</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Score</span>
                            <span className={getScoreColor(seoReport.seo_score)}>{seoReport.seo_score}/100</span>
                          </div>
                          <Progress value={seoReport.seo_score} className="h-2" />
                        </div>
                        <p className={`text-sm ${getScoreColor(seoReport.seo_score)}`}>
                          {getScoreMessage(seoReport.seo_score)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Keyword Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seoReport.keyword_opportunities?.total_found ?? 0}</div>
                        <p className="text-sm text-gray-600">Potential keywords found</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Content Gaps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seoReport.content_gaps?.gap_count ?? 0}</div>
                        <p className="text-sm text-gray-600">Missing content topics</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Content Coverage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seoReport.content_gaps?.coverage_score ?? 0}%</div>
                        <p className="text-sm text-gray-600">Topic coverage score</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Competitors */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Competitor Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        We found {seoReport.competitor_analysis?.competitors_found ?? 0} competitors in your niche
                      </p>
                      {seoReport.competitor_analysis?.competitor_domains?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {seoReport.competitor_analysis.competitor_domains.map((domain, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">No specific competitors identified</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Keywords Tab */}
                <TabsContent value="keywords" className="space-y-6">
                  {/* Current Keywords */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Your Current Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {seoReport.current_keywords?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {seoReport.current_keywords.map((keyword, index) => (
                            <Badge key={index} className="bg-gray-200 text-gray-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">
                          We couldn't detect any clear keywords on your site
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Priority Keywords */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>Priority Keywords to Target</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        These high-value keywords can drive significant traffic to your website
                      </p>
                      {seoReport.keyword_opportunities?.priority_keywords?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {seoReport.keyword_opportunities.priority_keywords.map((keyword, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">No priority keywords identified</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Long Tail Keywords */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Long-Tail Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        These specific phrases have less competition and can help you attract targeted visitors
                      </p>
                      {seoReport.keyword_opportunities?.long_tail_opportunities?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {seoReport.keyword_opportunities.long_tail_opportunities.map((keyword, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">No long-tail opportunities identified</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  {/* Content Gaps */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Content Gaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        These are topics your audience is searching for that your website doesn't cover yet
                      </p>
                      {seoReport.content_gaps?.missing_topics?.length > 0 ? (
                        <div className="space-y-3">
                          {seoReport.content_gaps.missing_topics.map((topic, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700">{topic}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">No specific content gaps identified</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Content Coverage */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Content Coverage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Coverage Score</span>
                          <span
                            className={
                              (seoReport.content_gaps?.coverage_score ?? 0) >= 70 ? "text-green-600" : "text-orange-600"
                            }
                          >
                            {seoReport.content_gaps?.coverage_score ?? 0}%
                          </span>
                        </div>
                        <Progress value={seoReport.content_gaps?.coverage_score ?? 0} className="h-2" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {(seoReport.content_gaps?.coverage_score ?? 0) >= 70
                          ? "Good coverage! Your content addresses most topics in your niche."
                          : "There's room to expand your content to cover more topics in your niche."}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Action Plan Tab */}
                <TabsContent value="action" className="space-y-6">
                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {seoReport.recommendations?.length > 0 ? (
                          seoReport.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm italic text-gray-500">No specific recommendations available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Steps */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Your Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {seoReport.next_steps?.length > 0 ? (
                        <ol className="space-y-4">
                          {seoReport.next_steps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm italic text-gray-500">No specific action steps available</p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <span>Download Full Action Plan</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Detailed Analysis Tab */}
                {detailedAnalysis && (
                  <TabsContent value="detailed" className="space-y-6">
                    {/* Grade Card */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <span>SEO Grade: {detailedAnalysis.overview.grade}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium">{detailedAnalysis.overview.status}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Website:</span>
                            <span className="font-medium">{detailedAnalysis.overview.website_url}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Page Details */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span>Page Details</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 border rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Title</div>
                            <div className="font-medium">
                              {detailedAnalysis.page_details.title || "No title detected"}
                            </div>
                          </div>

                          <div className="p-3 border rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Meta Description</div>
                            <div className="font-medium">
                              {detailedAnalysis.page_details.meta_description || "No meta description detected"}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 border rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Content Length</div>
                              <div className="font-medium">{detailedAnalysis.page_details.content_length} chars</div>
                            </div>

                            <div className="p-3 border rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Reading Time</div>
                              <div className="font-medium">{detailedAnalysis.page_details.reading_time} min</div>
                            </div>

                            <div className="p-3 border rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Headings</div>
                              <div className="font-medium">{detailedAnalysis.page_details.headings_count}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SEO Factors */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-purple-500" />
                          <span>SEO Factor Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Title Analysis */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Title Analysis</div>
                              <Badge
                                className={
                                  detailedAnalysis.seo_factors.title_analysis.status === "Excellent"
                                    ? "bg-green-100 text-green-800"
                                    : detailedAnalysis.seo_factors.title_analysis.status === "Good"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                }
                              >
                                {detailedAnalysis.seo_factors.title_analysis.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span>{detailedAnalysis.seo_factors.title_analysis.score}/25</span>
                              </div>
                              <Progress
                                value={(detailedAnalysis.seo_factors.title_analysis.score / 25) * 100}
                                className="h-2"
                              />
                              <div className="text-sm text-gray-600 mt-1">
                                Length: {detailedAnalysis.seo_factors.title_analysis.length} characters
                              </div>
                              <div className="space-y-1 mt-2">
                                {detailedAnalysis.seo_factors.title_analysis.feedback.map((item, i) => (
                                  <div key={i} className="text-sm">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Meta Description Analysis */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Meta Description Analysis</div>
                              <Badge
                                className={
                                  detailedAnalysis.seo_factors.meta_description_analysis.status === "Excellent"
                                    ? "bg-green-100 text-green-800"
                                    : detailedAnalysis.seo_factors.meta_description_analysis.status === "Good"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                }
                              >
                                {detailedAnalysis.seo_factors.meta_description_analysis.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span>{detailedAnalysis.seo_factors.meta_description_analysis.score}/20</span>
                              </div>
                              <Progress
                                value={(detailedAnalysis.seo_factors.meta_description_analysis.score / 20) * 100}
                                className="h-2"
                              />
                              <div className="text-sm text-gray-600 mt-1">
                                Length: {detailedAnalysis.seo_factors.meta_description_analysis.length} characters
                              </div>
                              <div className="space-y-1 mt-2">
                                {detailedAnalysis.seo_factors.meta_description_analysis.feedback.map((item, i) => (
                                  <div key={i} className="text-sm">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Content Analysis */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Content Analysis</div>
                              <Badge
                                className={
                                  detailedAnalysis.seo_factors.content_analysis.status === "Excellent"
                                    ? "bg-green-100 text-green-800"
                                    : detailedAnalysis.seo_factors.content_analysis.status === "Good"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                }
                              >
                                {detailedAnalysis.seo_factors.content_analysis.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span>{detailedAnalysis.seo_factors.content_analysis.score}/25</span>
                              </div>
                              <Progress
                                value={(detailedAnalysis.seo_factors.content_analysis.score / 25) * 100}
                                className="h-2"
                              />
                              <div className="text-sm text-gray-600 mt-1">
                                Word count: {detailedAnalysis.seo_factors.content_analysis.word_count} words
                              </div>
                              <div className="space-y-1 mt-2">
                                {detailedAnalysis.seo_factors.content_analysis.feedback.map((item, i) => (
                                  <div key={i} className="text-sm">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Keyword Analysis */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Keyword Analysis</div>
                              <Badge
                                className={
                                  detailedAnalysis.seo_factors.keyword_analysis.status === "Excellent"
                                    ? "bg-green-100 text-green-800"
                                    : detailedAnalysis.seo_factors.keyword_analysis.status === "Good"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                }
                              >
                                {detailedAnalysis.seo_factors.keyword_analysis.status}
                              </Badge>
                            </div>
                            <div className="space-y-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span>{detailedAnalysis.seo_factors.keyword_analysis.score}/20</span>
                              </div>
                              <Progress
                                value={(detailedAnalysis.seo_factors.keyword_analysis.score / 20) * 100}
                                className="h-2"
                              />
                              <div className="text-sm text-gray-600 mt-1">
                                Keywords found: {detailedAnalysis.seo_factors.keyword_analysis.total_keywords}
                              </div>
                              <div className="space-y-1 mt-2">
                                {detailedAnalysis.seo_factors.keyword_analysis.feedback.map((item, i) => (
                                  <div key={i} className="text-sm">
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Keywords */}
                    {detailedAnalysis.top_keywords.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            <span>Detected Keywords</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {detailedAnalysis.top_keywords.map((keyword, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg flex justify-between items-center ${
                                    keyword.importance === "High"
                                      ? "bg-blue-50 border border-blue-200"
                                      : keyword.importance === "Medium"
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  <span className="font-medium">{keyword.keyword}</span>
                                  <Badge
                                    className={
                                      keyword.importance === "High"
                                        ? "bg-blue-100 text-blue-800"
                                        : keyword.importance === "Medium"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {keyword.frequency}×
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Detailed Recommendations */}
                    {detailedAnalysis.recommendations.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            <span>Detailed Recommendations</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {detailedAnalysis.recommendations.map((rec, index) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border ${
                                  rec.priority === "High"
                                    ? "border-red-200 bg-red-50"
                                    : rec.priority === "Medium"
                                      ? "border-yellow-200 bg-yellow-50"
                                      : "border-blue-200 bg-blue-50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">{rec.category}</div>
                                  <Badge
                                    className={
                                      rec.priority === "High"
                                        ? "bg-red-100 text-red-800"
                                        : rec.priority === "Medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-blue-100 text-blue-800"
                                    }
                                  >
                                    {rec.priority} Priority
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-700 mb-2">
                                  <span className="font-medium">Issue:</span> {rec.issue}
                                </div>
                                <div className="text-sm text-gray-700 mb-2">
                                  <span className="font-medium">Solution:</span> {rec.solution}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">Impact:</span> {rec.impact}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <p>Powered by advanced SEO analysis algorithms</p>
        </div>
      </div>
    </div>
  )
}
