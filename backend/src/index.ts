import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('📦 Connected to Database');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to DB', error);
    process.exit(1);
  }
};

startServer();
