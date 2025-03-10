import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

// GET endpoint to fetch user profile data
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get login from query parameters
    const { searchParams } = new URL(request.url);
    const login = searchParams.get('login');
    
    if (!login) {
      return NextResponse.json({ error: 'Login is required' }, { status: 400 });
    }
    
    // Only allow users to access their own data (unless they're admin)
    if (session.user.login !== login && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Fetch user data from Sanity
    const userData = await sanityClient.fetch(
      `
      *[_type == "user" && login == $login][0]
    `,
      { login }
    );
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

// PUT endpoint to update user profile data
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await request.json();
    
    // Only allow users to update their own data (unless they're admin)
    if (session.user.login !== userData.login && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get the document ID first to ensure we're updating the right document
    const existingUser = await sanityClient.fetch(`
      *[_type == "user" && login == $login][0] {
        _id
      }
    `, { login: userData.login });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Convert dayMessageLimit to number if it exists
    if (userData.dayMessageLimit !== undefined) {
      userData.dayMessageLimit = Number(userData.dayMessageLimit);
    }
    
    // Fields that users are allowed to update
    const allowedFields = ['name', 'password', 'phone', 'partnerIdToReceiveFrom', 'dayMessageLimit','partnerIdToSend'];
    // Admin can update more fields
    // if (session.user.role === 'admin') {
    //   allowedFields.push('partnerIdToSend', 'role');
    // }
    
    // Create patch with only allowed fields
    const patch = Object.keys(userData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = userData[key];
        return obj;
      }, {} as Record<string, unknown>);
    
    // Update user in Sanity
    await sanityClient
      .patch(existingUser._id)
      .set(patch)
      .commit();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
