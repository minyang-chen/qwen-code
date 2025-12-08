import { useState } from 'react';
import { teamApi } from '../../../services/team/api';
import {
  Requirement, Architecture, Design, Implementation, ProjectTask, CodeRepo, Issue, Meeting,
  RequirementForm, ArchitectureForm, DesignForm, ImplementationForm, TaskForm, RepoForm, IssueForm, MeetingForm,
  Team
} from '../types/team.types';

export function useProject() {
  const [projects, setProjects] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [codeRepos, setCodeRepos] = useState<CodeRepo[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [projectForm, setProjectForm] = useState({ 
    name: '', description: '', status: '', manager: '', startDate: '', endDate: '', deadline: '', 
    budget: '', marketSegments: '', products: '', targetUser: '', sponsor: '', funding: '', 
    dependencies: '', approvals: [] as string[], teams: [] as string[], members: [] as string[] 
  });

  // Helper to get active project ID
  const getActiveProjectId = () => {
    try {
      const activeProject = sessionStorage.getItem('activeProject');
      return activeProject ? JSON.parse(activeProject).projectId : null;
    } catch {
      return null;
    }
  };
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

  // Projects CRUD
  const addProject = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !projectForm.name) return;
    try {
      const uniqueId = `PRJ-${Date.now().toString(36).toUpperCase()}`;
      const item = { 
        _id: Date.now().toString(), 
        projectId: uniqueId,
        ...projectForm,
        approvals: projectForm.approvals || [],
        teams: projectForm.teams || [],
        members: projectForm.members || []
      };
      setProjects([item, ...projects]);
      setProjectForm({ name: '', description: '', status: '', manager: '', startDate: '', endDate: '', deadline: '', budget: '', marketSegments: '', products: '', targetUser: '', sponsor: '', funding: '', dependencies: '', approvals: [], teams: [], members: [] });
    } catch (err) {
      console.error('Failed to add project');
    }
  };

  const updateProject = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setProjects(projects.map(p => p._id === id ? data : p));
    } catch (err) {
      console.error('Failed to update project');
    }
  };

  const deleteProject = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete project');
    }
  };

  // Plans CRUD
  const [plans, setPlans] = useState<any[]>([]);
  const [planForm, setPlanForm] = useState({ phase: '', milestone: '', startDate: '', endDate: '' });

  const addPlan = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !planForm.phase) return;
    try {
      const item = { _id: Date.now().toString(), projectId: getActiveProjectId(), ...planForm };
      setPlans([item, ...plans]);
      setPlanForm({ phase: '', milestone: '', startDate: '', endDate: '' });
    } catch (err) {
      console.error('Failed to add plan');
    }
  };

  const updatePlan = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setPlans(plans.map(p => p._id === id ? data : p));
    } catch (err) {
      console.error('Failed to update plan');
    }
  };

  const deletePlan = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setPlans(plans.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete plan');
    }
  };

  // Deliverables CRUD
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [deliverableForm, setDeliverableForm] = useState({ name: '', type: '', dueDate: '', status: '' });

  const addDeliverable = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !deliverableForm.name) return;
    try {
      const item = { _id: Date.now().toString(), projectId: getActiveProjectId(), ...deliverableForm };
      setDeliverables([item, ...deliverables]);
      setDeliverableForm({ name: '', type: '', dueDate: '', status: '' });
    } catch (err) {
      console.error('Failed to add deliverable');
    }
  };

  const updateDeliverable = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setDeliverables(deliverables.map(d => d._id === id ? data : d));
    } catch (err) {
      console.error('Failed to update deliverable');
    }
  };

  const deleteDeliverable = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setDeliverables(deliverables.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete deliverable');
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

  // Analyses CRUD
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [analysisForm, setAnalysisForm] = useState({ title: '', type: '', findings: '', date: '' });

  const addAnalysis = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !analysisForm.title) return;
    try {
      const item = { _id: Date.now().toString(), projectId: getActiveProjectId(), ...analysisForm };
      setAnalyses([item, ...analyses]);
      setAnalysisForm({ title: '', type: '', findings: '', date: '' });
    } catch (err) {
      console.error('Failed to add analysis');
    }
  };

  const updateAnalysis = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setAnalyses(analyses.map(a => a._id === id ? data : a));
    } catch (err) {
      console.error('Failed to update analysis');
    }
  };

  const deleteAnalysis = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setAnalyses(analyses.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete analysis');
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

  // Notes state and CRUD
  const [notes, setNotes] = useState<any[]>([]);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: '', date: '' });

  const addNote = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !noteForm.title) return;
    try {
      const item = { _id: Date.now().toString(), projectId: getActiveProjectId(), ...noteForm };
      setNotes([item, ...notes]);
      setNoteForm({ title: '', content: '', category: '', date: '' });
    } catch (err) {
      console.error('Failed to add note');
    }
  };

  const updateNote = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setNotes(notes.map(n => n._id === id ? data : n));
    } catch (err) {
      console.error('Failed to update note');
    }
  };

  const deleteNote = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete note');
    }
  };

  // Research state and CRUD
  const [research, setResearch] = useState<any[]>([]);
  const [researchForm, setResearchForm] = useState({ topic: '', description: '', status: '', findings: '' });

  const addResearch = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !researchForm.topic) return;
    try {
      const item = { _id: Date.now().toString(), projectId: getActiveProjectId(), ...researchForm };
      setResearch([item, ...research]);
      setResearchForm({ topic: '', description: '', status: '', findings: '' });
    } catch (err) {
      console.error('Failed to add research');
    }
  };

  const updateResearch = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setResearch(research.map(r => r._id === id ? data : r));
    } catch (err) {
      console.error('Failed to update research');
    }
  };

  const deleteResearch = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setResearch(research.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete research');
    }
  };

  // Reports state and CRUD
  const [reports, setReports] = useState<any[]>([]);
  const [reportForm, setReportForm] = useState({ title: '', type: '', date: '', summary: '' });

  const addReport = async (selectedTeam: Team | null) => {
    if (!selectedTeam || !reportForm.title) return;
    try {
      const item = { _id: Date.now().toString(), projectId: getActiveProjectId(), ...reportForm };
      setReports([item, ...reports]);
      setReportForm({ title: '', type: '', date: '', summary: '' });
    } catch (err) {
      console.error('Failed to add report');
    }
  };

  const updateReport = async (selectedTeam: Team | null, id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      setReports(reports.map(r => r._id === id ? data : r));
    } catch (err) {
      console.error('Failed to update report');
    }
  };

  const deleteReport = async (selectedTeam: Team | null, id: string) => {
    if (!selectedTeam) return;
    try {
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete report');
    }
  };

  return {
    projects, setProjects, projectForm, setProjectForm, addProject, updateProject, deleteProject,
    plans, setPlans, planForm, setPlanForm, addPlan, updatePlan, deletePlan,
    deliverables, setDeliverables, deliverableForm, setDeliverableForm, addDeliverable, updateDeliverable, deleteDeliverable,
    requirements, setRequirements, reqForm, setReqForm, addRequirement, updateRequirement, deleteRequirement,
    analyses, setAnalyses, analysisForm, setAnalysisForm, addAnalysis, updateAnalysis, deleteAnalysis,
    architectures, setArchitectures, archForm, setArchForm, addArchitecture, updateArchitecture, deleteArchitecture,
    designs, setDesigns, designForm, setDesignForm, addDesign, updateDesign, deleteDesign,
    implementations, setImplementations, implForm, setImplForm, addImplementation, updateImplementation, deleteImplementation,
    projectTasks, setProjectTasks, taskForm, setTaskForm, addTask, updateTask, deleteTask,
    codeRepos, setCodeRepos, repoForm, setRepoForm, addCode, updateCode, deleteCode,
    issues, setIssues, issueForm, setIssueForm, addIssue, updateIssue, deleteIssue,
    meetings, setMeetings, meetingForm, setMeetingForm, addMeeting, updateMeeting, deleteMeeting,
    notes, setNotes, noteForm, setNoteForm, addNote, updateNote, deleteNote,
    research, setResearch, researchForm, setResearchForm, addResearch, updateResearch, deleteResearch,
    reports, setReports, reportForm, setReportForm, addReport, updateReport, deleteReport,
    loadProjectData
  };
}
