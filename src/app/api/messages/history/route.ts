import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { auth } from "@/auth";

// GET endpoint to fetch message history
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

    // First, find the partner user by their partnerIdToSend
    const partner = await sanityClient.fetch(
      `*[_type == "user" && partnerIdToSend == $partnerId][0]._id`,
      { partnerId }
    );
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found for the provided ID' }, { status: 404 });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fetch messages with where creator reference is the partner's _id
    const messages = await sanityClient.fetch(
      `{
        "todayMessages": *[
          _type == "message" && 
          isShown == true && 
          creator._ref == $partnerId && 
          defined(shownAt) && 
          dateTime(shownAt) >= dateTime($today)
        ] | order(shownAt desc) {
          _id,
          text,
          category,
          like,
          shownAt,
          name
        },
        "previousMessages": *[
          _type == "message" && 
          isShown == true && 
          creator._ref == $partnerId && 
          defined(shownAt) && 
          dateTime(shownAt) < dateTime($today)
        ] | order(shownAt desc) {
          _id,
          text,
          category,
          like,
          shownAt,
          name
        }
      }`,
      { 
        partnerId: partner, // Use the actual partner's _id 
        today: today.toISOString()
      }
    );
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching message history:', error);
    return NextResponse.json({ error: 'Failed to fetch message history' }, { status: 500 });
  }
}
