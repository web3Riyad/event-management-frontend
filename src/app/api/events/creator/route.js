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
    const authUser = extractAndVerifyJwt(request);
    const { searchParams } = new URL(request.url);
    const creatorEmail = authUser?.email || searchParams.get("creatorEmail");

    if (!creatorEmail) {
      return NextResponse.json(
        { error: "creatorEmail query parameter or valid JWT Bearer token is required" },
        { status: 400 }
      );
    }

    // 1. Try Express backend first if available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const authHeader = request.headers.get("authorization") || "";
      const backendRes = await fetch(
        `${backendUrl}/events/creator?creatorEmail=${encodeURIComponent(creatorEmail)}`,
        {
          headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          signal: controller.signal,
          cache: "no-store",
        }
      );
      clearTimeout(timeoutId);
      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline, fallback to direct MongoDB
    }

    // 2. Direct MongoDB fallback
    if (!clientPromise) {
      return NextResponse.json([]);
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const collection = db.collection("event");

    const events = await collection
      .find({
        $or: [
          { creatorEmail: creatorEmail },
          { creatorEmail: { $regex: new RegExp(`^${creatorEmail}$`, "i") } },
        ],
      })
      .sort({ createdAt: -1, eventDate: 1 })
      .toArray();

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events/creator error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
