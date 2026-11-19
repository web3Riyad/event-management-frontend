import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { extractAndVerifyJwt } from "@/lib/jwt";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const uri = process.env.MONGODB_URL;
let client;
let clientPromise;

if (!global._mongoClientPromise && uri) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Helper to get authenticated user from session or JWT
async function getAuthUser(request) {
  // 1. Try JWT from Authorization header
  const jwtPayload = extractAndVerifyJwt(request);
  if (jwtPayload?.email) {
    return {
      email: jwtPayload.email.toLowerCase(),
      name: jwtPayload.name || "",
      id: jwtPayload.id || null,
    };
  }

  // 2. Try BetterAuth session
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.email) {
      return {
        email: session.user.email.toLowerCase(),
        name: session.user.name || "",
        image: session.user.image || "",
        id: session.user.id || null,
      };
    }
  } catch {
    // Session retrieval error
  }

  return null;
}

// GET user profile and activity stats
export async function GET(request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser?.email) {
      return NextResponse.json(
        { error: "Authentication required to view profile." },
        { status: 401 }
      );
    }

    if (!clientPromise) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const userCollection = db.collection("user");
    const eventsCollection = db.collection("event");
    const joinedEventsCollection = db.collection("joinedEvents");

    // Fetch user from DB
    const dbUser = await userCollection.findOne({
      email: { $regex: new RegExp(`^${authUser.email}$`, "i") },
    });

    // Count user's created and joined events
    const [createdCount, joinedCount] = await Promise.all([
      eventsCollection.countDocuments({
        creatorEmail: { $regex: new RegExp(`^${authUser.email}$`, "i") },
      }),
      joinedEventsCollection.countDocuments({
        userEmail: { $regex: new RegExp(`^${authUser.email}$`, "i") },
      }),
    ]);

    const profileData = {
      id: dbUser?._id?.toString() || authUser.id,
      name: dbUser?.name || authUser.name || "Community Member",
      email: dbUser?.email || authUser.email,
      image: dbUser?.image || authUser.image || "",
      createdAt: dbUser?.createdAt || null,
      stats: {
        createdEventsCount: createdCount,
        joinedEventsCount: joinedCount,
      },
    };

    return NextResponse.json(profileData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return NextResponse.json(
      { error: "Failed to retrieve user profile." },
      { status: 500 }
    );
  }
}

// PUT / PATCH update user profile (Name and Profile Picture)
export async function PUT(request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser?.email) {
      return NextResponse.json(
        { error: "Authentication required to update profile." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const finalImage = typeof image === "string" ? image.trim() : "";

    if (!clientPromise) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const connectedClient = await clientPromise;
    const db = connectedClient.db("EventManagement");
    const userCollection = db.collection("user");
    const eventsCollection = db.collection("event");
    const joinedEventsCollection = db.collection("joinedEvents");

    const updateDoc = {
      $set: {
        name: trimmedName,
        image: finalImage,
        updatedAt: new Date(),
      },
    };

    // Update in user collection
    await userCollection.updateOne(
      { email: { $regex: new RegExp(`^${authUser.email}$`, "i") } },
      updateDoc
    );

    // Sync updated name across user's created events & joined events
    await Promise.all([
      eventsCollection.updateMany(
        { creatorEmail: { $regex: new RegExp(`^${authUser.email}$`, "i") } },
        { $set: { creatorName: trimmedName } }
      ),
      joinedEventsCollection.updateMany(
        { userEmail: { $regex: new RegExp(`^${authUser.email}$`, "i") } },
        { $set: { userName: trimmedName } }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        name: trimmedName,
        email: authUser.email,
        image: finalImage,
      },
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
