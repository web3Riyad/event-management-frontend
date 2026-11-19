import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { extractAndVerifyJwt } from "@/lib/jwt";

const uri = process.env.MONGODB_URL;
let client;
let clientPromise;

if (!global._mongoClientPromise && uri) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// GET: Check if a user has already joined this event
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json({ hasJoined: false });
    }

    // Try Express backend first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const backendRes = await fetch(
        `${backendUrl}/events/${id}/join?userEmail=${encodeURIComponent(userEmail)}`,
        { signal: controller.signal, cache: "no-store" }
      );
      clearTimeout(timeoutId);
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Direct MongoDB fallback
    }

    if (!clientPromise) {
      return NextResponse.json({ hasJoined: false });
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const joinedCollection = db.collection("joinedEvents");

    const record = await joinedCollection.findOne({
      $or: [{ eventId: id }, { eventId: String(id) }],
      userEmail: userEmail,
    });

    return NextResponse.json({
      hasJoined: Boolean(record),
      data: record,
    });
  } catch (error) {
    console.error("GET /api/events/[id]/join error:", error);
    return NextResponse.json({ hasJoined: false });
  }
}

// POST: Join an event (Stores event and user data in database - Protected by JWT)
export async function POST(request, { params }) {
  try {
    const authUser = extractAndVerifyJwt(request);
    const { id } = await params;
    const body = await request.json();
    const { userId, userName } = body;
    const userEmail = authUser?.email || body?.userEmail;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required to join an event. Missing valid JWT or user email." },
        { status: 401 }
      );
    }

    // Try Express backend first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const authHeader = request.headers.get("authorization") || "";
      const backendRes = await fetch(`${backendUrl}/events/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ ...body, userEmail }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (backendRes.ok || backendRes.status === 409) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Direct MongoDB fallback
    }

    if (!clientPromise) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const eventsCollection = db.collection("event");
    const joinedCollection = db.collection("joinedEvents");

    let eventQuery = {};
    if (ObjectId.isValid(id)) {
      eventQuery = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      eventQuery = { _id: id };
    }

    const event = await eventsCollection.findOne(eventQuery);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user already joined
    const existing = await joinedCollection.findOne({
      $or: [{ eventId: id }, { eventId: String(event._id) }],
      userEmail: userEmail,
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "You have already joined this event.",
          alreadyJoined: true,
          data: existing,
        },
        { status: 409 }
      );
    }

    // Save event and user data into database
    const joinRecord = {
      eventId: String(event._id),
      eventTitle: event.eventTitle,
      eventType: event.eventType,
      eventDate: event.eventDate,
      location: event.location,
      thumbnailImageUrl: event.thumbnailImageUrl,
      eventDescription: event.eventDescription,
      userId: userId || null,
      userName: userName || "Volunteer",
      userEmail: userEmail,
      joinedAt: new Date(),
    };

    const insertResult = await joinedCollection.insertOne(joinRecord);

    // Increment joined count on event
    await eventsCollection.updateOne(eventQuery, { $inc: { joinedCount: 1 } });

    return NextResponse.json(
      {
        message: "Successfully joined event!",
        joinedId: insertResult.insertedId,
        data: joinRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events/[id]/join error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
