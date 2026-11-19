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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Try Express backend first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const backendRes = await fetch(`${backendUrl}/events/${id}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not running, proceed to direct MongoDB connection
    }

    // Direct MongoDB fallback
    if (!clientPromise) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const collection = db.collection("event");
    const joinedCollection = db.collection("joinedEvents");

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const event = await collection.findOne(query);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const joinedCount = await joinedCollection.countDocuments({
      $or: [{ eventId: id }, { eventId: String(event._id) }],
    });

    return NextResponse.json({
      ...event,
      joinedCount: joinedCount || event.joinedCount || 0,
    });
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update an event (Only the creator can update - Protected by JWT)
export async function PUT(request, { params }) {
  try {
    const authUser = extractAndVerifyJwt(request);
    const { id } = await params;
    const body = await request.json();
    const {
      eventTitle,
      eventType,
      eventDate,
      location,
      thumbnailImageUrl,
      eventDescription,
    } = body;
    const userEmail = authUser?.email || body?.userEmail;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required. Missing valid JWT or userEmail." },
        { status: 401 }
      );
    }

    // 1. Try Express backend first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const authHeader = request.headers.get("authorization") || "";
      const backendRes = await fetch(`${backendUrl}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ ...body, userEmail }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (backendRes.ok || backendRes.status === 403 || backendRes.status === 404) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Backend offline, fallback to direct MongoDB
    }

    // 2. Direct MongoDB fallback
    if (!clientPromise) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const eventsCollection = db.collection("event");
    const joinedCollection = db.collection("joinedEvents");

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const event = await eventsCollection.findOne(query);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Security check: Only creator can update
    if (event.creatorEmail && event.creatorEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: You can only update events created by you." },
        { status: 403 }
      );
    }

    const updateFields = {};
    if (eventTitle) updateFields.eventTitle = eventTitle.trim();
    if (eventType) updateFields.eventType = eventType.trim();
    if (eventDate) updateFields.eventDate = eventDate.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (thumbnailImageUrl) updateFields.thumbnailImageUrl = thumbnailImageUrl.trim();
    if (eventDescription !== undefined) updateFields.eventDescription = eventDescription.trim();
    updateFields.updatedAt = new Date();

    await eventsCollection.updateOne(query, { $set: updateFields });

    // Also update denormalized joinedEvents
    await joinedCollection.updateMany(
      { $or: [{ eventId: id }, { eventId: String(event._id) }] },
      {
        $set: {
          eventTitle: updateFields.eventTitle || event.eventTitle,
          eventType: updateFields.eventType || event.eventType,
          eventDate: updateFields.eventDate || event.eventDate,
          location: updateFields.location !== undefined ? updateFields.location : event.location,
          thumbnailImageUrl: updateFields.thumbnailImageUrl || event.thumbnailImageUrl,
        },
      }
    );

    return NextResponse.json({ message: "Event updated successfully", updateFields });
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE an event (Only the creator can delete - Protected by JWT)
export async function DELETE(request, { params }) {
  try {
    const authUser = extractAndVerifyJwt(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userEmail = authUser?.email || searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required. Missing valid JWT or userEmail." },
        { status: 401 }
      );
    }

    // 1. Try Express backend first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const authHeader = request.headers.get("authorization") || "";
      const backendRes = await fetch(
        `${backendUrl}/events/${id}?userEmail=${encodeURIComponent(userEmail)}`,
        {
          method: "DELETE",
          headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (backendRes.ok || backendRes.status === 403 || backendRes.status === 404) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      }
    } catch {
      // Backend offline, fallback to direct MongoDB
    }

    // 2. Direct MongoDB fallback
    if (!clientPromise) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const eventsCollection = db.collection("event");
    const joinedCollection = db.collection("joinedEvents");

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    const event = await eventsCollection.findOne(query);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Security check: Only creator can delete
    if (event.creatorEmail && event.creatorEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete events created by you." },
        { status: 403 }
      );
    }

    await eventsCollection.deleteOne(query);

    // Clean up related joinedEvents
    await joinedCollection.deleteMany({
      $or: [{ eventId: id }, { eventId: String(event._id) }],
    });

    return NextResponse.json({ message: "Event deleted successfully", deletedId: id });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
