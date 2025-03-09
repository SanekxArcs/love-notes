import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { SanityDocument } from "@sanity/client";

interface BatchMessageRequestBody {
  messages: string[];
  category?: string;
  isShown?: boolean;
  like?: boolean;
}

interface SanityMessage {
  _id: string;
  _type: 'message';
  text: string;
  isShown: boolean;
  userName?: string;
  category: string;
  like: boolean;
  shownAt?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    const { messages, category, isShown, like } = await request.json() as BatchMessageRequestBody;


    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Message array is required and cannot be empty" },
        { status: 400 }
      );
    }

    const transaction = sanityClient.transaction();
    messages.forEach(text => {
      const newMessage = {
        _type: "message",
        text,
        category: category || "unknown",
        isShown: isShown || false,
        like: like || false,
        shownAt: null,
        creator: {
          _type: "reference",
          _ref: session?.user.id,
        },
      };
      transaction.create(newMessage);
    });

    const result = await transaction.commit();
    
    let createdMessages: Partial<SanityMessage>[] = [];
    
    if (Array.isArray(result)) {
      createdMessages = result.map(res => {
        if ('document' in res && res.document) {
          return res.document as SanityMessage;
        }
        return res as Partial<SanityMessage>;
      });
    } else if (result.results && Array.isArray(result.results)) {
      const docs = await Promise.all(
        result.results.map(res => 
          sanityClient.getDocument<SanityMessage>(res.id)
        )
      );
      createdMessages = docs.filter((doc): doc is SanityDocument<SanityMessage> => doc !== null);
    } else if (result.documentIds && Array.isArray(result.documentIds)) {
      const docs = await Promise.all(
        result.documentIds.map((id: string) => 
          sanityClient.getDocument<SanityMessage>(id)
        )
      );
      createdMessages = docs.filter((doc): doc is SanityDocument<SanityMessage> => doc !== null);
    } else {
      createdMessages = messages.map(text => ({
        text,
        category: category || "unknown",
        isShown: isShown || false,
        like: like || false,
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
