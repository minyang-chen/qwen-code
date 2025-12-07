import { Request, Response } from 'express';
import { mongoService } from '../services/mongoService';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.mongo;

const COLLECTIONS = {
  requirements: 'project_requirements',
  architecture: 'project_architecture',
  design: 'project_design',
  implementation: 'project_implementation',
  tasks: 'project_tasks',
  code: 'project_code',
  issues: 'project_issues',
  meetings: 'project_meetings'
};

// Generic get handler
const getItems = (collectionName: string) => async (req: Request, res: Response) => {
  let client;
  try {
    const teamId = req.params.teamId;
    if (!teamId) return res.status(400).json({ error: 'Team ID required' });
    
    const { client: c, db } = await mongoService.getTeamDatabase(teamId);
    client = c;
    const items = await db.collection(collectionName).find().sort({ created_at: -1 }).toArray();
    res.json(items);
  } catch (error) {
    console.error(`Get ${collectionName} error:`, error);
    res.status(500).json({ error: `Failed to fetch ${collectionName}` });
  } finally {
    if (client) await client.close();
  }
};

// Generic create handler
const createItem = (collectionName: string) => async (req: Request, res: Response) => {
  let client;
  try {
    const teamId = req.params.teamId;
    if (!teamId) return res.status(400).json({ error: 'Team ID required' });
    
    const { client: c, db } = await mongoService.getTeamDatabase(teamId);
    client = c;
    const result = await db.collection(collectionName).insertOne({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const item = await db.collection(collectionName).findOne({ _id: result.insertedId });
    res.json(item);
  } catch (error) {
    console.error(`Create ${collectionName} error:`, error);
    res.status(500).json({ error: `Failed to create ${collectionName}` });
  } finally {
    if (client) await client.close();
  }
};

// Generic update handler
const updateItem = (collectionName: string) => async (req: Request, res: Response) => {
  let client;
  try {
    const { teamId, id } = req.params;
    if (!teamId || !id) return res.status(400).json({ error: 'Team ID and item ID required' });
    
    const { client: c, db } = await mongoService.getTeamDatabase(teamId);
    client = c;
    const { _id, created_at, ...updateData } = req.body;
    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updated_at: new Date() } }
    );
    
    const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    res.json(item);
  } catch (error) {
    console.error(`Update ${collectionName} error:`, error);
    res.status(500).json({ error: `Failed to update ${collectionName}` });
  } finally {
    if (client) await client.close();
  }
};

// Generic delete handler
const deleteItem = (collectionName: string) => async (req: Request, res: Response) => {
  let client;
  try {
    const { teamId, id } = req.params;
    if (!teamId || !id) return res.status(400).json({ error: 'Team ID and item ID required' });
    
    const { client: c, db } = await mongoService.getTeamDatabase(teamId);
    client = c;
    await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    console.error(`Delete ${collectionName} error:`, error);
    res.status(500).json({ error: `Failed to delete ${collectionName}` });
  } finally {
    if (client) await client.close();
  }
};

// Export all CRUD operations for each collection
export const projectController = {
  requirements: {
    get: getItems(COLLECTIONS.requirements),
    create: createItem(COLLECTIONS.requirements),
    update: updateItem(COLLECTIONS.requirements),
    delete: deleteItem(COLLECTIONS.requirements)
  },
  architecture: {
    get: getItems(COLLECTIONS.architecture),
    create: createItem(COLLECTIONS.architecture),
    update: updateItem(COLLECTIONS.architecture),
    delete: deleteItem(COLLECTIONS.architecture)
  },
  design: {
    get: getItems(COLLECTIONS.design),
    create: createItem(COLLECTIONS.design),
    update: updateItem(COLLECTIONS.design),
    delete: deleteItem(COLLECTIONS.design)
  },
  implementation: {
    get: getItems(COLLECTIONS.implementation),
    create: createItem(COLLECTIONS.implementation),
    update: updateItem(COLLECTIONS.implementation),
    delete: deleteItem(COLLECTIONS.implementation)
  },
  tasks: {
    get: getItems(COLLECTIONS.tasks),
    create: createItem(COLLECTIONS.tasks),
    update: updateItem(COLLECTIONS.tasks),
    delete: deleteItem(COLLECTIONS.tasks)
  },
  code: {
    get: getItems(COLLECTIONS.code),
    create: createItem(COLLECTIONS.code),
    update: updateItem(COLLECTIONS.code),
    delete: deleteItem(COLLECTIONS.code)
  },
  issues: {
    get: getItems(COLLECTIONS.issues),
    create: createItem(COLLECTIONS.issues),
    update: updateItem(COLLECTIONS.issues),
    delete: deleteItem(COLLECTIONS.issues)
  },
  meetings: {
    get: getItems(COLLECTIONS.meetings),
    create: createItem(COLLECTIONS.meetings),
    update: updateItem(COLLECTIONS.meetings),
    delete: deleteItem(COLLECTIONS.meetings)
  }
};
