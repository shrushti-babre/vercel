import { MongoClient, type Db } from "mongodb"

let client: MongoClient
let clientPromise: Promise<MongoClient>

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("[v0] Environment variables check:")
    console.error("[v0] MONGODB_URI:", process.env.MONGODB_URI ? "✓ Found" : "✗ Missing")
    console.error("[v0] NODE_ENV:", process.env.NODE_ENV)
    console.error(
      "[v0] Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("MONGO"))
    )
    throw new Error(
      "MONGODB_URI environment variable is required. Please check your .env.local file and restart your development server."
    )
  }
  return uri
}

function initializeClient(): Promise<MongoClient> {
  const uri = getMongoUri()
  const options = {}

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    return globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    return client.connect()
  }
}

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = initializeClient()
  }
  return clientPromise
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default getClientPromise()

// Helper function to get database
export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise()
  return client.db("trusttrace")
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const client = await getClientPromise()
  const db = client.db("trusttrace")
  return { client, db }
}
