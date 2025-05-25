import { headers, cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Handler for GET requests to check if a user has access to content
export async function GET(request) {
    // Get token from headers or cookies
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('access_token');

    let token = '';
    
    // Extract token from Authorization header or cookie
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (tokenCookie) {
        token = tokenCookie.value;
    }
    
    // Get content ID from query parameter
    const url = new URL(request.url);
    const contentId = url.searchParams.get('contentId');
    const contentType = url.searchParams.get('type') || 'course'; // Default to course
    
    if (!contentId) {
        console.log('No content ID provided in subscription check, allowing access by default');
        return NextResponse.json({ 
            hasAccess: true,
            message: 'No content ID provided, access granted by default'
        });
    }

    try {
        // We have a token, call backend API to check access
        if (token) {
            // Make request to backend API
            const apiUrl = `${process.env.BACKEND_API_URL}/api/subscriptions/check-access/`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });
            
            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
            
            // For demo purposes, allow access on backend API failure
            console.log('Backend API check failed, allowing access by default');
            return NextResponse.json({ 
                hasAccess: true,
                message: 'Backend API check failed, access granted by default'
            });
        }
        
        // No token found, deny access
        return NextResponse.json({ 
            hasAccess: false,
            message: 'Authentication required'
        }, { status: 401 });
        
    } catch (error) {
        console.error('Error checking subscription access:', error);
        
        // For development/demo, allow access on error
        return NextResponse.json({ 
            hasAccess: true,
            message: 'Error occurred, access granted by default'
        });
    }
} 