// src/app/api/admin/subscriptions/route.js
import { NextResponse } from 'next/server';

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Admin yetkisini kontrol eden yardımcı fonksiyon
async function checkAdminPermission(request) {
  try {
    const token = request.cookies.get('access_token')?.value || '';
    if (!token) {
      return { isAdmin: false, error: 'Authentication required' };
    }
    
    const userStr = request.cookies.get('user')?.value || '';
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.role !== 'admin') {
          return { isAdmin: false, error: 'Admin permission required' };
        }
        return { isAdmin: true, userId: userData.id };
      } catch (e) {
        return { isAdmin: false, error: 'Invalid user data' };
      }
    }
    
    return { isAdmin: false, error: 'User data not found' };
  } catch (error) {
    console.error('Admin permission check error:', error);
    return { isAdmin: false, error: 'Permission check failed' };
  }
}

// GET: Abonelik planlarını ve istatistikleri getir
export async function GET(request) {
  try {
    // Admin kontrolü
    const { isAdmin, error } = await checkAdminPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 403 });
    }
    
    // Abonelik planlarını getir
    const plansResponse = await fetch(`${API_BASE_URL}/subscriptions/plans/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${request.cookies.get('access_token')?.value || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!plansResponse.ok) {
      console.error('Plans API error:', await plansResponse.text());
      throw new Error(`Failed to fetch subscription plans: ${plansResponse.status}`);
    }
    
    let plans = [];
    try {
      plans = await plansResponse.json();
    } catch (e) {
      console.error('Error parsing plans response:', e);
      plans = [];
    }
    
    // Abonelik yönetimi bilgilerini getir
    const subscriptionManagementResponse = await fetch(`${API_BASE_URL}/admin/subscription-management/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${request.cookies.get('access_token')?.value || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    let stats = {};
    let recentSubscriptions = [];
    
    if (subscriptionManagementResponse.ok) {
      try {
        const subscriptionData = await subscriptionManagementResponse.json();
        stats = subscriptionData.stats || {};
        recentSubscriptions = subscriptionData.recentSubscriptions || [];
      } catch (e) {
        console.error('Error parsing subscription management response:', e);
      }
    } else {
      console.warn('Failed to fetch subscription management data, using available data');
    }
    
    return NextResponse.json({
      plans,
      stats,
      recentSubscriptions
    });
  } catch (error) {
    console.error('GET /api/admin/subscriptions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}