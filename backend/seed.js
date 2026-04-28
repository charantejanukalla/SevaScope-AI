const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Report = require('./models/Report');
const Volunteer = require('./models/Volunteer');
const Match = require('./models/Match');

// Load env variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sevascope');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Report.deleteMany();
    await Volunteer.deleteMany();
    await Match.deleteMany();

    console.log('Data cleared.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const ngoUser = await User.create({
      name: 'NGO Admin',
      email: 'ngo@test.com',
      password,
      role: 'NGO'
    });

    const volunteers = [];
    for (let i = 1; i <= 8; i++) {
      const vUser = await User.create({
        name: `Volunteer ${i}`,
        email: `volunteer${i}@test.com`,
        password,
        role: 'VOLUNTEER'
      });
      volunteers.push(vUser);
    }
    console.log('Users created.');

    // 2. Create Volunteer Profiles
    const skillsList = [['medical'], ['food'], ['water'], ['logistics'], ['medical', 'food'], ['water', 'logistics']];
    for (let i = 0; i < volunteers.length; i++) {
      const lat = 16.50 + (Math.random() - 0.5) * 0.1;
      const lng = 80.64 + (Math.random() - 0.5) * 0.1;

      await Volunteer.create({
        name: volunteers[i].name,
        email: volunteers[i].email,
        skills: skillsList[i % skillsList.length],
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        availability: 1,
        userId: volunteers[i]._id
      });
    }
    console.log('Volunteers created.');

    // 3. Create Report Data
    const reports = [];
    
    // Helper to generate clustered reports
    const createReports = (count, category, minSev, maxSev, baseLat, baseLng) => {
      for (let i = 0; i < count; i++) {
        const severity = Math.floor(Math.random() * (maxSev - minSev + 1)) + minSev;
        const lat = baseLat + (Math.random() - 0.5) * 0.02; // Roughly ±0.01 degrees
        const lng = baseLng + (Math.random() - 0.5) * 0.02; // Roughly ±0.01 degrees

        reports.push({
          description: `Auto-generated test report for ${category} cluster`,
          category,
          severity,
          location: { lat, lng },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Spread over last 7 days for trend insights
        });
      }
    };

    // Cluster 1 — Water Crisis (High Priority)
    createReports(10, 'water', 4, 5, 16.50, 80.64);
    
    // Cluster 2 — Health Issues
    createReports(8, 'health', 4, 5, 16.52, 80.66);
    
    // Cluster 3 — Food Shortage
    createReports(6, 'food', 3, 4, 16.48, 80.62);

    await Report.insertMany(reports);
    console.log('Reports created.');

    // 4. Create Optional Match Data
    const volDocs = await Volunteer.find();
    if (volDocs.length > 0) {
      await Match.create({
        areaLat: 16.50,
        areaLng: 80.64,
        volunteerId: volDocs[0]._id,
        score: 4.8,
        assignedBy: ngoUser._id,
        status: 'notified'
      });
      console.log('Matches created.');
    }

    console.log('Seeding completed successfully!');
    process.exit();

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
