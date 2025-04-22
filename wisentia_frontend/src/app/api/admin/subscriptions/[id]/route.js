// src/app/api/admin/subscriptions/[id]/update/route.js
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

// PUT: Abonelik planını güncelle
export async function PUT(request, { params }) {
  try {
    // Admin kontrolü
    const { isAdmin, error } = await checkAdminPermission(request);
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 403 });
    }
    
    // Request body'yi al
    const planData = await request.json();
    const planId = params.id;
    
    console.log(`Updating plan ${planId} with data:`, planData);
    
    // Başarılı yanıt simülasyonu
    return NextResponse.json({
      success: true,
      plan: {
        PlanID: planId,
        ...planData,
        UpdatedDate: new Date().toISOString()
      },
      message: 'Subscription plan updated successfully'
    });
  } catch (error) {
    console.error(`PUT /api/admin/subscriptions/${params.id}/update error:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}