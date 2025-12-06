import { Request, Response } from 'express';
import { mongoService } from '../services/mongoService';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.mongo;

export const getTodos = async (req: Request, res: Response) => {
  let client;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { client: c, db } = await mongoService.getUserDatabase(userId);
    client = c;
    const todos = await db.collection('todos').find().sort({ created_at: -1 }).toArray();
    
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  } finally {
    if (client) await client.close();
  }
};

export const createTodo = async (req: Request, res: Response) => {
  let client;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const { client: c, db } = await mongoService.getUserDatabase(userId);
    client = c;
    const result = await db.collection('todos').insertOne({
      text: text.trim(),
      completed: false,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const todo = await db.collection('todos').findOne({ _id: result.insertedId });
    
    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  } finally {
    if (client) await client.close();
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  let client;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { id } = req.params;
    const { text, completed } = req.body;
    
    const { client: c, db } = await mongoService.getUserDatabase(userId);
    client = c;
    const update: any = { updated_at: new Date() };
    if (text !== undefined) update.text = text.trim();
    if (completed !== undefined) update.completed = completed;
    
    await db.collection('todos').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    
    const todo = await db.collection('todos').findOne({ _id: new ObjectId(id) });
    
    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  } finally {
    if (client) await client.close();
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  let client;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { id } = req.params;
    
    const { client: c, db } = await mongoService.getUserDatabase(userId);
    client = c;
    await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  } finally {
    if (client) await client.close();
  }
};
