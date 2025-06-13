import { type NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "https://n8n.srv832341.hstgr.cloud/webhook-test/seo-analyze"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.websiteUrl || !body.mainTopic) {
      return NextResponse.json({ error: "Website URL and Main Topic are required" }, { status: 400 })
    }

    // Forward the request to the webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        websiteUrl: body.websiteUrl,
        mainTopic: body.mainTopic,
        email: body.email || null,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // If no real data is returned, use mock data for testing
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json([
        {
          seo_report: {
            analysis_date: new Date().toISOString(),
            seo_score: 65,
            current_keywords: ["marketing", "digital", "strategy"],
            keyword_opportunities: {
              total_found: 12,
              priority_keywords: ["digital marketing strategy", "content marketing", "SEO basics"],
              long_tail_opportunities: ["how to create digital marketing plan", "best content marketing examples 2025"],
            },
            content_gaps: {
              missing_topics: ["Email marketing automation", "Social media analytics", "Mobile marketing strategies"],
              gap_count: 3,
              coverage_score: 75,
            },
            competitor_analysis: {
              competitors_found: 3,
              competitor_domains: ["competitor1.com", "competitor2.com", "competitor3.com"],
            },
            recommendations: [
              "Improve basic SEO elements (title, meta description, headings)",
              "Expand content to target more relevant keywords",
              "Create content clusters around main topic",
              "Implement technical SEO improvements",
            ],
            next_steps: [
              "Create content for priority keywords",
              "Optimize existing pages for target keywords",
              "Build topic clusters and internal linking",
              "Monitor competitor content strategies",
              "Schedule monthly SEO audits",
            ],
          },
          lead_info: {
            email: body.email || "",
            analysis_date: new Date().toISOString(),
          },
        },
      ])
    }

    return NextResponse.json(data)
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
