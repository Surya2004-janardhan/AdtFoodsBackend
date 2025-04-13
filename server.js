const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key"; // Ideally, use an environment variable
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// notifcations saruku -- all realted code --

// const { Expo } = require("expo-server-sdk");
// let expo = new Expo();

// Function to send notification
// async function sendPushNotification_order(toToken, title, message) {
//   if (!Expo.isExpoPushToken(toToken)) {
//     console.error("Invalid Expo push token:", toToken);
//     return;
//   }

//   const messages = [
//     {
//       to: toToken,
//       sound: "default",
//       title,
//       body: message,
//     },
//   ];

//   try {
//     const ticketChunk = await expo.sendPushNotificationsAsync(messages);
//     console.log("Push notification sent:", ticketChunk);
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// }

// async function sendPushNotification(toToken, title, message) {
//   if (!Expo.isExpoPushToken(toToken)) {
//     console.error("Invalid Expo push token:", toToken);
//     return;
//   }

//   const messages = [
//     {
//       to: toToken,
//       sound: "default",
//       title,
//       body: message,
//     },
//   ];

//   try {
//     const ticketChunk = await expo.sendPushNotificationsAsync(messages);
//     console.log("Push notification sent:", ticketChunk);
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// }

// app.patch("/orders/:id", async (req, res) => {
//   const id = req.params.id;
//   const { status } = req.body;

//   try {
//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ error: "Order not found" });

//     await Order.findByIdAndUpdate(id, { status });

//     // Fetch user's push token
//     const user = await User.findOne({ user_email: order.user_email }); // adjust this if your user relation is different

//     // if (user?.device_token) {
//     //   let notificationTitle = "Order Update";
//     //   let notificationBody = "";

//     //   if (status === "accepted") {
//     //     notificationBody = "Your order is ready to pick up!";
//     //   } else if (status === "delivered") {
//     //     notificationBody = "Your order has been delivered!";
//     //   }

//     //   if (notificationBody) {
//     //     await sendPushNotification(
//     //       user.device_token,
//     //       notificationTitle,
//     //       notificationBody
//     //     );
//     //   }
//     // }

//     res.json({
//       success: true,
//       message: "Order status updated and notification sent",
//     });
//   } catch (err) {
//     console.error("Error in patch /orders/:id:", err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// async function sendPushNotification(toToken, message) {
//   if (!Expo.isExpoPushToken(toToken)) {
//     console.error("Invalid Expo push token:", toToken);
//     return;
//   }

//   const messages = [
//     {
//       to: toToken,
//       sound: "default",
//       title: "Order Placed",
//       body: message,
//       data: { withSome: "data" },
//     },
//   ];

//   try {
//     const ticketChunk = await expo.sendPushNotificationsAsync(messages);
//     console.log("Push notification ticket:", ticketChunk);
//   } catch (error) {
//     console.error("Error sending push notification:", error);
//   }
// }

uri =
  "mongodb+srv://chintalajanardhan2004:adityafoods@cluster0.dm083rc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// MongoDB Connection
mongoose
  .connect(uri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schemas and Models
const userSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  password: String,
  email: String,
  phone_number: String,
});
const AdminUserSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  password: String,
  email: String,
  phone_number: String,
});
const AdminUser = mongoose.model("admins", AdminUserSchema);

const orderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
  user_email: String,
  user_name: String,
  user_phone: String,
  items: String,
  total_amount: Number,
  status: String,
  user_id: String,
  payment_id: String,
  otp: String,
  canteen_name: String,
});

const tokensschema = new mongoose.Schema({
  user_id: String,
  token: String,
});
// const foodItemSchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   price: Number,
//   available: Boolean,
// });
const foodItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  available: Boolean,
  image: String,
  canteen_name: String,
});
const FoodItem = mongoose.model("fooditems", foodItemSchema);

const restaurantSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model("users", userSchema);
const Order = mongoose.model("orders", orderSchema);
// const FoodItem = mongoose.model("food_items", foodItemSchema);
const Restaurant = mongoose.model("restaurants", restaurantSchema);
const Token = mongoose.model("tokens", tokensschema);
// ---------------------- Routes ----------------------
app.get("/food-items", async (req, res) => {
  const items = await FoodItem.find({});
  res.json(items);
  // items = json(items)
  // console.log(items);
});
app.post("/admin/login", async (req, res) => {
  console.log("inside the end  point");
  const { Id, password } = req.body;
  console.log(Id, password);
  const user = await AdminUser.findOne({ user_id: Id, password });
  if (!user)
    // console.log("user doesnt exist ")
    return res.status(401).json({ error: "Invalid user ID or password" });
  res.json({ success: true, user });
  // console.log(user.name)
  console.log("ho succes out of end point ");
});

app.post("/signup", async (req, res) => {
  const { user_id, name, password, email, phone_number } = req.body;

  // Basic validations
  if (!user_id || !name || !password || !email || !phone_number)
    return res.status(400).json({ error: "All fields are required" });

  if (user_id.length !== 10)
    return res
      .status(400)
      .json({ error: "User ID must be exactly 10 characters long" });

  if (!/^\d{10}$/.test(phone_number))
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });

  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });

  if (!/\S+@\S+\.\S+/.test(email))
    return res.status(400).json({ error: "Email format is invalid" });

  try {
    // Check for existing user_id, email, or phone_number
    const existingUser = await User.findOne({
      $or: [{ user_id }, { email }, { phone_number }],
    });

    if (existingUser) {
      if (existingUser.user_id === user_id)
        return res.status(409).json({ error: "User ID already exists" });

      if (existingUser.email === email)
        return res.status(409).json({ error: "Email already exists" });

      if (existingUser.phone_number === phone_number)
        return res.status(409).json({ error: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // Create new user
    await User.create({
      user_id,
      name,
      password: hashedPassword,
      email,
      phone_number,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Error signing up user" });
  }
});

// app.post("/signup", async (req, res) => {
//   const { user_id, name, password, email, phone_number } = req.body;
//   if (!user_id || !name || !password || !email || !phone_number)
//     return res.status(400).json({ error: "All fields are required" });
//   if (user_id.length !== 10)
//     return res
//       .status(400)
//       .json({ error: "User ID must be exactly 10 characters long" });
//   if (!/^\d{10}$/.test(phone_number))
//     return res
//       .status(400)
//       .json({ error: "Phone number must be exactly 10 digits" });
//   if (password.length < 8)
//     return res
//       .status(400)
//       .json({ error: "Password must be at least 8 characters long" });
//   if (!/\S+@\S+\.\S+/.test(email))
//     return res.status(400).json({ error: "Email format is invalid" });

//   try {
//     await User.create({ user_id, name, password, email, phone_number });
//     res.status(201).json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Error signing up user" });
//   }
// });
// token findin endpoint -- error prone area to be checked
app.post("/admin/save-token", async (req, res) => {
  const { userId, token } = req.body;
  console.log("Received token:", userId, token);

  if (!userId || !token) {
    return res.status(400).json({ error: "User ID and token are required" });
  }

  try {
    // Update the device token in the users collection
    const userUpdateResult = await AdminUser.updateOne(
      { user_id: userId },
      { $set: { device_token: token } }
    );

    if (userUpdateResult.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if this token already exists in tokens collection
    const existingToken = await Token.findOne({ user_id: userId, token });

    if (existingToken) {
      return res.status(200).json({
        success: "Token already exists in tokens collection, user updated",
      });
    }

    // Insert the token into the tokens collection
    await Token.create({ user_id: userId, token });

    res.status(200).json({
      success: "Token saved in both users and tokens collections",
    });
  } catch (err) {
    console.error("Error saving token:", err);
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/food-items", async (req, res) => {
  try {
    const { name, description, price, image, available, canteen_name } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !image ||
      available === undefined ||
      !canteen_name
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Optional: Auto-generate a custom ID if you use it
    const lastItem = await FoodItem.findOne().sort({ id: -1 });
    const newId = lastItem ? lastItem.id + 1 : 1;

    const newFoodItem = new FoodItem({
      // optional if you're using your own ID system
      id: newId,
      name,
      price,
      image,
      available,
      canteen_name,
    });

    await newFoodItem.save();

    res.status(201).json({ success: true, item: newFoodItem });
  } catch (err) {
    console.error("Error creating food item:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/food-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { available } = req.body;
  if (typeof available !== "boolean")
    return res.status(400).json({ error: "Invalid availability status" });

  await FoodItem.updateOne({ id }, { available });
  res.json({ success: true });
});
app.get("/get-token", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "Missing user_id" });
  }

  try {
    console.log(user_id);
    const tokenDoc = await Token.findOne({ user_id: user_id });
    console.log(tokenDoc);
    if (tokenDoc) {
      res.json({ success: true, token: tokenDoc.token });
      console.log("user token found");
    } else {
      res
        .status(404)
        .json({ success: false, message: "Token not found for this user" });
      console.log("token not found");
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    res.status(500).json({ error: "Error retrieving token" });
  }
});
app.post("/logout", async (req, res) => {
  const { user_id } = req.body;
  console.log("inside of logout");

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Step 1: Clear device_token from the User collection
    // await User.updateOne({ user_id: user_id }, { $set: { device_token: "" } });
    console.log("trying for logout");
    // Step 2: Remove all tokens for this user from Token collection
    await Token.deleteMany({ user_id: user_id });

    res.status(200).json({ success: true, message: "Logged out successfully" });
    console.log("seems all okay fornow");
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed due to server error" });
    console.log("ophio error");
  }
});

app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res
      .status(400)
      .json({ error: "User ID, password and device token are required" });
  }

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid user ID or password" });
    }

    // Generate JWT Token (30-day expiry)
    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "defaultsecret", {
      expiresIn: "30d",
    });

    // --- Save Device Token in users collection ---
    // const userUpdateResult = await User.updateOne(
    //   { user_id: user.user_id },
    //   { $set: { device_token: token } }
    // );

    // --- Save jwt Token in tokens collection (if new) ---
    const existingToken = await Token.findOne({
      user_id: user.user_id,
      token: token,
    });

    if (!existingToken) {
      await Token.create({ user_id: user.user_id, token: token });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      jwt: token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post("/login", async (req, res) => {
//   const { user_id, password } = req.body;
//   const user = await User.findOne({ user_id, password });
//   if (!user)
//     return res.status(401).json({ error: "Invalid user ID or password" });
//   res.json({ success: true, user });
// });
// save-token endpoint later included error prone route fr
app.post("/save-token", async (req, res) => {
  const { userId, token } = req.body;
  //   console.log("Received token:", userId, token);

  if (!userId || !token) {
    return res.status(400).json({ error: "User ID and token are required" });
  }

  try {
    // Update the device token in the users collection
    const userUpdateResult = await User.updateOne(
      { user_id: userId },
      { $set: { device_token: token } }
    );

    if (userUpdateResult.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("saved succes");
    // Check if this token already exists in tokens collection
    // const existingToken = await Token.findOne({ user_id: userId, token });

    // if (existingToken) {
    //   return res.status(200).json({
    //     success: "Token already exists in tokens collection, user updated",
    //   });
    // }

    // // Insert the token into the tokens collection
    // await Token.create({ user_id: userId, token });

    res.status(200).json({
      success: "Token saved in both users and tokens collections",
    });
  } catch (err) {
    console.error("Error saving token:", err);
    res.status(500).json({ error: "Database error" });
  }
  console.log("end of the funtion ");
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.put("/food-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { available } = req.body;
  if (typeof available !== "boolean")
    return res.status(400).json({ error: "Invalid availability status" });

  await FoodItem.updateOne({ id }, { available });
  res.json({ success: true });
});

app.get("/restaurants", async (req, res) => {
  console.log("called");
  const restaurants = await Restaurant.find({});
  res.json(restaurants);
  // console.log(restaurants);
});

// const mongoose = require("mongoose");

// const counterSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   sequence_value: { type: Number, default: 0 },
// });
// // const FoodItem = mongoose.model("fooditems", foodItemSchema);

// const Counter = mongoose.model("Counter", counterSchema);
// // console.log("fsf")
// // const Counter = require("./models/Counter");

async function getNextSequence() {
  const lastOrder = await Order.findOne().sort({ id: -1 }).limit(1); // Get order with highest ID
  const nextId = lastOrder ? lastOrder.id + 1 : 1; // Start from 1 if no order exists
  return nextId;
}

// async function getNextSequence(name) {
//   const counter = await Counter.findByIdAndUpdate(
//     name,
//     { $inc: { sequence_value: 1 } },
//     { new: true, upsert: true }
//   );

//   return counter.sequence_value;
// }

// app.post("/place-order", async (req, res) => {
//   const {
//     userEmail,
//     userName,
//     userPhone,
//     items,
//     totalAmount,
//     status,
//     userId,
//     payment_id,
//   } = req.body;
//   // console.log(req.body);
//   const id = await getNextSequence();
//   const newOrder = await Order.create({
//     id: id,
//     user_email: userEmail,
//     user_name: userName,
//     user_phone: userPhone,
//     items,
//     total_amount: totalAmount,
//     status,
//     created_at: Date.now(),
//     user_id: userId,
//     otp: Math.floor(1000 + Math.random() * 9000),
//     payment_id: payment_id,
//   });
//   const user = await User.findOne({ userId });
//   if (user?.device_token) {
//     console.log("found device token inside the if");
//     await sendPushNotification(
//       user.device_token,
//       "Your order has been placed successfully!"
//     );
//     console.log("end of token send");
//   }
//   console.log("no token found may be ", user.device_token);

//   res.json({ success: true, orderId: newOrder.id });
//   async function sendOrderPlacedEmail(
//     userEmail,
//     userName,
//     userPhone,
//     items,
//     totalAmount,
//     status,
//     userId,
//     payment_id
//   ) {
//     const html = `
//     <h2>Hi ${userName}, your order has been placed successfully!</h2>
//     <p>Here are the order details:</p>
//     <table border="1" cellspacing="0" cellpadding="5">
//       <tr><th>Order ID</th><td>${newOrder.id}</td></tr>
//       <tr><th>User Email</th><td>${userEmail}</td></tr>
//       <tr><th>Items</th><td>${items}</td></tr>
//       <tr><th>Total Amount</th><td>₹${parseFloat(totalAmount).toFixed(
//         2
//       )}</td></tr>
//       <tr><th>OTP</th><td>${newOrder.otp}</td></tr>
//       <tr><th>Status</th><td>${newOrder.status}</td></tr>
//       <tr><th>Payment ID</th><td>${newOrder.payment_id}</td></tr>
//       <tr><th>Created At</th><td>${newOrder.created_at}</td></tr>
//     </table>
//     <br/>
//     <p>We’ll notify you once it’s ready for pickup!</p>
//   `;

//     await transporter.sendMail({
//       from: `"Aditya Foods" <${process.env.EMAIL_USER}>`,
//       to: userEmail,
//       subject: "Order Placed Successfully",
//       html,
//     });
//   }

app.post("/place-order", async (req, res) => {
  console.log("Received order request");

  try {
    const {
      userEmail,
      userName,
      userPhone,
      items,
      totalAmount,
      status,
      userId,
      payment_id,
      canteen_name,
    } = req.body;

    console.log("Extracted order fields from request body");

    if (
      !userEmail ||
      !userName ||
      !userPhone ||
      !items ||
      !totalAmount ||
      !status ||
      !userId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = await getNextSequence();
    console.log("Generated order ID:", id);
    console.log(canteen_name, "here in the backend");
    const newOrder = await Order.create({
      id,
      user_email: userEmail,
      user_name: userName,
      user_phone: userPhone,
      items,
      total_amount: totalAmount,
      status,
      created_at: Date.now(),
      user_id: userId,
      otp: Math.floor(1000 + Math.random() * 9000),
      payment_id,
      canteen_name: canteen_name,
    });

    console.log("Order created in DB:", newOrder.id);

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      console.log("User not found for ID:", userId);
    }

    // if (user?.device_token) {
    //   console.log(
    //     "Sending push notification to device token:",
    //     user.device_token
    //   );
    //   try {
    //     await sendPushNotification(
    //       user.device_token,
    //       "Your order has been placed successfully!"
    //     );
    //     console.log("Push notification sent successfully");
    //   } catch (notifyErr) {
    //     console.error("Error sending push notification:", notifyErr.message);
    //   }
    // } else {
    //   console.log("No device token found for user:", userId);
    // }

    // try {
    //   await sendOrderPlacedEmail(
    //     userEmail,
    //     userName,
    //     userPhone,
    //     items,
    //     totalAmount,
    //     status,
    //     userId,
    //     payment_id,
    //     newOrder
    //   );
    //   console.log("Order confirmation email sent");
    // } catch (mailErr) {
    //   console.error("Error sending email:", mailErr.message);
    // }

    console.log("Order process completed");
    res.json({ success: true, orderId: newOrder.id });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({ error: "Server error while placing order" });
  }
  console.log("ordered ");
  // console.log(newOrder);
});
// async function sendOrderPlacedEmail(
//   userEmail,
//   userName,
//   userPhone,
//   items,
//   totalAmount,
//   status,
//   userId,
//   payment_id,
//   newOrder
// ) {
//   const html = `
//     <h2>Hi ${userName}, your order has been placed successfully!</h2>
//     <p>Here are the order details:</p>
//     <table border="1" cellspacing="0" cellpadding="5">
//       <tr><th>Order ID</th><td>${newOrder.id}</td></tr>
//       <tr><th>User Email</th><td>${userEmail}</td></tr>
//       <tr><th>Items</th><td>${items}</td></tr>
//       <tr><th>Total Amount</th><td>₹${parseFloat(totalAmount).toFixed(2)}</td></tr>
//       <tr><th>OTP</th><td>${newOrder.otp}</td></tr>
//       <tr><th>Status</th><td>${newOrder.status}</td></tr>
//       <tr><th>Payment ID</th><td>${newOrder.payment_id}</td></tr>
//       <tr><th>Created At</th><td>${new Date(newOrder.created_at).toLocaleString()}</td></tr>
//     </table>
//     <br/>
//     <p>We’ll notify you once it’s ready for pickup!</p>
//   `;

//   await transporter.sendMail({
//     from: `"Aditya Foods" <${process.env.EMAIL_USER}>`,
//     to: userEmail,
//     subject: "Order Placed Successfully",
//     html,
//   });
// }

// if (status === "pending") {
//   await sendOrderDeliveredEmail(order.user_email, order._id);
// }

app.patch("/orders/:id", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  console.log("data fetched to backend");

  const order = await Order.findById(id);
  if (!order) {
    console.log("order not found elley ");
    return res.status(404).json({ error: "Order not found" });
  }
  console.log("order found for now");
  await Order.findByIdAndUpdate(id, { status });
  const user = await User.findOne({ user_email: order.user_email }); // adjust this if your user relation is different
  // if (user?.device_token) {
  //   let notificationTitle = "Order Update";
  //   let notificationBody = "";

  //   if (status === "accepted") {
  //     notificationBody = "Your order is ready to pick up!";
  //   } else if (status === "delivered") {
  //     notificationBody = "Your order has been delivered!";
  //   }

  //   if (notificationBody) {
  //     await sendPushNotification(
  //       user.device_token,
  //       notificationTitle,
  //       notificationBody
  //     );
  //   }
  // }
  // if (status === "delivered") {
  //   await sendOrderDeliveredEmail(order.user_email, order._id);
  // }

  // mail to user
  async function sendOrderDeliveredEmail(order) {
    const html = `
    <h3>🎉 Order Delivered!</h3>
    <p>Your order with <strong>ID: ${id}</strong> has been successfully delivered.</p>
    <p>Thank you for ordering with us!</p>
  `;

    await transporter.sendMail({
      from: `"Aditya Foods" <${process.env.EMAIL_USER}>`,
      to: order.user_email,
      subject: "Your Order Has Been Delivered",
      html,
    });
  }

  res.json({ success: true, message: "Order status updated successfully" });
  console.log("success order");
});

app.get("/", (req, res) => {
  res.send("Welcome to My Server running on port 3500!");
});

const PORT = process.env.PORT || 3500;
// const cors = require("cors");
app.use(cors());

app.listen(3500, "0.0.0.0", () => {
  console.log("Server running");
});
