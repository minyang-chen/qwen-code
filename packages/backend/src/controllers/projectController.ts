import { Request, Response } from 'express';
import { mongoService } from '../services/mongoService';
import { projectService } from '../services/projectService';
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
  // Project management
  project: {
    create: async (req: Request, res: Response) => {
      try {
        const teamId = req.params.teamId;
        if (!teamId) return res.status(400).json({ success: false, error: 'Team ID required' });
        const project = await projectService.createProject(teamId, { ...req.body, teamId });
        res.json({ success: true, data: project });
      } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ success: false, error: 'Failed to create project' });
      }
    },
    get: async (req: Request, res: Response) => {
      try {
        const { teamId, projectId } = req.params;
        if (!teamId || !projectId) return res.status(400).json({ error: 'Team ID and Project ID required' });
        const project = await projectService.getProject(teamId, projectId);
        res.json(project);
      } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
      }
    },
    update: async (req: Request, res: Response) => {
      try {
        const { teamId, projectId } = req.params;
        if (!teamId || !projectId) return res.status(400).json({ error: 'Team ID and Project ID required' });
        const project = await projectService.updateProject(teamId, projectId, req.body);
        res.json(project);
      } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project' });
      }
    },
    list: async (req: Request, res: Response) => {
      try {
        const teamId = req.params.teamId;
        if (!teamId) return res.status(400).json({ error: 'Team ID required' });
        const projects = await projectService.listProjects(teamId);
        res.json(projects);
      } catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({ error: 'Failed to list projects' });
      }
    }
  },
  
  // Project sections
  section: {
    create: async (req: Request, res: Response) => {
      try {
        const teamId = req.params.teamId;
        if (!teamId) return res.status(400).json({ error: 'Team ID required' });
        const section = await projectService.createSection(teamId, { ...req.body, teamId });
        res.json(section);
      } catch (error) {
        console.error('Create section error:', error);
        res.status(500).json({ error: 'Failed to create section' });
      }
    },
    get: async (req: Request, res: Response) => {
      try {
        const { teamId, sectionId } = req.params;
        if (!teamId || !sectionId) return res.status(400).json({ error: 'Team ID and Section ID required' });
        const section = await projectService.getSection(teamId, sectionId);
        res.json(section);
      } catch (error) {
        console.error('Get section error:', error);
        res.status(500).json({ error: 'Failed to fetch section' });
      }
    },
    update: async (req: Request, res: Response) => {
      try {
        const { teamId, sectionId } = req.params;
        if (!teamId || !sectionId) return res.status(400).json({ error: 'Team ID and Section ID required' });
        const section = await projectService.updateSection(teamId, sectionId, req.body);
        res.json(section);
      } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ error: 'Failed to update section' });
      }
    },
    list: async (req: Request, res: Response) => {
      try {
        const { teamId, projectId } = req.params;
        if (!teamId || !projectId) return res.status(400).json({ error: 'Team ID and Project ID required' });
        const sections = await projectService.listSections(teamId, projectId);
        res.json(sections);
      } catch (error) {
        console.error('List sections error:', error);
        res.status(500).json({ error: 'Failed to list sections' });
      }
    }
  },
  
  // Project stats
  stats: {
    create: async (req: Request, res: Response) => {
      try {
        const teamId = req.params.teamId;
        if (!teamId) return res.status(400).json({ error: 'Team ID required' });
        const stats = await projectService.createStats(teamId, { ...req.body, teamId });
        res.json(stats);
      } catch (error) {
        console.error('Create stats error:', error);
        res.status(500).json({ error: 'Failed to create stats' });
      }
    },
    get: async (req: Request, res: Response) => {
      try {
        const { teamId, projectId } = req.params;
        if (!teamId || !projectId) return res.status(400).json({ error: 'Team ID and Project ID required' });
        const stats = await projectService.getStats(teamId, projectId);
        res.json(stats);
      } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
      }
    },
    update: async (req: Request, res: Response) => {
      try {
        const { teamId, projectId } = req.params;
        if (!teamId || !projectId) return res.status(400).json({ error: 'Team ID and Project ID required' });
        const stats = await projectService.updateStats(teamId, projectId, req.body);
        res.json(stats);
      } catch (error) {
        console.error('Update stats error:', error);
        res.status(500).json({ error: 'Failed to update stats' });
      }
    }
  },

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
