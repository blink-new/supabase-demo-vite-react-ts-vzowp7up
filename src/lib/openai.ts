
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateTaskLabel(taskDescription: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are a task labeling assistant. Generate a single word label that best categorizes the task. Only output the label word, nothing else. For example: "Buy groceries" -> "Shopping", "Fix bug in login" -> "Development"'
        }, {
          role: 'user',
          content: taskDescription
        }],
        temperature: 0.3,
        max_tokens: 10
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate label');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating label:', error);
    return 'Task'; // fallback label
  }
}