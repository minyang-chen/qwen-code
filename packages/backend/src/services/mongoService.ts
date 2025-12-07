import mongoose from 'mongoose';
import { MONGO_URL } from '../config/env';

const { MongoClient } = mongoose.mongo;

export const mongoService = {
  async createUserDatabase(userId: string) {
    const dbName = `user_${userId.replace(/-/g, '_')}`;
    const client = new MongoClient(MONGO_URL);
    
    try {
      await client.connect();
      const db = client.db(dbName);
      
      await db.createCollection('tasks');
      await db.createCollection('todos');
      await db.createCollection('chat_sessions');
      await db.createCollection('projects');
      
      await db.collection('tasks').createIndex({ created_at: -1 });
      await db.collection('chat_sessions').createIndex({ created_at: -1 });
      
      return dbName;
    } finally {
      await client.close();
    }
  },

  async createTeamDatabase(teamId: string) {
    const dbName = `team_${teamId.replace(/-/g, '_')}`;
    const client = new MongoClient(MONGO_URL);
    
    try {
      await client.connect();
      const db = client.db(dbName);
      
      await db.createCollection('tasks');
      await db.createCollection('projects');
      await db.createCollection('chat_sessions');
      await db.createCollection('documents');
      await db.createCollection('notifications');
      
      await db.collection('tasks').createIndex({ created_at: -1 });
      await db.collection('projects').createIndex({ created_at: -1 });
      await db.collection('chat_sessions').createIndex({ created_at: -1 });
      await db.collection('notifications').createIndex({ created_at: -1 });
      
      return dbName;
    } finally {
      await client.close();
    }
  },

  async getUserDatabase(userId: string) {
    const dbName = `user_${userId.replace(/-/g, '_')}`;
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    return { client, db: client.db(dbName) };
  },

  async getTeamDatabase(teamId: string) {
    const dbName = `team_${teamId.replace(/-/g, '_')}`;
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    return { client, db: client.db(dbName) };
  }
};
