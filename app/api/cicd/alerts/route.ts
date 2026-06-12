import { NextRequest, NextResponse } from 'next/server';
import { setAlertConfig } from '@/services/github/webhook-handler';

export const runtime = 'nodejs';

interface AlertConfigRequest {
  repository: string;
  enabled: boolean;
  onFailure: boolean;
  onSuccess: boolean;
  webhookUrl?: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AlertConfigRequest = await request.json();

    if (!body.repository) {
      return NextResponse.json(
        { error: 'Repository is required' },
        { status: 400 }
      );
    }

    setAlertConfig(body.repository, {
      enabled: body.enabled ?? true,
      onFailure: body.onFailure ?? true,
      onSuccess: body.onSuccess ?? false,
      webhookUrl: body.webhookUrl,
      email: body.email,
    });

    return NextResponse.json({
      success: true,
      message: `Alert configuration saved for ${body.repository}`,
      config: {
        repository: body.repository,
        enabled: body.enabled ?? true,
        onFailure: body.onFailure ?? true,
        onSuccess: body.onSuccess ?? false,
      },
    });
  } catch (error) {
    console.error('Alert configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert configuration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Alert configuration endpoint',
    usage: {
      method: 'POST',
      body: {
        repository: 'owner/repo',
        enabled: true,
        onFailure: true,
        onSuccess: false,
        webhookUrl: 'optional-webhook-url',
        email: 'optional-email@example.com',
      },
    },
  });
}
