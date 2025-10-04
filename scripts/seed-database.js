const { MongoClient } = require("mongodb")

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log("Seeding database...")

    // Seed suppliers
    const suppliers = [
      {
        name: "Green Valley Farms",
        type: "farmer",
        contactInfo: {
          email: "contact@greenvalley.com",
          phone: "+1-555-0101",
          address: "123 Farm Road, California, USA",
        },
        location: {
          name: "California, USA",
          address: "123 Farm Road, California, USA",
          coordinates: { lat: 36.7783, lng: -119.4179 },
        },
        certifications: ["USDA Organic", "Non-GMO", "Fair Trade"],
        trustScore: 95,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Fresh Foods Processing",
        type: "manufacturer",
        contactInfo: {
          email: "info@freshfoods.com",
          phone: "+1-555-0102",
          address: "456 Industrial Ave, California, USA",
        },
        location: {
          name: "California, USA",
          address: "456 Industrial Ave, California, USA",
        },
        certifications: ["FDA Approved", "HACCP"],
        trustScore: 88,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("suppliers").insertMany(suppliers)
    console.log("Suppliers seeded")

    // Seed products
    const products = [
      {
        name: "Organic Tomatoes",
        description: "Fresh organic tomatoes from Green Valley Farms",
        category: "Vegetables",
        supplierId: suppliers[0]._id,
        price: 4.99,
        unit: "lb",
        harvestDate: new Date("2024-01-15"),
        expiryDate: new Date("2024-02-15"),
        certifications: ["USDA Organic", "Non-GMO"],
        nutritionalInfo: {
          calories: 18,
          protein: 0.9,
          carbs: 3.9,
          fat: 0.2,
        },
        storageInstructions: "Store in cool, dry place",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const productResult = await db.collection("products").insertMany(products)
    console.log("Products seeded")

    // Seed traceability records
    const traceabilityRecords = [
      {
        productId: productResult.insertedIds[0],
        stage: "farm",
        actorId: suppliers[0]._id,
        actorName: "Green Valley Farms",
        actorRole: "farmer",
        location: {
          name: "California, USA",
          address: "123 Farm Road, California, USA",
        },
        timestamp: new Date("2024-01-15"),
        action: "Harvested",
        description: "Organic tomatoes harvested at peak ripeness",
        qualityScore: 95,
        certifications: ["USDA Organic"],
        verificationStatus: "verified",
        hash: "abc123def456",
        createdAt: new Date(),
      },
      {
        productId: productResult.insertedIds[0],
        stage: "processing",
        actorId: suppliers[1]._id,
        actorName: "Fresh Foods Processing",
        actorRole: "manufacturer",
        location: {
          name: "California, USA",
          address: "456 Industrial Ave, California, USA",
        },
        timestamp: new Date("2024-01-16"),
        action: "Processed",
        description: "Washed, sorted, and packaged for distribution",
        qualityScore: 92,
        verificationStatus: "verified",
        hash: "def456ghi789",
        createdAt: new Date(),
      },
    ]

    await db.collection("traceability_records").insertMany(traceabilityRecords)
    console.log("Traceability records seeded")

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
