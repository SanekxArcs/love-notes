import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if the user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, category, isShown, like } = await request.json();

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Message array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Create a transaction for batch processing
    const transaction = sanityClient.transaction();
    
    // Add each message to the transaction
    messages.forEach(text => {
      transaction.create({
        _type: "message",
        text,
        category: category || "unknown",
        isShown: isShown || false,
        like: like || false,
        lastShownAt: null,
      });
    });

    // Commit the transaction
    const result = await transaction.commit();
    
    // Extract the created documents from the result
    // The result might be an object with results property or have a different structure
    let createdMessages = [];
    
    // Handle different possible result structures
    if (Array.isArray(result)) {
      createdMessages = result.map(res => res.document || res);
    } else if (result.results && Array.isArray(result.results)) {
      createdMessages = result.results.map(res => res.document || res);
    } else if (result.documentIds) {
      // If we only have IDs, we need to fetch the documents
      const docs = await Promise.all(
        result.documentIds.map(id => sanityClient.getDocument(id))
      );
      createdMessages = docs.filter(Boolean); // Filter out any null results
    } else {
      // Fallback - just use the messages we intended to create
      createdMessages = messages.map(text => ({
        text,
        category: category || "unknown",
        isShown: isShown || false,
        like: like || false,
        lastShownAt: null,
      }));
    }

    return NextResponse.json({ 
      messages: createdMessages,
      count: createdMessages.length 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating batch messages:", error);
    return NextResponse.json(
      { error: "Failed to create messages" },
      { status: 500 }
    );
  }
}
