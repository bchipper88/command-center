import { NextResponse } from 'next/server';

// Quick links for John's empire
export async function GET() {
  const links = {
    business: [
      { name: 'Shopify Admin', url: 'https://admin.shopify.com/store/jurassicapparel', icon: '🛒', shortcut: 'S' },
      { name: 'Shopify Orders', url: 'https://admin.shopify.com/store/jurassicapparel/orders', icon: '📦', shortcut: 'O' },
      { name: 'Printful Dashboard', url: 'https://www.printful.com/dashboard/store/jurassic-apparel', icon: '👕', shortcut: 'P' },
      { name: 'Klaviyo', url: 'https://www.klaviyo.com/dashboard', icon: '📧', shortcut: 'K' },
      { name: 'Instagram', url: 'https://www.instagram.com/jurassicapparel', icon: '📸', shortcut: 'I' },
    ],
    development: [
      { name: 'GitHub', url: 'https://github.com/BCHIPPER88', icon: '💻', shortcut: 'G' },
      { name: 'Vercel', url: 'https://vercel.com/johns-projects-29f4f477', icon: '▲', shortcut: 'V' },
      { name: 'Supabase', url: 'https://supabase.com/dashboard/project/armreshdoknjkqhikjma', icon: '⚡', shortcut: 'D' },
    ],
    tools: [
      { name: 'Gmail', url: 'https://mail.google.com', icon: '✉️', shortcut: 'M' },
      { name: 'Google Calendar', url: 'https://calendar.google.com', icon: '📅', shortcut: 'C' },
      { name: 'Google Drive', url: 'https://drive.google.com', icon: '📁', shortcut: 'R' },
    ],
    actions: [
      { name: 'Create Newsletter', action: 'klaviyo-campaign', icon: '📨' },
      { name: 'Post to Instagram', action: 'instagram-post', icon: '📷' },
      { name: 'Check Inventory', action: 'check-inventory', icon: '📊' },
      { name: 'Message Bellatrix', action: 'chat-bellatrix', icon: '🖤' },
    ],
  };

  return NextResponse.json(links);
}
