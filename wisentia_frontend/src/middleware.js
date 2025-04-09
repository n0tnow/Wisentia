// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const currentUser = request.cookies.get('user')?.value;
  const isLoggedIn = !!currentUser;

  // Korumalı route'ları burada tanımlayın
  // NOT: '/quests' ana sayfası çıkarıldı, böylece giriş yapmadan görüntülenebilir
  const authRoutes = ['/dashboard', '/profile', '/wallet', '/subscriptions'];
  
  // ÖNEMLİ: Belirli quest detayları için auth kontrolü yapmak istiyorsak:
  const questDetailRoute = /^\/quests\/[\w-]+$/; // örn. /quests/123 veya /quests/blockchain-expert
  
  const adminRoutes = ['/admin'];
  
  // Geçerli yol
  const { pathname } = request.nextUrl;

  // Admin sayfalarını kontrol et
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Kullanıcı giriş yapmamışsa veya admin değilse
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = JSON.parse(currentUser);
      if (user.role !== 'admin') {
        // Admin olmayan kullanıcıları ana sayfaya yönlendir
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Çerez parse hatası - kullanıcıyı login sayfasına yönlendir
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Quest detay sayfaları için kontrol (örn. /quests/123)
  if (questDetailRoute.test(pathname) && !isLoggedIn) {
    // Kullanıcı giriş yapmamışsa, login sayfasına yönlendir ve dönüş URL'ini parametre olarak ekle
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Korumalı sayfaları kontrol et
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      // Kullanıcı giriş yapmamışsa, login sayfasına yönlendir ve dönüş URL'ini parametre olarak ekle
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Kullanıcı girişi yapmışsa login ve register sayfalarına erişimi engelle
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/wallet/:path*',
     // Tüm quest rotaları için middleware çalışır, ancak içeride yalnızca detaylar için kontrol yapılır
    '/nfts/:path*',
    '/subscriptions/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};