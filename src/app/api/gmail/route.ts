import { NextResponse } from 'next/server';

const GMAIL_TOKENS = {
  access_token: process.env.GMAIL_ACCESS_TOKEN || '',
  refresh_token: process.env.GMAIL_REFRESH_TOKEN || '',
  client_id: process.env.GMAIL_CLIENT_ID || '',
  client_secret: process.env.GMAIL_CLIENT_SECRET || '',
  token_uri: 'https://oauth2.googleapis.com/token',
};

async function refreshAccessToken() {
  const res = await fetch(GMAIL_TOKENS.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_TOKENS.client_id,
      client_secret: GMAIL_TOKENS.client_secret,
      refresh_token: GMAIL_TOKENS.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!res.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await res.json();
  return data.access_token;
}

async function fetchGmail(accessToken: string) {
  // Get unread count
  const unreadRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread+is:inbox&maxResults=1',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  if (!unreadRes.ok) {
    if (unreadRes.status === 401) {
      throw new Error('REFRESH_NEEDED');
    }
    throw new Error(`Gmail API error: ${unreadRes.status}`);
  }
  
  const unreadData = await unreadRes.json();
  const unreadCount = unreadData.resultSizeEstimate || 0;
  
  // Get recent important/starred emails
  const importantRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:important+is:unread&maxResults=5',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  const importantData = await importantRes.json();
  const importantEmails: Array<{ id: string; subject: string; from: string; snippet: string }> = [];
  
  if (importantData.messages) {
    for (const msg of importantData.messages.slice(0, 3)) {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (detailRes.ok) {
        const detail = await detailRes.json();
        const headers = detail.payload?.headers || [];
        const subject = headers.find((h: { name: string }) => h.name === 'Subject')?.value || '(no subject)';
        const from = headers.find((h: { name: string }) => h.name === 'From')?.value || 'Unknown';
        
        importantEmails.push({
          id: msg.id,
          subject,
          from: from.split('<')[0].trim(),
          snippet: detail.snippet?.slice(0, 100) || '',
        });
      }
    }
  }
  
  return { unreadCount, importantEmails };
}

export async function GET() {
  try {
    if (!GMAIL_TOKENS.refresh_token) {
      return NextResponse.json({ 
        unreadCount: 0, 
        importantEmails: [],
        error: 'Gmail not configured' 
      });
    }
    
    // Try with current token first, refresh if needed
    let accessToken = GMAIL_TOKENS.access_token;
    
    try {
      const data = await fetchGmail(accessToken);
      return NextResponse.json(data);
    } catch (err) {
      if (err instanceof Error && err.message === 'REFRESH_NEEDED') {
        accessToken = await refreshAccessToken();
        const data = await fetchGmail(accessToken);
        return NextResponse.json(data);
      }
      throw err;
    }
  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json({ 
      unreadCount: 0, 
      importantEmails: [],
      error: 'Failed to fetch Gmail' 
    });
  }
}
