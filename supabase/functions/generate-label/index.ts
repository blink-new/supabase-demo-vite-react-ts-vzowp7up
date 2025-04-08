
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  task: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { task } = await req.json() as RequestBody

    if (!task) {
      return new Response(
        JSON.stringify({ error: 'Task text is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are a task labeling assistant. Generate a single word label that best categorizes the task. Only output the label word, nothing else. For example: "Buy groceries" -> "Shopping", "Fix bug in login" -> "Development"'
        }, {
          role: 'user',
          content: task
        }],
        temperature: 0.3,
        max_tokens: 10
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate label')
    }

    const data = await response.json()
    const label = data.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ label }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})