import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { token, newPassword } = data;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Şifre uzunluk kontrolü
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // API istek URL'ini oluştur
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/users/reset-password/`;

    // Backend API'ye istek at
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
      cache: 'no-store',
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error || 'Failed to reset password' },
        { status: response.status }
      );
    }

    // Başarılı yanıt dön
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}