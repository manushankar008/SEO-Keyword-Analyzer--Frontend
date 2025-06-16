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
  PieChart,
  LineChart,
  List,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react"

export default function SEOAnalyzer() {
  const [formData, setFormData] = useState({
    websiteUrl: "",
    mainTopic: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
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

  // Improve the keyword extraction function to get more meaningful keywords

  // Replace the extractKeywords function with this improved version:
  const extractKeywords = () => {
    if (!result?.seo_report?.current_keywords) return []

    // If current_keywords is an array of objects with word and count properties
    if (
      Array.isArray(result.seo_report.current_keywords) &&
      result.seo_report.current_keywords.length > 0 &&
      result.seo_report.current_keywords[0].word
    ) {
      // Extract meaningful keywords from the content
      const content = result.seo_report.current_keywords[0].word || ""

      // Split by common separators and clean up the text
      const words = content
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 4 && // Longer words are more likely to be meaningful
            !word.match(/^\d+$/) && // Exclude numbers
            !word.match(
              /^(and|the|that|this|with|from|your|our|their|have|for|not|are|was|were|been|being|will|would|should|could|can|may|might|must|shall)$/,
            ), // Exclude common stop words
        )

      // Count word frequency
      const wordCount = words.reduce((acc: Record<string, number>, word: string) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})

      // Convert to array and sort by frequency
      const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15) // Take top 15 keywords
        .map(([word, count]) => ({ word, count }))

      return sortedWords
    }

    return result.seo_report.current_keywords
  }

  // Get SEO report data
  const seoReport = result?.seo_report || {}
  const leadInfo = result?.lead_info || {}

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

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg border-0">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <h3 className="text-xl font-medium text-gray-700">Analyzing your website...</h3>
              </div>
              <div className="w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Checking SEO factors</div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Analyzing keywords</div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Identifying content gaps</div>
                  <Progress value={15} className="h-2" />
                </div>
              </div>
              <p className="text-gray-500 mt-6 text-center max-w-md">
                We're performing a comprehensive analysis of your website. This may take a moment as we check multiple
                SEO factors.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="shadow-lg border-0 border-red-200">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <h3 className="text-xl font-medium text-gray-700">Analysis Error</h3>
              </div>
              <p className="text-gray-600 text-center max-w-md mb-6">{error}</p>
              <div className="flex space-x-4">
                <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-700">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Analysis
                </Button>
                <Button
                  onClick={() => setError(null)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section - Tailored for n8n webhook response */}
        {result && !isLoading && !error && (
          <div className="space-y-8">
            {/* Overview Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">SEO Analysis Results</h2>
                    <p className="text-blue-100">
                      Analysis for {formData.websiteUrl} • {formatDate(seoReport.analysis_date)}
                    </p>
                  </div>
                  <div className="bg-white text-blue-600 rounded-full p-4 font-bold text-xl">
                    {seoReport.seo_score || 0}
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Keywords Found</div>
                      <div className="text-xl font-bold">{extractKeywords().length}</div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <LineChart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Content Coverage</div>
                      <div className="text-xl font-bold">{seoReport.content_gaps?.coverage_score || 0}%</div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <List className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Recommendations</div>
                      <div className="text-xl font-bold">
                        {Array.isArray(seoReport.recommendations) ? seoReport.recommendations.length : 0}
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}

                  <TabsContent value="overview" className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Website URL</span>
                          <span className="font-medium">{formData.websiteUrl}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Main Topic</span>
                          <span className="font-medium">{formData.mainTopic}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Analysis Date</span>
                          <span className="font-medium">{formatDate(seoReport.analysis_date)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Overall Score</span>
                          <span className={`font-medium ${getScoreColor(seoReport.seo_score || 0)}`}>
                            {seoReport.seo_score || 0}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SEO Score Visualization */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                        SEO Health Score
                      </h3>
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreBackground(seoReport.seo_score || 0)}`}
                        >
                          <div className="text-3xl font-bold text-center">
                            <span className={getScoreColor(seoReport.seo_score || 0)}>{seoReport.seo_score || 0}</span>
                            <span className="text-gray-400 text-sm">/100</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-gray-600 mb-4">{getScoreMessage(seoReport.seo_score || 0)}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score</span>
                          <span className={`font-medium ${getScoreColor(seoReport.seo_score || 0)}`}>
                            {seoReport.seo_score || 0}/100
                          </span>
                        </div>
                        <Progress value={seoReport.seo_score || 0} className="h-2" />
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-blue-500" />
                          Keyword Analysis
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Keywords Detected</span>
                            <span className="font-medium">{extractKeywords().length}</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Keyword Opportunities</span>
                            <span className="font-medium">{seoReport.keyword_opportunities?.total_found || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Top Keyword</span>
                            <span className="font-medium">
                              {extractKeywords().length > 0 ? extractKeywords()[0].word : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                          Content Coverage
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Coverage Score</span>
                              <span
                                className={`font-medium ${(seoReport.content_gaps?.coverage_score || 0) >= 70 ? "text-green-600" : "text-orange-600"}`}
                              >
                                {seoReport.content_gaps?.coverage_score || 0}%
                              </span>
                            </div>
                            <Progress value={seoReport.content_gaps?.coverage_score || 0} className="h-2" />
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Content Gaps</span>
                            <span className="font-medium">{seoReport.content_gaps?.gap_count || 0}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {(seoReport.content_gaps?.coverage_score || 0) >= 70
                              ? "Good coverage! Your content addresses most topics in your niche."
                              : "There's room to expand your content to cover more topics in your niche."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Keywords Tab */}
                  <TabsContent value="keywords" className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Detected Keywords</h3>
                      <div className="mb-6">
                        {extractKeywords().length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {extractKeywords().map((keyword: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{keyword.word || keyword}</span>
                                {keyword.count && <Badge className="bg-blue-100 text-blue-800">{keyword.count}</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No keywords detected</p>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-4 mt-8">Keyword Opportunities</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(seoReport.keyword_opportunities?.priority_keywords) &&
                        seoReport.keyword_opportunities.priority_keywords.length > 0 ? (
                          seoReport.keyword_opportunities.priority_keywords.map((keyword: string, index: number) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg w-full">
                            <p className="text-blue-700">
                              <strong>Recommendation:</strong> Research keywords related to "{formData.mainTopic}" to
                              improve your SEO strategy.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Long Tail Keywords */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Long-Tail Opportunities</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(seoReport.keyword_opportunities?.long_tail_opportunities) &&
                        seoReport.keyword_opportunities.long_tail_opportunities.length > 0 ? (
                          seoReport.keyword_opportunities.long_tail_opportunities.map(
                            (keyword: string, index: number) => (
                              <Badge key={index} className="bg-green-100 text-green-800">
                                {keyword}
                              </Badge>
                            ),
                          )
                        ) : (
                          <div className="p-4 bg-green-50 rounded-lg w-full">
                            <p className="text-green-700">
                              <strong>Tip:</strong> Create content that answers specific questions your audience is
                              asking about {formData.mainTopic}.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Content Coverage Score</span>
                            <span
                              className={`font-medium ${(seoReport.content_gaps?.coverage_score || 0) >= 70 ? "text-green-600" : "text-orange-600"}`}
                            >
                              {seoReport.content_gaps?.coverage_score || 0}%
                            </span>
                          </div>
                          <Progress value={seoReport.content_gaps?.coverage_score || 0} className="h-2" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {(seoReport.content_gaps?.coverage_score || 0) >= 70
                            ? "Your content covers most of the important topics in your niche."
                            : "Consider expanding your content to cover more topics in your niche."}
                        </p>
                      </div>
                    </div>

                    {/* Content Gaps */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Content Gaps</h3>
                      {Array.isArray(seoReport.content_gaps?.missing_topics) &&
                      seoReport.content_gaps.missing_topics.length > 0 ? (
                        <div className="space-y-3">
                          {seoReport.content_gaps.missing_topics.map((topic: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-green-700">
                            No significant content gaps detected. Your content appears to cover the main topics in your
                            niche well.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Competitor Analysis */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Competitor Analysis</h3>
                      {seoReport.competitor_analysis?.competitors_found > 0 ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-4">
                            We found {seoReport.competitor_analysis.competitors_found} competitors in your niche
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {seoReport.competitor_analysis.competitor_domains.map((domain: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-gray-100">
                                {domain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No specific competitors identified. Consider researching competitors in your niche to
                          understand their content strategies.
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Action Plan Tab */}

                  <TabsContent value="action-plan" className="space-y-6">
                    {/* Recommendations */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                      <div className="space-y-3">
                        {Array.isArray(seoReport.recommendations) && seoReport.recommendations.length > 0 ? (
                          seoReport.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-gray-700 font-medium">{rec}</span>
                                <p className="text-sm text-gray-500 mt-1">
                                  {index === 0 &&
                                    "Expand your content with targeted keywords to improve search visibility."}
                                  {index === 1 && "Group related content together to establish topical authority."}
                                  {index === 2 &&
                                    "Optimize page speed, meta tags, and site structure for better rankings."}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No specific recommendations available</p>
                        )}
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold mb-4">Your Action Plan</h3>
                      {Array.isArray(seoReport.next_steps) && seoReport.next_steps.length > 0 ? (
                        <ol className="space-y-4">
                          {seoReport.next_steps.map((step: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <span className="text-gray-700">{step}</span>
                                <div className="mt-1 text-sm text-gray-500">
                                  {index === 0 && "Estimated time: 2-3 weeks • Priority: High"}
                                  {index === 1 && "Estimated time: 1-2 weeks • Priority: High"}
                                  {index === 2 && "Estimated time: 2-4 weeks • Priority: Medium"}
                                  {index === 3 && "Estimated time: Ongoing • Priority: Medium"}
                                  {index === 4 && "Estimated time: Monthly • Priority: Medium"}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-gray-500 italic">No specific action steps available</p>
                      )}
                    </div>

                    {/* Download Action Plan */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg text-white">
                      <h3 className="text-lg font-semibold mb-2">Ready to improve your SEO?</h3>
                      <p className="mb-4">
                        Download your personalized action plan and start implementing these recommendations today.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="bg-white text-blue-600 hover:bg-blue-50">
                          <Download className="mr-2 h-4 w-4" />
                          Download Action Plan
                        </Button>
                        <Button className="bg-blue-400 bg-opacity-25 text-white hover:bg-opacity-40">
                          Schedule Consultation
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-gray-50 p-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">Analysis performed on {formatDate(seoReport.analysis_date)}</div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Schedule Follow-up</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <p>Powered by advanced SEO analysis algorithms</p>
        </div>
      </div>
    </div>
  )
}
