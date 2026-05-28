import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { rateLimit, getIp } from '@/lib/rate-limit'

// Map from real MIME (detected via magic bytes) to storage extension.
// GIF is excluded — GIF89a polyglots can embed JavaScript.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
}

// Detect MIME from the first 12 bytes of the file buffer (magic numbers).
function detectMime(buf: Uint8Array): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp'
  return null
}

export async function POST(req: Request) {
  const { success } = rateLimit(getIp(req), 20, 60_000) // 20 uploads per minute per IP
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 5 MB' }, { status: 400 })
  }

  // Read the actual file bytes and detect MIME from magic numbers —
  // never trust the client-supplied Content-Type or filename extension.
  const buffer = new Uint8Array(await file.arrayBuffer())
  const detectedMime = detectMime(buffer)

  if (!detectedMime || !(detectedMime in ALLOWED)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, and WebP images are allowed' },
      { status: 400 },
    )
  }

  // Extension comes from the server-side MIME map, never from the filename.
  const ext      = ALLOWED[detectedMime]
  const filename = `${userId}/${Date.now()}.${ext}`

  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, buffer, { contentType: detectedMime, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
