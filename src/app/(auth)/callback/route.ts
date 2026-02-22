import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Determine redirect based on role
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role

      if (role === "hr") {
        return NextResponse.redirect(`${origin}/hr/dashboard`)
      }
      return NextResponse.redirect(`${origin}/employee/dashboard`)
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
