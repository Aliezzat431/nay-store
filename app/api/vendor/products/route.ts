import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'
import { getVendorId } from '@/lib/vendor'

const ProductSchema = z.object({
  name:        z.string().min(1).max(200),
  price:       z.number().positive().max(100_000),
  emoji:       z.string().min(1).max(8),
  description: z.string().max(5000).optional(),
  is_active:   z.boolean().optional(),
  image_url:   z.string().url().max(2000).nullable().optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const vendorId = await getVendorId(supabase, userId)
  if (!vendorId) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = ProductSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const supabase = createServiceClient()
  const vendorId = await getVendorId(supabase, userId)
  if (!vendorId) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { name, price, emoji, description, is_active, image_url } = parsed.data

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      price,
      emoji,
      description:  description ?? null,
      is_active:    is_active ?? true,
      image_url:    image_url ?? null,
      vendor_id:    vendorId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
