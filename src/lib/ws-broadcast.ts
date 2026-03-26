// Sends an event to the local WS server which broadcasts to all connected clients
export async function wsBroadcast(event: { type: string; data: any }) {
  try {
    await fetch("http://127.0.0.1:3106/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    // WS server might not be running — silently ignore
  }
}
