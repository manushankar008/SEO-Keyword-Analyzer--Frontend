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
  AlertTriangle,
  RefreshCw,
  Download,
  Target,
  Users,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Trophy,
  Eye,
} from "lucide-react"

interface SEOAnalysisResult {
  seo_report: {
    analysis_date: string
    seo_score: number
    current_keywords: Array<{
      word: string
      count: number
    }>
    keyword_opportunities: {
      total_found: number
      priority_keywords: string[]
      long_tail_opportunities: string[]
    }
    content_gaps: {
      missing_topics: string[]
      gap_count: number
      coverage_score: number
    }
    competitor_analysis: {
      competitors_found: number
      competitor_domains: string[]
    }
    recommendations: string[]
    next_steps: string[]
  }
  lead_info: {
    email: string
    analysis_date: string
  }
}

export default function SEOAnalyzer() {
  const [formData, setFormData] = useState({
    websiteUrl: "",
    mainTopic: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SEOAnalysisResult | null>(null)
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
    setResult(null)

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

      // Check for error in response
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err) {
      console.error("Error during analysis:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    handleSubmit(new Event("submit") as any)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-brand-primary"
    if (score >= 40) return "text-yellow-600"
    return "text-orange-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-orange-100"
    if (score >= 40) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent! Your website is performing great!"
    if (score >= 60) return "Good job! There's room for improvement."
    if (score >= 40) return "Not bad! With some work, you can improve your SEO."
    return "We found several opportunities to boost your website's visibility."
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "just now"

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "just now"
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "just now"
    }
  }

  const seoReport = result?.seo_report

  return (
    <div className="min-h-screen bg-header-gradient p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-3 bg-brand-primary rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-poppins text-brand-heading">SEO Growth Analyzer</h1>
          </div>
          <p className="text-lg text-brand-body max-w-2xl mx-auto font-inter">
            Discover untapped keywords and content opportunities to grow your website's visibility
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-brand-section">
            <CardTitle className="flex items-center space-x-2 font-poppins text-brand-heading">
              <Search className="h-5 w-5 text-brand-primary" />
              <span>Analyze Your Website</span>
            </CardTitle>
            <CardDescription className="font-inter text-brand-body">
              Fill in the details below and we'll analyze your website for SEO opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="websiteUrl"
                    className="flex items-center space-x-2 font-inter font-medium text-brand-heading"
                  >
                    <Globe className="h-4 w-4 text-brand-primary" />
                    <span>Website URL</span>
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-brand-primary border-gray-300 font-inter"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-brand-body font-inter">Enter the full URL of your website</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainTopic" className="font-inter font-medium text-brand-heading">
                    Main Topic
                  </Label>
                  <Input
                    id="mainTopic"
                    type="text"
                    placeholder="e.g., digital marketing"
                    value={formData.mainTopic}
                    onChange={(e) => handleInputChange("mainTopic", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-brand-primary border-gray-300 font-inter"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-brand-body font-inter">What's your website primarily about?</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center space-x-2 font-inter font-medium text-brand-heading"
                >
                  <Mail className="h-4 w-4 text-brand-primary" />
                  <span>Email Address (Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-brand-primary border-gray-300 font-inter"
                  disabled={isLoading}
                />
                <p className="text-sm text-brand-body font-inter">We'll send you a detailed report to this email</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="font-inter">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 font-inter"
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

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
                <h3 className="text-xl font-medium text-brand-heading font-poppins">Analyzing your website...</h3>
              </div>
              <div className="w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-brand-body font-inter">Checking SEO factors</div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-brand-body font-inter">Analyzing keywords</div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-brand-body font-inter">Identifying content gaps</div>
                  <Progress value={15} className="h-2" />
                </div>
              </div>
              <p className="text-brand-body mt-6 text-center max-w-md font-inter">
                We're performing a comprehensive analysis of your website. This may take a moment as we check multiple
                SEO factors.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="shadow-lg border-0 border-red-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <h3 className="text-xl font-medium text-brand-heading font-poppins">Analysis Error</h3>
              </div>
              <p className="text-brand-body text-center max-w-md mb-6 font-inter">{error}</p>
              <div className="flex space-x-4">
                <Button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-4 rounded-lg font-inter"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Analysis
                </Button>
                <Button
                  onClick={() => setError(null)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 font-semibold py-4 px-4 rounded-lg font-inter"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && seoReport && !isLoading && !error && (
          <div className="space-y-8">
            {/* Overview Card */}
            <Card className="shadow-lg border-0 overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-brand-primary to-orange-500 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-poppins">SEO Analysis Results</h2>
                    <p className="text-orange-100 font-inter">
                      Analysis for {formData.websiteUrl} • {formatDate(seoReport.analysis_date)}
                    </p>
                  </div>
                  <div className="bg-white text-brand-primary rounded-full p-4 font-bold text-xl font-poppins">
                    {seoReport.seo_score}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <CardContent className="p-6 bg-brand-section">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg flex items-center space-x-4 shadow-sm">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Target className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-body font-inter">Keywords Found</div>
                      <div className="text-xl font-bold text-brand-heading font-poppins">
                        {seoReport.current_keywords?.length || 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg flex items-center space-x-4 shadow-sm">
                    <div className="bg-green-100 p-3 rounded-full">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-body font-inter">Content Coverage</div>
                      <div className="text-xl font-bold text-brand-heading font-poppins">
                        {seoReport.content_gaps?.coverage_score || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg flex items-center space-x-4 shadow-sm">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-body font-inter">Competitors Found</div>
                      <div className="text-xl font-bold text-brand-heading font-poppins">
                        {seoReport.competitor_analysis?.competitors_found || 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg flex items-center space-x-4 shadow-sm">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-body font-inter">Recommendations</div>
                      <div className="text-xl font-bold text-brand-heading font-poppins">
                        {seoReport.recommendations?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-5 mb-6 bg-white">
                    <TabsTrigger value="overview" className="font-inter font-medium">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="keywords" className="font-inter font-medium">
                      Keywords
                    </TabsTrigger>
                    <TabsTrigger value="competitors" className="font-inter font-medium">
                      Competitors
                    </TabsTrigger>
                    <TabsTrigger value="content" className="font-inter font-medium">
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="action-plan" className="font-inter font-medium">
                      Action Plan
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* SEO Score Visualization */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 flex items-center font-poppins text-brand-heading">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                        SEO Health Score
                      </h3>
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreBackground(seoReport.seo_score)}`}
                        >
                          <div className="text-3xl font-bold text-center font-poppins">
                            <span className={getScoreColor(seoReport.seo_score)}>{seoReport.seo_score}</span>
                            <span className="text-gray-400 text-sm">/100</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-brand-body mb-4 font-inter">
                        {getScoreMessage(seoReport.seo_score)}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-inter text-brand-body">Score</span>
                          <span className={`font-medium font-inter ${getScoreColor(seoReport.seo_score)}`}>
                            {seoReport.seo_score}/100
                          </span>
                        </div>
                        <Progress value={seoReport.seo_score} className="h-2" />
                      </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">Analysis Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-brand-body font-inter">Website URL</span>
                          <span className="font-medium text-brand-heading font-inter">{formData.websiteUrl}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-brand-body font-inter">Main Topic</span>
                          <span className="font-medium text-brand-heading font-inter">{formData.mainTopic}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-brand-body font-inter">Analysis Date</span>
                          <span className="font-medium text-brand-heading font-inter">
                            {formatDate(seoReport.analysis_date)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-body font-inter">Overall Score</span>
                          <span className={`font-medium font-inter ${getScoreColor(seoReport.seo_score)}`}>
                            {seoReport.seo_score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Keywords Tab */}
                  <TabsContent value="keywords" className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">Top Keywords Found</h3>
                      {seoReport.current_keywords && seoReport.current_keywords.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {seoReport.current_keywords.map((keyword, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-brand-section rounded-lg"
                            >
                              <span className="font-medium capitalize text-brand-heading font-inter">
                                {keyword.word}
                              </span>
                              <Badge className="bg-brand-primary text-white font-inter">{keyword.count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-brand-body italic font-inter">No keywords detected</p>
                      )}
                    </div>

                    {/* Keyword Opportunities */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">
                        Keyword Opportunities
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 font-poppins text-brand-heading">Priority Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {seoReport.keyword_opportunities?.priority_keywords &&
                            seoReport.keyword_opportunities.priority_keywords.length > 0 ? (
                              seoReport.keyword_opportunities.priority_keywords.map((keyword, index) => (
                                <Badge key={index} className="bg-brand-primary text-white font-inter">
                                  {keyword}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-brand-body italic text-sm font-inter">
                                No priority keywords identified. Consider researching keywords related to "
                                {formData.mainTopic}".
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 font-poppins text-brand-heading">Long-Tail Opportunities</h4>
                          <div className="flex flex-wrap gap-2">
                            {seoReport.keyword_opportunities?.long_tail_opportunities &&
                            seoReport.keyword_opportunities.long_tail_opportunities.length > 0 ? (
                              seoReport.keyword_opportunities.long_tail_opportunities.map((keyword, index) => (
                                <Badge key={index} className="bg-green-100 text-green-800 font-inter">
                                  {keyword}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-brand-body italic text-sm font-inter">
                                No long-tail opportunities identified. Create content that answers specific questions
                                about {formData.mainTopic}.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Competitors Tab */}
                  <TabsContent value="competitors" className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 flex items-center font-poppins text-brand-heading">
                        <Eye className="h-5 w-5 mr-2 text-purple-500" />
                        Competitor Analysis
                      </h3>
                      {seoReport.competitor_analysis?.competitors_found > 0 ? (
                        <div>
                          <p className="text-brand-body mb-4 font-inter">
                            We found <strong>{seoReport.competitor_analysis.competitors_found}</strong> competitors in
                            your niche. Analyzing their strategies can help you identify content gaps and opportunities.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {seoReport.competitor_analysis.competitor_domains.map((domain, index) => (
                              <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center space-x-2">
                                  <Globe className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium text-brand-heading font-inter">{domain}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-brand-body font-inter">
                            No specific competitors identified. Consider researching competitors in your niche to
                            understand their content strategies.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">Content Analysis</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-inter text-brand-body">Content Coverage Score</span>
                            <span
                              className={`font-medium font-inter ${(seoReport.content_gaps?.coverage_score || 0) >= 70 ? "text-green-600" : "text-orange-600"}`}
                            >
                              {seoReport.content_gaps?.coverage_score || 0}%
                            </span>
                          </div>
                          <Progress value={seoReport.content_gaps?.coverage_score || 0} className="h-2" />
                        </div>
                        <p className="text-sm text-brand-body font-inter">
                          {(seoReport.content_gaps?.coverage_score || 0) >= 70
                            ? "Your content covers most of the important topics in your niche."
                            : "Consider expanding your content to cover more topics in your niche."}
                        </p>
                      </div>
                    </div>

                    {/* Content Gaps */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">Content Gaps</h3>
                      {seoReport.content_gaps?.missing_topics && seoReport.content_gaps.missing_topics.length > 0 ? (
                        <div className="space-y-3">
                          {seoReport.content_gaps.missing_topics.map((topic, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-brand-heading font-inter">{topic}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 inline mr-2" />
                          <span className="text-green-700 font-inter">
                            No significant content gaps detected. Your content appears to cover the main topics in your
                            niche well.
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Action Plan Tab */}
                  <TabsContent value="action-plan" className="space-y-6">
                    {/* Recommendations */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">Recommendations</h3>
                      <div className="space-y-3">
                        {seoReport.recommendations && seoReport.recommendations.length > 0 ? (
                          seoReport.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 bg-orange-50 p-4 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
                              <span className="text-brand-heading font-inter">{rec}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-brand-body italic font-inter">No specific recommendations available</p>
                        )}
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 font-poppins text-brand-heading">Your Action Plan</h3>
                      {seoReport.next_steps && seoReport.next_steps.length > 0 ? (
                        <ol className="space-y-4">
                          {seoReport.next_steps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm font-poppins">
                                {index + 1}
                              </div>
                              <span className="text-brand-heading font-inter">{step}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-brand-body italic font-inter">No specific action steps available</p>
                      )}
                    </div>

                    {/* Download Action Plan */}
                    <div className="bg-gradient-to-r from-brand-primary to-orange-500 p-6 rounded-lg text-white">
                      <h3 className="text-lg font-semibold mb-2 font-poppins">Ready to improve your SEO?</h3>
                      <p className="mb-4 font-inter">
                        Download your personalized action plan and start implementing these recommendations today.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="bg-white text-brand-primary hover:bg-gray-100 font-semibold py-4 px-4 rounded-lg font-inter">
                          <Download className="mr-2 h-4 w-4" />
                          Download Action Plan
                        </Button>
                        <Button className="bg-orange-400 bg-opacity-25 text-white hover:bg-opacity-40 font-semibold py-4 px-4 rounded-lg font-inter">
                          Schedule Consultation
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-brand-section p-6 flex justify-between items-center">
                <div className="text-sm text-brand-body font-inter">
                  Analysis performed on {formatDate(seoReport.analysis_date)}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 font-semibold py-4 px-4 rounded-lg font-inter border-brand-primary text-brand-primary hover:bg-orange-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>Schedule Follow-up</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-brand-body text-sm pb-8 font-inter">
          <p>Powered by advanced SEO analysis algorithms</p>
        </div>
      </div>
    </div>
  )
}
