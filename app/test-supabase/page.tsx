'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/use-supabase'

type Profile = {
    id: string
    user_id: string
    created_at: string
}

export default function TestSupabasePage() {
    const { user, isLoaded } = useUser()
    const supabase = useSupabase()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [status, setStatus] = useState<string>('idle')

    useEffect(() => {
        if (!isLoaded || !user) return

        async function syncProfile() {
            setStatus('syncing...')

            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({ user_id: user!.id }, { onConflict: 'user_id' })

            if (upsertError) {
                setStatus(`insert error: ${upsertError.message}`)
                return
            }

            const { data, error: selectError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user!.id)
                .single()

            if (selectError) {
                setStatus(`select error: ${selectError.message}`)
                return
            }

            setProfile(data)
            setStatus('success')
        }

        syncProfile()
    }, [isLoaded, user, supabase])

    if (!isLoaded) return <p className="p-8">Loading...</p>

    if (!user) {
        return (
            <div className="p-8">
                <p className="text-red-500">Not logged in. <a href="/sign-in" className="underline">Sign in first</a>.</p>
            </div>
        )
    }

    return (
        <div className="p-8 font-mono space-y-4">
            <h1 className="text-xl font-bold">Clerk + Supabase Test</h1>

            <div className="space-y-1">
                <p><span className="text-zinc-500">Clerk user ID:</span> {user.id}</p>
                <p><span className="text-zinc-500">Email:</span> {user.primaryEmailAddress?.emailAddress}</p>
            </div>

            <div className="border-t pt-4">
                <p><span className="text-zinc-500">Status:</span> <span className={status === 'success' ? 'text-green-600' : 'text-yellow-600'}>{status}</span></p>
            </div>

            {profile && (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-4 space-y-1">
                    <p className="font-bold text-green-600">Profile found in Supabase</p>
                    <p><span className="text-zinc-500">id:</span> {profile.id}</p>
                    <p><span className="text-zinc-500">user_id:</span> {profile.user_id}</p>
                    <p><span className="text-zinc-500">created_at:</span> {profile.created_at}</p>
                </div>
            )}
        </div>
    )
}
