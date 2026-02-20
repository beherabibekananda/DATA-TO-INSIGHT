
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return new Response(
                JSON.stringify({ error: 'Email and OTP are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`Sending OTP ${otp} to ${email}`)

        // If RESEND_API_KEY is not set, we'll log it but return success for testing
        // In production, you MUST set this secret in Supabase
        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY not set. Please add it to your Supabase project secrets.')
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'OTP generated and logged (Email not sent because RESEND_API_KEY is missing)',
                    warning: 'API_KEY_MISSING'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Admin Dashboard <onboarding@resend.dev>',
                to: [email],
                subject: 'Your Admin Access OTP',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #1e293b; margin: 0; font-size: 24px;">Admin Access Verification</h1>
              <p style="color: #64748b; margin-top: 8px;">Secure login for Data To Insight Project</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 32px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px;">Your one-time password is:</p>
              <h2 style="margin: 0; color: #2563eb; font-size: 48px; letter-spacing: 8px; font-weight: bold;">${otp}</h2>
              <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
            
            <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
              <p>If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
              <p>&copy; 2024 Data To Insight Project. All rights reserved.</p>
            </div>
          </div>
        `,
            }),
        })

        const data = await res.json()

        if (res.ok) {
            return new Response(
                JSON.stringify({ success: true, data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        } else {
            console.error('Resend API error:', data)
            return new Response(
                JSON.stringify({ success: false, error: data }),
                { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
    } catch (error) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
