import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

// GET endpoint to fetch partner data by partnerId
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get partnerId from query parameters
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }
    
    // Fetch user by partnerIdToSend
    const partnerData = await sanityClient.fetch(
      `
      *[_type == "user" && partnerIdToSend == $partnerId][0] {
        _id,
        name,
        dayMessageLimit,
        phone
      }
      `,
      { partnerId }
    );
    
    if (!partnerData) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    
    return NextResponse.json(partnerData);
  } catch (error) {
    console.error('Error fetching partner data:', error);
    return NextResponse.json({ error: 'Failed to fetch partner data' }, { status: 500 });
  }
}
