import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bengal_computer";

// User Schema (আপনার মডেল অনুযায়ী)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const resetPassword = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected...");

    // যে এডমিনের পাসওয়ার্ড রিসেট করতে চান তার ইমেইল
    const adminEmail = "ahmmedshihab205@gmail.com"; 
    
    // নতুন পাসওয়ার্ড
    const newPassword = "admin12345"; 
    
    // পাসওয়ার্ড হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ডেটাবেজে আপডেট করা
    const updatedUser = await User.findOneAndUpdate(
      { email: adminEmail },
      { password: hashedPassword },
      { new: true }
    );

    if (updatedUser) {
      console.log(`✅ ${adminEmail} এর পাসওয়ার্ড সফলভাবে পরিবর্তন হয়ে '${newPassword}' হয়েছে!`);
      console.log(`বর্তমান রোল: ${updatedUser.role}`);
    } else {
      console.log("❌ এই ইমেইল দিয়ে কোনো এডমিন পাওয়া যায়নি!");
    }

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetPassword();