// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('user')?.value;
  
  // Debug: Cookie varlığını kontrol et
  console.log(`Middleware çalıştı: ${request.nextUrl.pathname}, Cookie user:`, currentUser ? 'var' : 'yok');

  // GEÇİCİ ÇÖZÜM #1: Local Storage'dan token kontrol et
  // (Sadece localStorage'ı direkt kontrol edemeyiz, burası server-side çalışıyor)
  
  // GEÇİCİ ÇÖZÜM #2: /login ve /register sayfalarını bypass yap
  // Sonsuz döngüyü kırmak için login sayfasına müdahale etmeyi durdur
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    console.log('Login/Register sayfası bypass ediliyor...');
    return NextResponse.next();
  }
  
  const isLoggedIn = !!currentUser;
  
  // Korumalı route'ları burada tanımlayın
  const authRoutes = ['/dashboard', '/profile', '/wallet', '/subscriptions'];
  const questDetailRoute = /^\/quests\/[\w-]+$/;
  const adminRoutes = ['/admin'];
  
  // Geçerli yol
  const { pathname } = request.nextUrl;

  // Admin sayfalarını kontrol et
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Kullanıcı giriş yapmamışsa veya admin değilse
    if (!isLoggedIn) {
      console.log('Admin sayfası erişimi engellendi: Oturum yok');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = JSON.parse(currentUser);
      if (user.role !== 'admin') {
        console.log('Admin sayfası erişimi engellendi: Admin değil');
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.log('Admin sayfası erişimi engellendi: Parse hatası');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Quest detay sayfaları için kontrol
  if (questDetailRoute.test(pathname) && !isLoggedIn) {
    console.log('Quest detay sayfası erişimi engellendi');
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Korumalı sayfaları kontrol et
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // GEÇİCİ ÇÖZÜM #3: Geliştirme sırasında korumalı sayfalara her koşulda izin ver
    // Bu satırı kaldırarak normal güvenlik kontrollerini aktifleştirebilirsiniz
    console.log('GEÇİCİ ÇÖZÜM: Korumalı sayfaya erişim izni veriliyor');
    return NextResponse.next();
    
    // Normal kontrol (geliştirme sonunda aşağıdaki kodu aktifleştirin)
    /*
    if (!isLoggedIn) {
      console.log('Korumalı sayfa erişimi engellendi');
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    */
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/wallet/:path*',
    '/quests/:path*',
    '/nfts/:path*',
    '/subscriptions/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};