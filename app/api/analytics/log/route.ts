import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspace_id, event_type, event_category, metadata } = await request.json();

    // Validate required fields
    if (!workspace_id || !event_type || !event_category) {
      return NextResponse.json(
        { error: 'workspace_id, event_type, and event_category are required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Insert the event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        workspace_id,
        event_type,
        event_category,
        metadata: metadata || {},
        user_id: user.id,
      });

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json(
        { error: 'Failed to log event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log event' },
      { status: 500 }
    );
  }
}
