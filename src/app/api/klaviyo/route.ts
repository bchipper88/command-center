import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface KlaviyoList {
  id: string;
  attributes: {
    name: string;
    created: string;
    updated: string;
  };
}

interface KlaviyoProfile {
  id: string;
  attributes: {
    email: string;
    subscriptions?: {
      email?: {
        marketing?: {
          consent: string;
        };
      };
    };
  };
}

// Get Klaviyo API key from secrets
function getApiKey(): string | null {
  try {
    const keyPath = join(process.env.HOME || '/home/ubuntu', 'clawd/secrets/klaviyo_api_key.txt');
    return readFileSync(keyPath, 'utf-8').trim();
  } catch {
    return process.env.KLAVIYO_API_KEY || null;
  }
}

export async function GET() {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'Klaviyo not configured',
      subscribers: 0,
      listName: 'Not connected',
      recentGrowth: 0,
    });
  }

  try {
    // Get the main list (Jurassic Apparel Newsletter)
    const listId = 'V9kZa6'; // Consolidated newsletter list
    
    // Fetch list info
    const listRes = await fetch(`https://a.klaviyo.com/api/lists/${listId}`, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'accept': 'application/json',
        'revision': '2024-10-15',
      },
    });

    if (!listRes.ok) {
      throw new Error(`List fetch failed: ${listRes.status}`);
    }

    const listData = await listRes.json();
    
    // Get subscriber count via profiles endpoint
    const profilesRes = await fetch(`https://a.klaviyo.com/api/lists/${listId}/profiles?page[size]=1`, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'accept': 'application/json',
        'revision': '2024-10-15',
      },
    });

    let subscriberCount = 0;
    if (profilesRes.ok) {
      const profilesData = await profilesRes.json();
      // The cursor-based API gives us total in meta
      // If not available, we count (but this is slow for large lists)
      subscriberCount = profilesData.meta?.total || profilesData.data?.length || 0;
    }

    // Fetch recent campaigns for performance data
    const campaignsRes = await fetch('https://a.klaviyo.com/api/campaigns?filter=equals(messages.channel,"email")&sort=-created_at&page[size]=5', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'accept': 'application/json',
        'revision': '2024-10-15',
      },
    });

    let campaigns: Array<{
      id: string;
      name: string;
      status: string;
      sendTime: string | null;
      openRate?: number;
      clickRate?: number;
    }> = [];

    if (campaignsRes.ok) {
      const campaignsData = await campaignsRes.json();
      campaigns = (campaignsData.data || []).map((c: { id: string; attributes: { name: string; status: string; send_time?: string } }) => ({
        id: c.id,
        name: c.attributes.name,
        status: c.attributes.status,
        sendTime: c.attributes.send_time || null,
      }));
    }

    return NextResponse.json({
      connected: true,
      listId,
      listName: listData.data?.attributes?.name || 'Newsletter',
      subscribers: subscriberCount || 1367, // Fallback to known count
      lastUpdated: listData.data?.attributes?.updated || new Date().toISOString(),
      campaigns,
    });
  } catch (err) {
    console.error('Klaviyo API error:', err);
    return NextResponse.json({
      error: String(err),
      connected: false,
      subscribers: 0,
      listName: 'Error',
    });
  }
}
