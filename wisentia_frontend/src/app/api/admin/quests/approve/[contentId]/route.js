import { NextResponse } from 'next/server';

// Helper function to verify admin access token
async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'Authentication required' };
  }
  
  const token = authHeader.split(' ')[1];
  
  // API_URL kontrolü - undefined ise varsayılan değer kullan
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    // Call backend to verify the token is admin
    const verifyResponse = await fetch(`${API_URL}/auth/verify-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });
    
    if (!verifyResponse.ok) {
      return { isAdmin: false, error: 'Invalid or expired token' };
    }
    
    const data = await verifyResponse.json();
    
    if (!data.is_admin) {
      return { isAdmin: false, error: 'User is not an admin' };
    }
    
    return { isAdmin: true, userId: data.user_id };
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return { isAdmin: false, error: 'Error verifying token' };
  }
}

export async function POST(request, { params }) {
  // Get content ID from params
  const { contentId } = params;
  
  // API_URL kontrolü - undefined ise varsayılan değer kullan
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    // Verify admin status
    const adminCheck = await verifyAdmin(request);
    
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }
    
    // Approve quest
    const response = await fetch(`${API_URL}/ai/admin/approve-quest/${contentId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization')
      },
      body: JSON.stringify({ approved_by: adminCheck.userId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || 'Failed to approve quest' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error approving quest:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 