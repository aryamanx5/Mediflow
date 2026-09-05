const User = require("../models/user");

// A single shared, read-only account so a deployed instance can be explored
// without signing up. Credentials are public on purpose.
const DEMO_EMAIL = (process.env.DEMO_EMAIL || "demo@mediversal.com").toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo1234";
const DEMO_NAME = process.env.DEMO_NAME || "Demo User";

// Shown whenever the demo account tries to change something.
const DEMO_MESSAGE =
  "You are signed in to the demo account. Please sign in with your own account to do that.";

// Shown when there is no token at all.
const SIGN_IN_MESSAGE = "Please sign in to do that.";

// Creates the demo user on boot if it isn't there yet.
const seedDemoUser = async () => {
  try {
    const existing = await User.findOne({ email: DEMO_EMAIL });

    if (existing) {
      // Keep the flag in place even if the row predates this feature.
      if (!existing.isDemo) {
        existing.isDemo = true;
        await existing.save();
      }

      console.log(`🧪 Demo account ready: ${DEMO_EMAIL}`);
      return existing;
    }

    const user = await User.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      role: "User",
      isDemo: true,
    });

    console.log(`🧪 Demo account created: ${DEMO_EMAIL}`);
    return user;
  } catch (error) {
    // A missing demo account must never stop the server from starting.
    console.error("⚠️  Could not seed the demo account");
    console.error(error.message);
    return null;
  }
};

module.exports = {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_NAME,
  DEMO_MESSAGE,
  SIGN_IN_MESSAGE,
  seedDemoUser,
};
