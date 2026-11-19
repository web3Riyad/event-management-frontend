import { NextResponse, connection } from "next/server";
import { MongoClient } from "mongodb";
import { extractAndVerifyJwt } from "@/lib/jwt";

const uri = process.env.MONGODB_URL;
let client;
let clientPromise;

if (!global._mongoClientPromise && uri) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET(request) {
   await connection();
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType");
    const timeframe = searchParams.get("timeframe");
    const limit = searchParams.get("limit");
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Try Express backend first if available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const backendRes = await fetch(`${backendUrl}/events?${searchParams.toString()}`, {
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

    // Direct MongoDB connection fallback
    if (!clientPromise) {
      return NextResponse.json([]);
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const collection = db.collection("event");

    let query = {};
    if (eventType && eventType.toLowerCase() !== "all") {
      query.eventType = { $regex: new RegExp(`^${eventType}$`, "i") };
    }

    let sortOrder = 1;
    if (timeframe === "upcoming") {
      query.eventDate = { $gte: today };
      sortOrder = 1;
    } else if (timeframe === "past") {
      query.eventDate = { $lt: today };
      sortOrder = -1;
    }

    let cursor = collection.find(query).sort({ eventDate: sortOrder });
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      cursor = cursor.limit(limitNum);
    }

    const events = await cursor.toArray();
    return NextResponse.json(events);
  } catch (error) {
    console.error("API /events error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new event (Protected by JWT)
export async function POST(request) {
  try {
    const authUser = extractAndVerifyJwt(request);
    const body = await request.json();
    const {
      eventTitle,
      eventType,
      eventDate,
      location,
      thumbnailImageUrl,
      eventDescription,
      creatorName,
      creatorId,
    } = body;
    const creatorEmail = authUser?.email || body?.creatorEmail;

    if (!creatorEmail) {
      return NextResponse.json(
        { error: "Unauthorized: Valid JWT or authenticated user email is required." },
        { status: 401 }
      );
    }

    if (!eventTitle || !eventType || !eventDate) {
      return NextResponse.json(
        { error: "eventTitle, eventType, and eventDate are required" },
        { status: 400 }
      );
    }

    // 1. Try Express backend first if available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const authHeader = request.headers.get("authorization") || "";
      const backendRes = await fetch(`${backendUrl}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ ...body, creatorEmail }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch {
      // Backend not running, fallback to direct MongoDB
    }

    // 2. Direct MongoDB fallback
    if (!clientPromise) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const collection = db.collection("event");

    const newEvent = {
      eventTitle: eventTitle.trim(),
      eventType: eventType.trim(),
      eventDate: eventDate.trim(),
      location: location ? location.trim() : "",
      thumbnailImageUrl: thumbnailImageUrl
        ? thumbnailImageUrl.trim()
        : "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200",
      eventDescription: eventDescription ? eventDescription.trim() : "",
      creatorEmail: creatorEmail || null,
      creatorName: creatorName || null,
      creatorId: creatorId || null,
      joinedCount: 0,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newEvent);

    return NextResponse.json(
      {
        message: "Event created successfully",
        insertedId: result.insertedId,
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
