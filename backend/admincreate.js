const connectDB = require('./config/db');
async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('🚀 Admin user created successfully');
}

// after connectDB()
connectDB(process.env.MONGO_URI).then(createAdmin);