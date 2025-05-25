// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Login/Register sayfalarını her zaman bypass et
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    console.log(`Auth sayfası erişimi: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }

  const currentUser = request.cookies.get('user')?.value;
  console.log(`Middleware çalıştı: ${request.nextUrl.pathname}, Cookie user:`, currentUser ? 'var' : 'yok');
  
  // Kullanıcı durumunu kontrol et
  let isLoggedIn = false;
  let userRole = 'regular';
  let userId = null;
  
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      userId = userData.id;
      isLoggedIn = !!userId; // ID varsa giriş yapmış kabul et
      userRole = userData.role || 'regular';
      console.log(`Kullanıcı bilgisi: ID=${userId}, Rol=${userRole}, GirişYapılmış=${isLoggedIn}`);
    } catch (e) {
      console.error('Cookie parse hatası:', e.message);
      isLoggedIn = false;
    }
  }
  
  // Korumalı rotaları tanımla
  const authRoutes = ['/dashboard', '/profile', '/wallet', '/subscriptions'];
  const questDetailRoute = /^\/quests\/[\w-]+$/;
  const adminRoutes = ['/admin'];
  
  // Geçerli yol
  const pathname = request.nextUrl.pathname;

  // Admin sayfalarını kontrol et
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      console.log('Admin sayfası erişimi engellendi: Oturum yok');
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    if (userRole !== 'admin') {
      console.log('Admin sayfası erişimi engellendi: Admin değil');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    console.log('Admin sayfası erişimi izni verildi');
  }

  // Quest detay sayfaları için kontrol
  if (questDetailRoute.test(pathname) && !isLoggedIn) {
    console.log('Quest detay sayfası erişimi engellendi');
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
  }

  // Korumalı sayfaları kontrol et
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      console.log('Korumalı sayfa erişimi engellendi');
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
    
    console.log('Korumalı sayfaya erişim izni verildi');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|nft-placeholder.png).*)',
  ],
};