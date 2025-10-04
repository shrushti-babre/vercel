import { getDatabase } from "@/lib/mongodb";
import type { TraceabilityRecord } from "@/lib/models/TraceabilityRecord";

export async function addTraceabilityRecord(
  data: Omit<TraceabilityRecord, "_id" | "createdAt" | "timestamp">
) {
  const db = await getDatabase();
  const collection = db.collection<TraceabilityRecord>("traceability");

  const record: TraceabilityRecord = {
    ...data,
    timestamp: new Date(),
    createdAt: new Date(),
    verificationStatus: data.verificationStatus || "pending",
  };

  await collection.insertOne(record);
  return record;
}
