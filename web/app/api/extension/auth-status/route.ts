import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { buildExtensionCorsHeaders } from '@/lib/extension/cors';
import { isLaunchFlagEnabled } from '@/lib/launch/flags';

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: buildExtensionCorsHeaders(req, ['GET', 'OPTIONS']) });
}

/**
 * GET /api/extension/auth-status
 * 
 * Checks if the user is authenticated. Used by extension to show login prompt.
 */
export async function GET(req: NextRequest) {
    const corsHeaders = buildExtensionCorsHeaders(req, ['GET', 'OPTIONS']);

    if (!isLaunchFlagEnabled('extensionSync')) {
        return NextResponse.json(
            { success: false, errorCode: 'FEATURE_DISABLED', authenticated: false, user: null },
            { status: 503, headers: corsHeaders }
        );
    }

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
            { success: false, errorCode: 'INTERNAL_ERROR', authenticated: false, user: null },
            { status: 500, headers: corsHeaders }
        );
    }
}
