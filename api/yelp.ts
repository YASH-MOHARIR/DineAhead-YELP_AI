// api/yelp.ts - Vercel serverless function to proxy Yelp AI API
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variable
  const apiKey = process.env.VITE_YELP_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('❌ Yelp API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { query, location, chat_id, user_context } = req.body;

    console.log('📤 Proxying request to Yelp AI API:', { query, location, chat_id });

    const body: Record<string, any> = { query, location };
    if (chat_id) body.chat_id = chat_id;
    if (user_context) body.user_context = user_context;

    const response = await fetch('https://api.yelp.com/ai/chat/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Yelp API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Yelp API success, returning data');
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}