import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // API istek URL'ini oluştur
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/users/request-password-reset/`;

    // Backend API'ye istek at
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const responseData = await response.json();

    if (!response.ok) {
      // API hata döndürdü, ancak biz güvenlik nedeniyle hep başarılı cevap veriyoruz
      return NextResponse.json(
        { message: 'If your account exists, you will receive a password reset email' },
        { status: 200 }
      );
    }

    // Başarılı yanıt dön
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    // Hata olsa da güvenlik için başarılı yanıt dön
    return NextResponse.json(
      { message: 'If your account exists, you will receive a password reset email' },
      { status: 200 }
    );
  }
}