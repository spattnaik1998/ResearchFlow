import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { workspace_id, event_type, event_category, metadata } = await request.json();

    // Validate required fields
    if (!workspace_id || !event_type || !event_category) {
      return NextResponse.json(
        { error: 'workspace_id, event_type, and event_category are required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Analytics not configured' },
        { status: 500 }
      );
    }

    // Insert the event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        workspace_id,
        event_type,
        event_category,
        metadata: metadata || {},
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
