import { type NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "https://n8n.srv832341.hstgr.cloud/webhook-test/seo-analyze"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.websiteUrl || !body.mainTopic) {
      return NextResponse.json({ error: "Website URL and Main Topic are required" }, { status: 400 })
    }

    // Call the actual webhook instead of generating mock data
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with status: ${webhookResponse.status} ${webhookResponse.statusText}`)
    }

    let webhookData
    try {
      webhookData = await webhookResponse.json()
    } catch (error) {
      console.error("Failed to parse webhook response:", error)
      throw new Error("Invalid response from webhook service")
    }

    // Ensure the response has the expected structure
    // If the webhook doesn't return data in the expected format, transform it
    const currentDate = new Date().toISOString()

    // Format the response to match the expected structure (version 8 template)
    const formattedResponse = {
      version: 8,
      timestamp: currentDate,
      request_info: {
        website_url: body.websiteUrl,
        main_topic: body.mainTopic,
        email: body.email || null,
      },
      seo_report: {
        analysis_date: webhookData?.analysis_date || currentDate,
        seo_score: webhookData?.seo_score || webhookData?.score || 0,
        current_keywords: webhookData?.current_keywords || webhookData?.keywords || [],
        keyword_opportunities: {
          total_found: webhookData?.keyword_opportunities?.total_found || webhookData?.total_keywords || 0,
          priority_keywords:
            webhookData?.keyword_opportunities?.priority_keywords || webhookData?.priority_keywords || [],
          long_tail_opportunities:
            webhookData?.keyword_opportunities?.long_tail_opportunities || webhookData?.long_tail_keywords || [],
        },
        content_gaps: {
          missing_topics: webhookData?.content_gaps?.missing_topics || webhookData?.missing_topics || [],
          gap_count: webhookData?.content_gaps?.gap_count || webhookData?.gap_count || 0,
          coverage_score: webhookData?.content_gaps?.coverage_score || webhookData?.coverage || 0,
        },
        competitor_analysis: {
          competitors_found: webhookData?.competitor_analysis?.competitors_found || webhookData?.competitors_count || 0,
          competitor_domains: webhookData?.competitor_analysis?.competitor_domains || webhookData?.competitors || [],
        },
        recommendations: webhookData?.recommendations || webhookData?.suggested_improvements || [],
        next_steps: webhookData?.next_steps || webhookData?.action_items || [],
      },
      lead_info: {
        email: body.email || "",
        analysis_date: currentDate,
      },
      detailed_analysis: webhookData?.detailed_analysis || null,
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error("Analysis API Error:", error)

    return NextResponse.json(
      {
        error: "Failed to process SEO analysis. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
