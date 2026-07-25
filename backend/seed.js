require('dotenv').config();
const { initDB } = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await initDB();

    const existing = User.findByEmail('admin@fibextelecom.com');
    if (existing) {
      console.log('El admin ya existe');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = User.create({
      nombre: 'Administrador Sistemas',
      email: 'admin@fibextelecom.com',
      password: hashedPassword,
      rol: 'admin',
      departamento: 'Sistemas'
    });

    console.log('Admin creado exitosamente:');
    console.log('  Email: admin@fibextelecom.com');
    console.log('  Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
