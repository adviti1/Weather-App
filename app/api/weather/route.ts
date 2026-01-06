import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { location } = await request.json()
  
  try {
    // Your API call with OPENAI_API_KEY (server-side only)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Generate weather advice for ${location}`
        }]
      })
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
