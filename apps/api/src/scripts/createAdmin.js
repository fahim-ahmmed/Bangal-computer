import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = "mongodb+srv://bangalcomputer:ZdL7T1oAs79bNF5h@cluster0.cshkecs.mongodb.net/bangal-computer?retryWrites=true&w=majority";

// Better Auth Compatible User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    emailVerified: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    image: { type: String, default: "" },
  },
  { timestamps: true, strict: false }
);

// Better Auth সাধারণত 'user' কালেকশন ব্যবহার করে
const User = mongoose.models.User || mongoose.model("User", userSchema, "user");

const createAdmin = async () => {
  try {
    console.log("⏳ MongoDB Atlas-এ কানেক্ট করা হচ্ছে...");
    await mongoose.connect(MONGO_URI);
    console.log("☁️  MongoDB Atlas-এ কানেক্ট হয়েছে!");

    const emails = ["admin@bengalcomputer.com", "ahmmedshihab205@gmail.com"];
    const rawPassword = "admin12345";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    for (const email of emails) {
      await User.findOneAndUpdate(
        { email },
        {
          name: "Super Admin",
          email,
          password: hashedPassword,
          role: "admin",
          emailVerified: true,
          isVerified: true,
        },
        { upsert: true, new: true }
      );
      console.log(`✅ ${email} অ্যাকাউন্ট তৈরি/আপডেট করা হয়েছে!`);
    }

    console.log("=========================================");
    console.log(`🔑 Password: ${rawPassword}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();