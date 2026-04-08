import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/health/route"

function makeRequest(url = "http://localhost:3000/api/health") {
  return new Request(url)
}

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const response = await GET(makeRequest())
    const data = await response.json()
    expect(data.status).toBe("ok")
  })

  it("returns a timestamp", async () => {
    const response = await GET(makeRequest())
    const data = await response.json()
    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })

  it("returns a version field", async () => {
    const response = await GET(makeRequest())
    const data = await response.json()
    expect(data.version).toBeDefined()
  })

  it("returns 200 status", async () => {
    const response = await GET(makeRequest())
    expect(response.status).toBe(200)
  })
})
