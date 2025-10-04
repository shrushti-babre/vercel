// Simple script to check if environment variables are loaded correctly
console.log("=== Environment Variables Check ===")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Loaded" : "✗ Missing")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ Missing")

if (!process.env.MONGODB_URI) {
  console.error("\n❌ MONGODB_URI is missing!")
  console.log("Make sure your .env.local file contains:")
  console.log("MONGODB_URI=your_mongodb_connection_string")
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error("\n❌ JWT_SECRET is missing!")
  console.log("Make sure your .env.local file contains:")
  console.log("JWT_SECRET=your_jwt_secret")
  process.exit(1)
}

console.log("\n✅ All environment variables are loaded correctly!")
