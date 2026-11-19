/**
 * Utility to get or fetch a valid JWT token for authenticated requests
 */
export async function getJwtToken(user) {
  if (typeof window === "undefined") return "";

  // 1. Check if token already cached in sessionStorage / localStorage
  let token = localStorage.getItem("jwt_token");
  if (token) {
    try {
      // Validate expiration
      const payloadBase64 = token.split(".")[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.exp && payload.exp > Math.floor(Date.now() / 1000) + 60) {
          return token;
        }
      }
    } catch {
      localStorage.removeItem("jwt_token");
    }
  }

  // 2. Fetch new JWT from /api/auth/token
  try {
    const res = await fetch("/api/auth/token", {
      method: user?.email ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: user?.email
        ? JSON.stringify({ email: user.email, name: user.name, id: user.id })
        : undefined,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
        return data.token;
      }
    }
  } catch (err) {
    console.warn("Could not fetch JWT token:", err);
  }

  return "";
}

/**
 * Returns headers with Authorization: Bearer <jwt>
 */
export async function getAuthHeaders(user, customHeaders = {}) {
  const token = await getJwtToken(user);
  return {
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
