import { type NextRequest, NextResponse } from "next/server"

const WEBHOOK_URL = "https://n8n.srv832341.hstgr.cloud/webhook-test/seo-analyze"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.websiteUrl || !body.mainTopic) {
      return NextResponse.json({ error: "Website URL and Main Topic are required" }, { status: 400 })
    }

    console.log("Sending to webhook:", { websiteUrl: body.websiteUrl, mainTopic: body.mainTopic })

    // Call the n8n webhook
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        websiteUrl: body.websiteUrl,
        mainTopic: body.mainTopic,
        email: body.email || "",
      }),
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with status: ${webhookResponse.status} ${webhookResponse.statusText}`)
    }

    // Parse the webhook response - n8n returns an array with a single object
    const webhookData = await webhookResponse.json()
    console.log("Webhook response received:", JSON.stringify(webhookData).slice(0, 200) + "...")

    // Return the first item from the array if it's an array, otherwise return the data as is
    const responseData = Array.isArray(webhookData) ? webhookData[0] : webhookData

    return NextResponse.json(responseData)
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
