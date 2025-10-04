const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function createTestUser() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI environment variable is required")
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db("trusttrace")
    const usersCollection = db.collection("users")

    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: "farmer@test.com" })
    if (existingUser) {
      console.log("Test user already exists")
      return
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 12)
    const testUser = {
      email: "farmer@test.com",
      password: hashedPassword,
      name: "Test Farmer",
      role: "farmer",
      profile: {
        phone: "+1234567890",
        address: "123 Farm Road",
        companyName: "Test Farm Co.",
        description: "Test farmer account",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await usersCollection.insertOne(testUser)
    console.log("Test user created successfully!")
    console.log("Email: farmer@test.com")
    console.log("Password: password123")
  } catch (error) {
    console.error("Error creating test user:", error)
  } finally {
    await client.close()
  }
}

createTestUser()
