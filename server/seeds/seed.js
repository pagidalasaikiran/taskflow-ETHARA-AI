const config = require('../config/config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const MONGODB_URI = config.MONGODB_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Jane Member',
      email: 'member@demo.com',
      password: 'member123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'John Developer',
      email: 'john@demo.com',
      password: 'member123',
      role: 'member',
    });

    console.log('👤 Created demo users');

    // Create sample projects
    const project1 = await Project.create({
      title: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and improved UX.',
      createdBy: admin._id,
      teamMembers: [admin._id, member1._id, member2._id],
      status: 'active',
    });

    const project2 = await Project.create({
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile application for customer engagement.',
      createdBy: admin._id,
      teamMembers: [admin._id, member1._id],
      status: 'active',
    });

    console.log('📁 Created sample projects');

    // Create sample tasks
    const now = new Date();
    const tasks = [
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the homepage.',
        priority: 'high',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        assignedTo: member1._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a mobile-friendly navigation component.',
        priority: 'high',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'in-progress',
        assignedTo: member2._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline.',
        priority: 'medium',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // overdue
        status: 'todo',
        assignedTo: member2._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Write unit tests for auth module',
        description: 'Achieve 80% code coverage on the authentication module.',
        priority: 'medium',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'todo',
        assignedTo: member1._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Design app onboarding flow',
        description: 'Create onboarding screens for new users.',
        priority: 'high',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'in-progress',
        assignedTo: member1._id,
        project: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'Set up React Native project',
        description: 'Initialize project with necessary dependencies and folder structure.',
        priority: 'high',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // overdue
        status: 'completed',
        assignedTo: member2._id,
        project: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement push notifications',
        description: 'Integrate Firebase for push notification support.',
        priority: 'low',
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'todo',
        assignedTo: member1._id,
        project: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'API integration for user profile',
        description: 'Connect the user profile screen to the backend API.',
        priority: 'medium',
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // due tomorrow
        status: 'in-progress',
        assignedTo: member2._id,
        project: project2._id,
        createdBy: admin._id,
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log('✅ Created sample tasks');

    // Create sample activities
    const activities = [
      { user: admin._id, action: 'created', entityType: 'project', entityId: project1._id, details: 'Created project "Website Redesign"' },
      { user: admin._id, action: 'created', entityType: 'project', entityId: project2._id, details: 'Created project "Mobile App Development"' },
      { user: admin._id, action: 'added_member', entityType: 'member', entityId: project1._id, details: 'Added Jane Member to "Website Redesign"' },
      { user: member1._id, action: 'status_changed', entityType: 'task', entityId: createdTasks[0]._id, details: 'Changed task "Design homepage mockup" to completed' },
      { user: member2._id, action: 'status_changed', entityType: 'task', entityId: createdTasks[1]._id, details: 'Changed task "Implement responsive navigation" to in-progress' },
    ];

    await Activity.insertMany(activities);
    console.log('📋 Created sample activities');

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📧 Demo Accounts:');
    console.log('   Admin: admin@demo.com / admin123');
    console.log('   Member: member@demo.com / member123');
    console.log('   Member: john@demo.com / member123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
