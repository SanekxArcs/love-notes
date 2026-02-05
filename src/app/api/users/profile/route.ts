import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const login = searchParams.get('login');
    
    if (!login) {
      return NextResponse.json({ error: 'Login is required' }, { status: 400 });
    }
    
    if (session.user.login !== login && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
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

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await request.json();
    
    if (session.user.login !== userData.login && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const existingUser = await sanityClient.fetch(`
      *[_type == "user" && login == $login][0] {
        _id
      }
    `, { login: userData.login });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (userData.dayMessageLimit !== undefined) {
      userData.dayMessageLimit = Number(userData.dayMessageLimit);
    }
    
    const allowedFields = ['name', 'password', 'phone', 'partnerIdToReceiveFrom', 'dayMessageLimit','partnerIdToSend'];
    const patch = Object.keys(userData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = userData[key];
        return obj;
      }, {} as Record<string, unknown>);
    
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
