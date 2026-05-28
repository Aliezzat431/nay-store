import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (error || !data) return NextResponse.json({}, { status: 200 })
  return NextResponse.json(data)
}
