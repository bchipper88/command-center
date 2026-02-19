import { NextResponse } from 'next/server'
import fs from 'fs'

export async function GET() {
  try {
    const filePath = '/home/ubuntu/clawd/data/christmas_page_grades.json'
    const data = fs.readFileSync(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Error reading grades:', error)
    return NextResponse.json([])
  }
}
