import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'
import { getVendorId } from '@/lib/vendor'

const PatchSchema = z.object({
  name:        z.string().min(1).max(200).optional(),
  price:       z.number().positive().max(100_000).optional(),
  emoji:       z.string().min(1).max(8).optional(),
  description: z.string().max(5000).optional(),
  is_active:   z.boolean().optional(),
  image_url:   z.string().url().max(2000).nullable().optional(),
})

type PatchFields = z.infer<typeof PatchSchema>

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = PatchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const { id } = await params
  const supabase = createServiceClient()
  const vendorId = await getVendorId(supabase, userId)
  if (!vendorId) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Verify ownership before updating
  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
  }

  // Build update from only the fields present in the validated payload
  const updates = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined),
  ) as Partial<PatchFields>

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()
  const vendorId = await getVendorId(supabase, userId)
  if (!vendorId) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('vendor_id', vendorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new Response(null, { status: 204 })
}
