/**
 * Diagnostic: Check what images are stored for all products
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected\n");

const products = await mongoose.connection.db.collection("products").find({}).toArray();

if (products.length === 0) {
    console.log("⚠️  No products in database.");
} else {
    products.forEach(p => {
        console.log(`📦 ${p.name}`);
        console.log(`   images: ${JSON.stringify(p.images)}`);
        console.log(`   images count: ${p.images?.length || 0}`);
        console.log('');
    });
}

await mongoose.disconnect();
