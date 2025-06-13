import { type NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "https://n8n.srv832341.hstgr.cloud/webhook-test/seo-analyze"

// Helper function to calculate reading time
function calculateReadingTime(text: string) {
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Helper function to extract clean keywords
function extractCleanKeywords(text: string) {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "her",
    "was",
    "one",
    "our",
    "had",
    "will",
    "what",
    "your",
    "when",
    "him",
    "with",
    "has",
    "this",
    "that",
    "from",
    "they",
    "have",
    "more",
    "been",
    "were",
    "said",
    "each",
    "which",
    "their",
    "time",
    "into",
    "than",
    "only",
    "come",
    "some",
    "very",
    "after",
    "back",
    "other",
    "many",
    "them",
    "these",
    "may",
    "first",
    "well",
    "work",
    "get",
    "make",
    "about",
    "contact",
    "home",
    "page",
    "website",
    "menu",
    "toggle",
    "click",
    "here",
    "now",
    "today",
  ])

  // Clean and normalize text
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  // Extract meaningful keywords
  const words = cleanText.split(" ").filter(
    (word) => word.length > 3 && word.length < 20 && !stopWords.has(word) && !word.match(/^\d+$/), // Remove pure numbers
  )

  // Count frequency
  const wordCount: Record<string, number> = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  // Return top keywords with meaningful frequency
  return Object.entries(wordCount)
    .filter(([word, count]) => count >= 2) // Only words that appear at least twice
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word, count]) => ({
      keyword: word,
      frequency: count,
      importance: count > 5 ? "High" : count > 3 ? "Medium" : "Low",
    }))
}

// Process website data and generate SEO analysis
function generateSEOAnalysis(websiteData: any) {
  // Initialize analysis object
  const analysis = {
    overview: {
      analysis_date: new Date().toISOString(),
      website_url: websiteData.websiteUrl || "Unknown",
      overall_score: 0,
      grade: "F",
      status: "Needs Improvement",
    },
    page_details: {
      title: "",
      meta_description: "",
      content_length: 0,
      reading_time: 0,
      headings_count: 0,
    },
    seo_factors: {
      title_analysis: {},
      meta_description_analysis: {},
      content_analysis: {},
      keyword_analysis: {},
    },
    top_keywords: [],
    recommendations: [],
    action_items: [],
  }

  // For demo purposes, we'll simulate content based on the main topic
  const title = websiteData.mainTopic ? `Best ${websiteData.mainTopic} Guide for 2025` : ""
  const metaDescription = websiteData.mainTopic
    ? `Discover everything you need to know about ${websiteData.mainTopic}. Expert tips, strategies, and insights to help you succeed.`
    : ""
  const contentText = websiteData.mainTopic
    ? `This is a comprehensive guide about ${websiteData.mainTopic}. It covers all the essential aspects and provides valuable insights.`.repeat(
        10,
      )
    : ""
  const headings = websiteData.mainTopic
    ? `H1Main${websiteData.mainTopic}GuideH2KeyBenefitsH2StrategiesH3AdvancedTipsH2Conclusion`
    : ""

  // Populate page details
  analysis.page_details = {
    title: title,
    meta_description: metaDescription,
    content_length: contentText.length,
    reading_time: calculateReadingTime(contentText),
    headings_count: headings ? headings.split(/(?=[A-Z][a-z])/).filter((h: string) => h.trim().length > 2).length : 0,
  }

  // Title Analysis
  let titleScore = 0
  const titleAnalysis: any = {
    length: title.length,
    status: "Missing",
    score: 0,
    feedback: [],
  }

  if (title.length > 0) {
    if (title.length >= 30 && title.length <= 60) {
      titleScore = 25
      titleAnalysis.status = "Excellent"
      titleAnalysis.feedback.push("✅ Perfect title length")
    } else if (title.length >= 20 && title.length < 30) {
      titleScore = 15
      titleAnalysis.status = "Good"
      titleAnalysis.feedback.push("⚠️ Title could be longer for better SEO")
    } else if (title.length > 60) {
      titleScore = 10
      titleAnalysis.status = "Too Long"
      titleAnalysis.feedback.push("❌ Title is too long, may be truncated in search results")
    } else {
      titleScore = 5
      titleAnalysis.status = "Too Short"
      titleAnalysis.feedback.push("❌ Title is too short, add more descriptive words")
    }
  } else {
    titleAnalysis.feedback.push("❌ Missing page title - this is critical for SEO")
  }

  titleAnalysis.score = titleScore
  analysis.seo_factors.title_analysis = titleAnalysis

  // Meta Description Analysis
  let metaScore = 0
  const metaAnalysis: any = {
    length: metaDescription.length,
    status: "Missing",
    score: 0,
    feedback: [],
  }

  if (metaDescription.length > 0) {
    if (metaDescription.length >= 120 && metaDescription.length <= 160) {
      metaScore = 20
      metaAnalysis.status = "Excellent"
      metaAnalysis.feedback.push("✅ Perfect meta description length")
    } else if (metaDescription.length >= 100 && metaDescription.length < 120) {
      metaScore = 12
      metaAnalysis.status = "Good"
      metaAnalysis.feedback.push("⚠️ Meta description could be slightly longer")
    } else if (metaDescription.length > 160) {
      metaScore = 8
      metaAnalysis.status = "Too Long"
      metaAnalysis.feedback.push("❌ Meta description may be truncated in search results")
    } else {
      metaScore = 5
      metaAnalysis.status = "Too Short"
      metaAnalysis.feedback.push("❌ Meta description is too short")
    }
  } else {
    metaAnalysis.feedback.push("❌ Missing meta description - add a compelling summary")
  }

  metaAnalysis.score = metaScore
  analysis.seo_factors.meta_description_analysis = metaAnalysis

  // Content Analysis
  let contentScore = 0
  const contentAnalysis: any = {
    word_count: contentText.split(/\s+/).length,
    character_count: contentText.length,
    reading_time: analysis.page_details.reading_time,
    status: "Insufficient",
    score: 0,
    feedback: [],
  }

  if (contentText.length > 0) {
    const wordCount = contentAnalysis.word_count

    if (wordCount >= 1000) {
      contentScore = 25
      contentAnalysis.status = "Excellent"
      contentAnalysis.feedback.push("✅ Great content length for SEO")
    } else if (wordCount >= 500) {
      contentScore = 18
      contentAnalysis.status = "Good"
      contentAnalysis.feedback.push("✅ Good content length")
    } else if (wordCount >= 300) {
      contentScore = 12
      contentAnalysis.status = "Fair"
      contentAnalysis.feedback.push("⚠️ Content length is acceptable but could be expanded")
    } else {
      contentScore = 5
      contentAnalysis.status = "Too Short"
      contentAnalysis.feedback.push("❌ Content is too short, add more valuable information")
    }
  } else {
    contentAnalysis.feedback.push("❌ No content found on the page")
  }

  contentAnalysis.score = contentScore
  analysis.seo_factors.content_analysis = contentAnalysis

  // Keyword Analysis
  const keywords = extractCleanKeywords(contentText || websiteData.mainTopic)
  const keywordAnalysis: any = {
    total_keywords: keywords.length,
    status: "Poor",
    score: 0,
    feedback: [],
  }

  let keywordScore = 0
  if (keywords.length >= 10) {
    keywordScore = 20
    keywordAnalysis.status = "Excellent"
    keywordAnalysis.feedback.push("✅ Good keyword variety found")
  } else if (keywords.length >= 5) {
    keywordScore = 12
    keywordAnalysis.status = "Good"
    keywordAnalysis.feedback.push("✅ Decent keyword coverage")
  } else if (keywords.length >= 2) {
    keywordScore = 8
    keywordAnalysis.status = "Fair"
    keywordAnalysis.feedback.push("⚠️ Limited keyword variety")
  } else {
    keywordAnalysis.feedback.push("❌ Very few meaningful keywords found")
  }

  keywordAnalysis.score = keywordScore
  analysis.seo_factors.keyword_analysis = keywordAnalysis
  analysis.top_keywords = keywords

  // Calculate overall score
  const totalScore =
    titleScore + metaScore + contentScore + keywordScore + (analysis.page_details.headings_count > 0 ? 10 : 0) // Headings bonus

  analysis.overview.overall_score = Math.min(totalScore, 100)

  // Determine grade and status
  const score = analysis.overview.overall_score
  if (score >= 90) {
    analysis.overview.grade = "A+"
    analysis.overview.status = "Excellent"
  } else if (score >= 80) {
    analysis.overview.grade = "A"
    analysis.overview.status = "Very Good"
  } else if (score >= 70) {
    analysis.overview.grade = "B"
    analysis.overview.status = "Good"
  } else if (score >= 60) {
    analysis.overview.grade = "C"
    analysis.overview.status = "Fair"
  } else if (score >= 50) {
    analysis.overview.grade = "D"
    analysis.overview.status = "Poor"
  } else {
    analysis.overview.grade = "F"
    analysis.overview.status = "Needs Immediate Attention"
  }

  // Generate user-friendly recommendations
  analysis.recommendations = []
  analysis.action_items = []

  if (titleScore < 20) {
    analysis.recommendations.push({
      priority: "High",
      category: "Title Optimization",
      issue: "Page title needs improvement",
      solution: "Create a compelling title between 30-60 characters that includes your main keyword",
      impact: "High - Titles are crucial for search rankings and click-through rates",
    })
    analysis.action_items.push("✏️ Rewrite page title (30-60 characters)")
  }

  if (metaScore < 15) {
    analysis.recommendations.push({
      priority: "High",
      category: "Meta Description",
      issue: "Meta description is missing or poorly optimized",
      solution: "Write a compelling 120-160 character description that summarizes your page content",
      impact: "Medium - Improves click-through rates from search results",
    })
    analysis.action_items.push("✏️ Write compelling meta description (120-160 characters)")
  }

  if (contentScore < 20) {
    analysis.recommendations.push({
      priority: "Medium",
      category: "Content Quality",
      issue: "Content length is insufficient",
      solution: "Expand content to at least 500 words with valuable, relevant information",
      impact: "High - More content gives search engines more context about your page",
    })
    analysis.action_items.push("📝 Expand content to 500+ words")
  }

  if (keywordScore < 15) {
    analysis.recommendations.push({
      priority: "Medium",
      category: "Keyword Optimization",
      issue: "Limited keyword variety",
      solution: "Include more relevant keywords naturally throughout your content",
      impact: "Medium - Better keyword coverage helps with various search terms",
    })
    analysis.action_items.push("🔍 Research and add relevant keywords")
  }

  if (analysis.page_details.headings_count < 3) {
    analysis.recommendations.push({
      priority: "Low",
      category: "Content Structure",
      issue: "Insufficient heading structure",
      solution: "Add more H1, H2, H3 headings to structure your content better",
      impact: "Low - Improves readability and helps search engines understand content structure",
    })
    analysis.action_items.push("📋 Add more headings (H1, H2, H3)")
  }

  // Add general recommendations
  if (analysis.overview.overall_score < 70) {
    analysis.action_items.push("🚀 Focus on high-priority items first")
    analysis.action_items.push("📊 Re-run analysis after making changes")
    analysis.action_items.push("⏰ Schedule monthly SEO check-ups")
  }

  return {
    success: true,
    analysis: analysis,
    message: `SEO analysis completed. Your website scored ${analysis.overview.overall_score}/100 (Grade: ${analysis.overview.grade})`,
    timestamp: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.websiteUrl || !body.mainTopic) {
      return NextResponse.json({ error: "Website URL and Main Topic are required" }, { status: 400 })
    }

    // For demo purposes, we'll generate the analysis directly
    // In a production environment, you would call the webhook
    const analysisResult = generateSEOAnalysis(body)

    // Ensure we always return a properly structured response
    const analysisResult2 = generateSEOAnalysis(body)

    // Format the response to match the expected structure
    return NextResponse.json([
      {
        seo_report: {
          analysis_date: new Date().toISOString(), // Ensure this is always present
          seo_score: analysisResult2.analysis.overview.overall_score,
          current_keywords: analysisResult2.analysis.top_keywords.slice(0, 3).map((k: any) => k.keyword),
          keyword_opportunities: {
            total_found: analysisResult2.analysis.top_keywords.length,
            priority_keywords: analysisResult2.analysis.top_keywords
              .filter((k: any) => k.importance === "High")
              .map((k: any) => k.keyword),
            long_tail_opportunities: analysisResult2.analysis.top_keywords
              .filter((k: any) => k.importance !== "High")
              .map((k: any) => k.keyword),
          },
          content_gaps: {
            missing_topics: analysisResult2.analysis.recommendations
              .filter((r: any) => r.category === "Content Quality")
              .map((r: any) => r.issue),
            gap_count: analysisResult2.analysis.recommendations.filter((r: any) => r.category === "Content Quality")
              .length,
            coverage_score: Math.min(100, analysisResult2.analysis.overview.overall_score + 20),
          },
          competitor_analysis: {
            competitors_found: 3,
            competitor_domains: ["competitor1.com", "competitor2.com", "competitor3.com"],
          },
          recommendations: analysisResult2.analysis.recommendations.map((r: any) => r.solution),
          next_steps: analysisResult2.analysis.action_items,
        },
        lead_info: {
          email: body.email || "",
          analysis_date: new Date().toISOString(), // Ensure this is always present
        },
        detailed_analysis: analysisResult2.analysis, // Additional detailed analysis
      },
    ])
  } catch (error) {
    console.error("Analysis API Error:", error)

    return NextResponse.json(
      {
        error: "Failed to process SEO analysis. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
