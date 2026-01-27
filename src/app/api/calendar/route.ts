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

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  isAllDay: boolean;
  location?: string;
}

async function fetchCalendar(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${now.toISOString()}&` +
    `timeMax=${endOfWeek.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime&` +
    `maxResults=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('REFRESH_NEEDED');
    }
    throw new Error(`Calendar API error: ${res.status}`);
  }
  
  const data = await res.json();
  
  return (data.items || []).map((event: { 
    id: string; 
    summary?: string; 
    start?: { dateTime?: string; date?: string }; 
    end?: { dateTime?: string; date?: string };
    location?: string;
  }) => ({
    id: event.id,
    summary: event.summary || '(No title)',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    isAllDay: !event.start?.dateTime,
    location: event.location,
  }));
}

export async function GET() {
  try {
    if (!GMAIL_TOKENS.refresh_token) {
      return NextResponse.json({ 
        events: [],
        error: 'Calendar not configured' 
      });
    }
    
    let accessToken = GMAIL_TOKENS.access_token;
    
    try {
      const events = await fetchCalendar(accessToken);
      return NextResponse.json({ events });
    } catch (err) {
      if (err instanceof Error && err.message === 'REFRESH_NEEDED') {
        accessToken = await refreshAccessToken();
        const events = await fetchCalendar(accessToken);
        return NextResponse.json({ events });
      }
      throw err;
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ 
      events: [],
      error: 'Failed to fetch calendar' 
    });
  }
}
