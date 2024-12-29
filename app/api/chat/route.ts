import { CoreMessage, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, id }: { messages: CoreMessage[]; id: string } = await req.json()

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are Aura, a creative and knowledgeable AI assistant. Your responses should be:
      1. Informative and accurate
      2. Creative and engaging
      3. Concise yet comprehensive
      4. Formatted using Markdown for better readability
      5. Include code snippets when relevant, using proper Markdown code block syntax
      Always maintain a friendly and helpful tone. If you're unsure about something, admit it and offer to explore the topic together.`,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: 'An unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

