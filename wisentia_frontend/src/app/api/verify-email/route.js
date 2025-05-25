import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { token } = data;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // API URL'ini oluştur
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/users/verify-email/`;

    // Backend API'ye istek at
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error || 'Email verification failed' },
        { status: response.status }
      );
    }

    // Başarılı yanıt dön
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}