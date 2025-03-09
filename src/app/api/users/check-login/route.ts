import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(request: Request) {
  try {
    // Get login from query parameters
    const { searchParams } = new URL(request.url);
    const login = searchParams.get('login');
    
    if (!login) {
      return NextResponse.json({ error: 'Login parameter is required' }, { status: 400 });
    }
    
    // Check if user with this login exists
    const existingUser = await sanityClient.fetch(
      `*[_type == "user" && login == $login][0]`,
      { login }
    );
    
    // Return whether the login is available or not
    return NextResponse.json({
      available: !existingUser
    });
  } catch (error) {
    console.error('Error checking login availability:', error);
    return NextResponse.json({ error: 'Failed to check login availability' }, { status: 500 });
  }
}
