import { useState } from 'react';
import { teamApi } from '../../../services/team/api';
import {
  Requirement, Architecture, Design, Implementation, ProjectTask, CodeRepo, Issue, Meeting,
  RequirementForm, ArchitectureForm, DesignForm, ImplementationForm, TaskForm, RepoForm, IssueForm, MeetingForm,
  Team
} from '../types/team.types';

export function useProject() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [codeRepos, setCodeRepos] = useState<CodeRepo[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [reqForm, setReqForm] = useState<RequirementForm>({ title: '', description: '', priority: 'medium', status: 'draft' });
  const [archForm, setArchForm] = useState<ArchitectureForm>({ title: '', description: '', diagram_url: '' });
  const [designForm, setDesignForm] = useState<DesignForm>({ title: '', description: '', mockup_url: '' });
  const [implForm, setImplForm] = useState<ImplementationForm>({ title: '', description: '', status: 'planned', progress: 0 });
  const [taskForm, setTaskForm] = useState<TaskForm>({ title: '', description: '', assignee: '', status: 'todo', priority: 'medium' });
  const [repoForm, setRepoForm] = useState<RepoForm>({ name: '', url: '', branch: 'main', description: '' });
  const [issueForm, setIssueForm] = useState<IssueForm>({ title: '', description: '', severity: 'medium', status: 'open', assignee: '' });
  const [meetingForm, setMeetingForm] = useState<MeetingForm>({ title: '', date: '', time: '', agenda: '', notes: '' });

  const loadProjectData = async (selectedTeam: Team | null) => {
    if (!selectedTeam) return;
    try {
      const [reqs, archs, desgs, impls, tsks, cds, iss, mtgs] = await Promise.all([
        teamApi.getRequirements(selectedTeam.id),
        teamApi.getArchitecture(selectedTeam.id),
        teamApi.getDesign(selectedTeam.id),
        teamApi.getImplementation(selectedTeam.id),
        teamApi.getTasks(selectedTeam.id),
        teamApi.getCode(selectedTeam.id),
        teamApi.getIssues(selectedTeam.id),
        teamApi.getMeetings(selectedTeam.id)
      ]);
      setRequirements(reqs);
      setArchitectures(archs);
      setDesigns(desgs);
      setImplementations(impls);
      setProjectTasks(tsks);
      setCodeRepos(cds);
      setIssues(iss);
      setMeetings(mtgs);
    } catch (err) {
      console.error('Failed to load project data');
    }
  };

  // Requirements CRUD
  const addRequirement = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !reqForm.title) return;
    try {
      const item = await teamApi.createRequirement(selectedTeam.id, reqForm);
      setRequirements([item, ...requirements]);
      setReqForm({ title: '', description: '', priority: 'medium', status: 'draft' });
    } catch (err) {
      console.error('Failed to add requirement');
    }
  };

  const updateRequirement = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateRequirement(selectedTeam.id, id, data);
      setRequirements(requirements.map(r => r._id === id ? updated : r));
    } catch (err) {
      console.error('Failed to update requirement');
    }
  };

  const deleteRequirement = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteRequirement(selectedTeam.id, id);
      setRequirements(requirements.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete requirement');
    }
  };

  // Architecture CRUD
  const addArchitecture = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !archForm.title) return;
    try {
      const item = await teamApi.createArchitecture(selectedTeam.id, archForm);
      setArchitectures([item, ...architectures]);
      setArchForm({ title: '', description: '', diagram_url: '' });
    } catch (err) {
      console.error('Failed to add architecture');
    }
  };

  const updateArchitecture = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateArchitecture(selectedTeam.id, id, data);
      setArchitectures(architectures.map(a => a._id === id ? updated : a));
    } catch (err) {
      console.error('Failed to update architecture');
    }
  };

  const deleteArchitecture = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteArchitecture(selectedTeam.id, id);
      setArchitectures(architectures.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete architecture');
    }
  };

  // Design CRUD
  const addDesign = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !designForm.title) return;
    try {
      const item = await teamApi.createDesign(selectedTeam.id, designForm);
      setDesigns([item, ...designs]);
      setDesignForm({ title: '', description: '', mockup_url: '' });
    } catch (err) {
      console.error('Failed to add design');
    }
  };

  const updateDesign = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateDesign(selectedTeam.id, id, data);
      setDesigns(designs.map(d => d._id === id ? updated : d));
    } catch (err) {
      console.error('Failed to update design');
    }
  };

  const deleteDesign = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteDesign(selectedTeam.id, id);
      setDesigns(designs.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete design');
    }
  };

  // Implementation CRUD
  const addImplementation = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !implForm.title) return;
    try {
      const item = await teamApi.createImplementation(selectedTeam.id, implForm);
      setImplementations([item, ...implementations]);
      setImplForm({ title: '', description: '', status: 'planned', progress: 0 });
    } catch (err) {
      console.error('Failed to add implementation');
    }
  };

  const updateImplementation = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateImplementation(selectedTeam.id, id, data);
      setImplementations(implementations.map(i => i._id === id ? updated : i));
    } catch (err) {
      console.error('Failed to update implementation');
    }
  };

  const deleteImplementation = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteImplementation(selectedTeam.id, id);
      setImplementations(implementations.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete implementation');
    }
  };

  // Task CRUD
  const addTask = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !taskForm.title) return;
    try {
      const item = await teamApi.createTask(selectedTeam.id, taskForm);
      setProjectTasks([item, ...projectTasks]);
      setTaskForm({ title: '', description: '', assignee: '', status: 'todo', priority: 'medium' });
    } catch (err) {
      console.error('Failed to add task');
    }
  };

  const updateTask = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateTask(selectedTeam.id, id, data);
      setProjectTasks(projectTasks.map(t => t._id === id ? updated : t));
    } catch (err) {
      console.error('Failed to update task');
    }
  };

  const deleteTask = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteTask(selectedTeam.id, id);
      setProjectTasks(projectTasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task');
    }
  };

  // Code CRUD
  const addCode = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !repoForm.name) return;
    try {
      const item = await teamApi.createCode(selectedTeam.id, repoForm);
      setCodeRepos([item, ...codeRepos]);
      setRepoForm({ name: '', url: '', branch: 'main', description: '' });
    } catch (err) {
      console.error('Failed to add code');
    }
  };

  const updateCode = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateCode(selectedTeam.id, id, data);
      setCodeRepos(codeRepos.map(c => c._id === id ? updated : c));
    } catch (err) {
      console.error('Failed to update code');
    }
  };

  const deleteCode = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteCode(selectedTeam.id, id);
      setCodeRepos(codeRepos.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete code');
    }
  };

  // Issue CRUD
  const addIssue = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !issueForm.title) return;
    try {
      const item = await teamApi.createIssue(selectedTeam.id, issueForm);
      setIssues([item, ...issues]);
      setIssueForm({ title: '', description: '', severity: 'medium', status: 'open', assignee: '' });
    } catch (err) {
      console.error('Failed to add issue');
    }
  };

  const updateIssue = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateIssue(selectedTeam.id, id, data);
      setIssues(issues.map(i => i._id === id ? updated : i));
    } catch (err) {
      console.error('Failed to update issue');
    }
  };

  const deleteIssue = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteIssue(selectedTeam.id, id);
      setIssues(issues.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete issue');
    }
  };

  // Meeting CRUD
  const addMeeting = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !meetingForm.title) return;
    try {
      const item = await teamApi.createMeeting(selectedTeam.id, meetingForm);
      setMeetings([item, ...meetings]);
      setMeetingForm({ title: '', date: '', time: '', agenda: '', notes: '' });
    } catch (err) {
      console.error('Failed to add meeting');
    }
  };

  const updateMeeting = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateMeeting(selectedTeam.id, id, data);
      setMeetings(meetings.map(m => m._id === id ? updated : m));
    } catch (err) {
      console.error('Failed to update meeting');
    }
  };

  const deleteMeeting = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteMeeting(selectedTeam.id, id);
      setMeetings(meetings.filter(m => m._id !== id));
    } catch (err) {
      console.error('Failed to delete meeting');
    }
  };

  return {
    requirements, setRequirements, reqForm, setReqForm, addRequirement, updateRequirement, deleteRequirement,
    architectures, setArchitectures, archForm, setArchForm, addArchitecture, updateArchitecture, deleteArchitecture,
    designs, setDesigns, designForm, setDesignForm, addDesign, updateDesign, deleteDesign,
    implementations, setImplementations, implForm, setImplForm, addImplementation, updateImplementation, deleteImplementation,
    projectTasks, setProjectTasks, taskForm, setTaskForm, addTask, updateTask, deleteTask,
    codeRepos, setCodeRepos, repoForm, setRepoForm, addCode, updateCode, deleteCode,
    issues, setIssues, issueForm, setIssueForm, addIssue, updateIssue, deleteIssue,
    meetings, setMeetings, meetingForm, setMeetingForm, addMeeting, updateMeeting, deleteMeeting,
    loadProjectData
  };
}
