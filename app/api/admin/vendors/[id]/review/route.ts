import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'

async function requireAdmin(userId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  return data?.role === 'admin'
}

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_info']),
  notes: z.string().max(2000).optional(),
})

const statusMap: Record<string, string> = {
  approve:      'approved',
  reject:       'rejected',
  request_info: 'info_requested',
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await requireAdmin(userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = ReviewSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const { action, notes } = parsed.data
  const { id } = await params

  const updates: Record<string, string | number | null> = {
    status:      statusMap[action],
    admin_notes: notes ?? null,
    reviewed_at: new Date().toISOString(),
  }
  if (action === 'approve') updates.trust_score = 50

  const supabase = createServiceClient()
  const { error } = await supabase.from('vendors').update(updates).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, status: statusMap[action] })
}
