import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'chrome-extension://',  // Any Chrome extension
    'http://localhost:3000',
    'https://recruiterinyourpocket.com',
    'https://www.recruiterinyourpocket.com',
];

function getCorsHeaders(req: NextRequest) {
    const origin = req.headers.get('origin') || '';

    // Check if origin is allowed (Chrome extensions have special handling)
    const isAllowed = ALLOWED_ORIGINS.some(allowed =>
        origin.startsWith(allowed) || allowed.startsWith('chrome-extension://')
    );

    // For Chrome extensions, we need to echo back their exact origin
    const allowedOrigin = isAllowed ? origin : '';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

/**
 * GET /api/extension/auth-status
 * 
 * Checks if the user is authenticated. Used by extension to show login prompt.
 */
export async function GET(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({
                success: true,
                authenticated: false,
                user: null,
            }, { headers: corsHeaders });
        }

        return NextResponse.json({
            success: true,
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.user_metadata?.first_name || null,
            },
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('[Extension] Auth status error:', error);
        return NextResponse.json(
            { success: false, authenticated: false, user: null },
            { status: 500, headers: corsHeaders }
        );
    }
}
