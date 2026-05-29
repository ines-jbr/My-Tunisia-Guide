const BASE_URL = '/api'

export async function sendChatMessage(message) {
  const response = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!response.ok) throw new Error(`Backend error ${response.status}`)
  return response.json()
}