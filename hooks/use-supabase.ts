'use client'

import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'
import { createClerkSupabaseClient } from '@/lib/supabase'

export function useSupabase() {
    const { getToken } = useAuth()
    return useMemo(() => createClerkSupabaseClient(getToken), [getToken])
}
