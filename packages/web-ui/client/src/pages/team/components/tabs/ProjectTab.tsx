import React from 'react';
import { ProjectSubTab } from '../../types/team.types';
import { ProjectSection } from './ProjectSection';
import { ProjectSelectionPage } from './ProjectSelectionPage';
import { ProjectDetailsPage } from './ProjectDetailsPage';

interface ProjectTabProps {
  projectSubTab: ProjectSubTab;
  setProjectSubTab: (tab: ProjectSubTab) => void;
  selectedTeam: any;
  activeProject: any;
  setActiveProject: (project: any) => void;
  showProjectSelection: boolean;
  setShowProjectSelection: (show: boolean) => void;
  projects: any[];
  projectForm: any;
  setProjectForm: (form: any) => void;
  addProject: (team: any) => void;
  updateProject: (team: any, id: string, data: any) => void;
  deleteProject: (team: any, id: string) => void;
  plans: any[];
  planForm: any;
  setPlanForm: (form: any) => void;
  addPlan: (team: any) => void;
  updatePlan: (team: any, id: string, data: any) => void;
  deletePlan: (team: any, id: string) => void;
  deliverables: any[];
  deliverableForm: any;
  setDeliverableForm: (form: any) => void;
  addDeliverable: (team: any) => void;
  updateDeliverable: (team: any, id: string, data: any) => void;
  deleteDeliverable: (team: any, id: string) => void;
  requirements: any[];
  reqForm: any;
  setReqForm: (form: any) => void;
  addRequirement: (team: any) => void;
  updateRequirement: (team: any, id: string, data: any) => void;
  deleteRequirement: (team: any, id: string) => void;
  analyses: any[];
  analysisForm: any;
  setAnalysisForm: (form: any) => void;
  addAnalysis: (team: any) => void;
  updateAnalysis: (team: any, id: string, data: any) => void;
  deleteAnalysis: (team: any, id: string) => void;
  architectures: any[];
  archForm: any;
  setArchForm: (form: any) => void;
  addArchitecture: (team: any) => void;
  updateArchitecture: (team: any, id: string, data: any) => void;
  deleteArchitecture: (team: any, id: string) => void;
  designs: any[];
  designForm: any;
  setDesignForm: (form: any) => void;
  addDesign: (team: any) => void;
  updateDesign: (team: any, id: string, data: any) => void;
  deleteDesign: (team: any, id: string) => void;
  implementations: any[];
  implForm: any;
  setImplForm: (form: any) => void;
  addImplementation: (team: any) => void;
  updateImplementation: (team: any, id: string, data: any) => void;
  deleteImplementation: (team: any, id: string) => void;
  projectTasks: any[];
  taskForm: any;
  setTaskForm: (form: any) => void;
  addTask: (team: any) => void;
  updateTask: (team: any, id: string, data: any) => void;
  deleteTask: (team: any, id: string) => void;
  codeRepos: any[];
  repoForm: any;
  setRepoForm: (form: any) => void;
  addCode: (team: any) => void;
  updateCode: (team: any, id: string, data: any) => void;
  deleteCode: (team: any, id: string) => void;
  issues: any[];
  issueForm: any;
  setIssueForm: (form: any) => void;
  addIssue: (team: any) => void;
  updateIssue: (team: any, id: string, data: any) => void;
  deleteIssue: (team: any, id: string) => void;
  meetings: any[];
  meetingForm: any;
  setMeetingForm: (form: any) => void;
  addMeeting: (team: any) => void;
  updateMeeting: (team: any, id: string, data: any) => void;
  deleteMeeting: (team: any, id: string) => void;
  notes: any[];
  noteForm: any;
  setNoteForm: (form: any) => void;
  addNote: (team: any) => void;
  updateNote: (team: any, id: string, data: any) => void;
  deleteNote: (team: any, id: string) => void;
  research: any[];
  researchForm: any;
  setResearchForm: (form: any) => void;
  addResearch: (team: any) => void;
  updateResearch: (team: any, id: string, data: any) => void;
  deleteResearch: (team: any, id: string) => void;
  reports: any[];
  reportForm: any;
  setReportForm: (form: any) => void;
  addReport: (team: any) => void;
  updateReport: (team: any, id: string, data: any) => void;
  deleteReport: (team: any, id: string) => void;
  setProjects: (items: any[]) => void;
  setPlans: (items: any[]) => void;
  setDeliverables: (items: any[]) => void;
  setRequirements: (items: any[]) => void;
  setAnalyses: (items: any[]) => void;
  setArchitectures: (items: any[]) => void;
  setDesigns: (items: any[]) => void;
  setImplementations: (items: any[]) => void;
  setProjectTasks: (items: any[]) => void;
  setCodeRepos: (items: any[]) => void;
  setIssues: (items: any[]) => void;
  setMeetings: (items: any[]) => void;
  setNotes: (items: any[]) => void;
  setResearch: (items: any[]) => void;
  setReports: (items: any[]) => void;
}

const sidebarConfig = [
  { id: 'project', label: 'Project', icon: '🎯', color: 'slate' },
  { id: 'plan', label: 'Plan', icon: '📅', color: 'lime' },
  { id: 'deliverable', label: 'Deliverable', icon: '📦', color: 'amber' },
  { id: 'requirements', label: 'Requirements', icon: '📋', color: 'blue' },
  { id: 'analysis', label: 'Analysis', icon: '📊', color: 'sky' },
  { id: 'architecture', label: 'Architecture', icon: '🏗️', color: 'purple' },
  { id: 'design', label: 'Design', icon: '🎨', color: 'pink' },
  { id: 'implementation', label: 'Implementation', icon: '⚙️', color: 'green' },
  { id: 'tasks', label: 'Tasks', icon: '✓', color: 'yellow' },
  { id: 'code', label: 'Code', icon: '💻', color: 'indigo' },
  { id: 'issues', label: 'Issues', icon: '🐛', color: 'red' },
  { id: 'meetings', label: 'Meetings', icon: '📅', color: 'teal' },
  { id: 'documents', label: 'Documents', icon: '📄', color: 'gray' },
  { id: 'notes', label: 'Notes', icon: '📝', color: 'cyan' },
  { id: 'research', label: 'Research', icon: '🔬', color: 'violet' },
  { id: 'report', label: 'Report', icon: '📊', color: 'emerald' },
  { id: 'support', label: 'Support', icon: '🎧', color: 'orange' }
];

export function ProjectTab(props: ProjectTabProps) {
  const { projectSubTab, setProjectSubTab, selectedTeam, activeProject, setActiveProject, showProjectSelection, setShowProjectSelection } = props;
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [documentForm, setDocumentForm] = React.useState({ title: '', type: '', url: '', uploadDate: '', description: '' });
  const [supportTickets, setSupportTickets] = React.useState<any[]>([]);
  const [supportForm, setSupportForm] = React.useState({ subject: '', description: '', priority: 'medium', status: 'open', assignee: '' });

  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const handleSelectProject = (project: any) => {
    setActiveProject(project);
    setShowProjectSelection(false);
  };

  const handleCreateNew = () => {
    setShowProjectSelection(false);
    setShowCreateForm(true);
  };

  const handleBackToSelection = () => {
    setActiveProject(null);
    setShowProjectSelection(true);
    setShowCreateForm(false);
  };

  const handleSectionClick = (section: ProjectSubTab) => {
    setProjectSubTab(section);
  };

  const handleSaveNewProject = async () => {
    if (selectedTeam) {
      const result = await props.addProject(selectedTeam);
      if (result?.success) {
        alert('Project created successfully!');
        setShowCreateForm(false);
        setShowProjectSelection(true);
      } else {
        alert(result?.error || 'Failed to create project');
      }
    }
  };

  // Show project selection page
  if (showProjectSelection) {
    return (
      <ProjectSelectionPage
        projects={props.projects || []}
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNew}
      />
    );
  }

  // Show create project form
  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={handleBackToSelection}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {[
            { name: 'name', label: 'Project Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'manager', label: 'Project Manager', type: 'text' },
            { name: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'On Hold', 'Completed'] },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'budget', label: 'Budget', type: 'text' },
            { name: 'sponsor', label: 'Sponsor', type: 'text' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={props.projectForm[field.name] || ''}
                  onChange={(e) => props.setProjectForm({ ...props.projectForm, [field.name]: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select
                  value={props.projectForm[field.name] || ''}
                  onChange={(e) => props.setProjectForm({ ...props.projectForm, [field.name]: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={props.projectForm[field.name] || ''}
                  onChange={(e) => props.setProjectForm({ ...props.projectForm, [field.name]: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              )}
            </div>
          ))}
          <button
            onClick={handleSaveNewProject}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Project
          </button>
        </div>
      </div>
    );
  }

  // Show project details page if active project is selected and on project tab
  if (activeProject && projectSubTab === 'project') {
    return (
      <ProjectDetailsPage
        activeProject={activeProject}
        onBack={handleBackToSelection}
        onSectionClick={handleSectionClick}
      />
    );
  }

  // Filter data by active project
  const getFilteredData = (items: any[]) => {
    if (!activeProject) return items;
    return items.filter(item => item.projectId === activeProject.projectId);
  };

  const getCount = (id: string) => {
    if (!activeProject) return 0;
    switch(id) {
      case 'project': return 1;
      case 'plan': return getFilteredData(props.plans || []).length;
      case 'deliverable': return getFilteredData(props.deliverables || []).length;
      case 'requirements': return getFilteredData(props.requirements).length;
      case 'analysis': return getFilteredData(props.analyses || []).length;
      case 'architecture': return getFilteredData(props.architectures).length;
      case 'design': return getFilteredData(props.designs).length;
      case 'implementation': return getFilteredData(props.implementations).length;
      case 'tasks': return getFilteredData(props.projectTasks).length;
      case 'code': return getFilteredData(props.codeRepos).length;
      case 'issues': return getFilteredData(props.issues).length;
      case 'meetings': return getFilteredData(props.meetings).length;
      case 'documents': return getFilteredData(documents).length;
      case 'notes': return getFilteredData(props.notes || []).length;
      case 'research': return getFilteredData(props.research || []).length;
      case 'report': return getFilteredData(props.reports || []).length;
      case 'support': return getFilteredData(supportTickets).length;
      default: return 0;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
        <nav className="space-y-1">
          {sidebarConfig.map(item => (
            <button
              key={item.id}
              onClick={() => setProjectSubTab(item.id as ProjectSubTab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                projectSubTab === item.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold bg-${item.color}-600 text-white rounded-full`}>
                {getCount(item.id)}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {!selectedTeam ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">Please select a team to manage projects</div>
            </div>
          ) : !activeProject ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">Please select a project to view tasks</div>
            </div>
          ) : (
            <>
              {/* Active Project Header */}
              <div className="mb-6 pb-4 border-b flex items-center justify-between">
                <div>
                  <button
                    onClick={handleBackToSelection}
                    className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Projects
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">{activeProject.name}</h2>
                  <p className="text-sm text-gray-600">{activeProject.projectId}</p>
                </div>
                <span className={`px-3 py-1 rounded ${
                  activeProject.status === 'Active' ? 'bg-green-100 text-green-800' :
                  activeProject.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                  activeProject.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activeProject.status}
                </span>
              </div>

              {projectSubTab === 'project' && (
                <ProjectSection
                  title="Project"
                  items={props.projects || []}
                  fields={[
                    { name: 'projectId', label: 'Project ID' },
                    { name: 'name', label: 'Project Name' },
                    { name: 'manager', label: 'Manager' },
                    { name: 'status', label: 'Status' },
                    { name: 'startDate', label: 'Start Date' },
                    { name: 'endDate', label: 'End Date' }
                  ]}
                  form={props.projectForm}
                  setForm={props.setProjectForm}
                  onAdd={() => props.addProject(selectedTeam)}
                  onUpdate={(id, data) => props.updateProject(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteProject(selectedTeam, id)}
                  formFields={[
                    { name: 'name', placeholder: 'Project Name' },
                    { name: 'manager', placeholder: 'Project Manager' },
                    { name: 'sponsor', placeholder: 'Project Sponsor' },
                    { name: 'description', placeholder: 'Project Description', type: 'textarea' },
                    { name: 'status', placeholder: 'Status (e.g., Planning, Active, Completed)' },
                    { name: 'budget', placeholder: 'Project Budget (e.g., $100,000)' },
                    { name: 'funding', placeholder: 'Funding Source' },
                    { name: 'startDate', placeholder: 'Start Date', type: 'date' },
                    { name: 'endDate', placeholder: 'End Date', type: 'date' },
                    { name: 'deadline', placeholder: 'Deadline', type: 'date' },
                    { name: 'marketSegments', placeholder: 'Target Market Segments', type: 'textarea' },
                    { name: 'products', placeholder: 'Products', type: 'textarea' },
                    { name: 'targetUser', placeholder: 'Target User', type: 'textarea' },
                    { name: 'dependencies', placeholder: 'Dependencies', type: 'textarea' },
                    { name: 'teams', placeholder: 'Project Teams (comma-separated)', type: 'teams' },
                    { name: 'members', placeholder: 'Team Members (comma-separated)', type: 'members' },
                    { name: 'approvals', placeholder: 'Approval Items (comma-separated)', type: 'approvals' }
                  ]}
                />
              )}

              {projectSubTab === 'plan' && (
                <ProjectSection
                  title="Plan"
                  items={getFilteredData(props.plans || [])}
                  fields={[
                    { name: 'phase', label: 'Phase' },
                    { name: 'milestone', label: 'Milestone' },
                    { name: 'startDate', label: 'Start Date' },
                    { name: 'endDate', label: 'End Date' }
                  ]}
                  form={props.planForm}
                  setForm={props.setPlanForm}
                  onAdd={() => props.addPlan(selectedTeam)}
                  onUpdate={(id, data) => props.updatePlan(selectedTeam, id, data)}
                  onDelete={(id) => props.deletePlan(selectedTeam, id)}
                  formFields={[
                    { name: 'phase', placeholder: 'Phase (e.g., Phase 1, Phase 2)' },
                    { name: 'milestone', placeholder: 'Milestone' },
                    { name: 'startDate', placeholder: 'Start Date', type: 'date' },
                    { name: 'endDate', placeholder: 'End Date', type: 'date' }
                  ]}
                />
              )}

              {projectSubTab === 'deliverable' && (
                <ProjectSection
                  title="Deliverable"
                  items={getFilteredData(props.deliverables || [])}
                  fields={[
                    { name: 'name', label: 'Name' },
                    { name: 'type', label: 'Type' },
                    { name: 'dueDate', label: 'Due Date' },
                    { name: 'status', label: 'Status' }
                  ]}
                  form={props.deliverableForm}
                  setForm={props.setDeliverableForm}
                  onAdd={() => props.addDeliverable(selectedTeam)}
                  onUpdate={(id, data) => props.updateDeliverable(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteDeliverable(selectedTeam, id)}
                  formFields={[
                    { name: 'name', placeholder: 'Deliverable Name' },
                    { name: 'type', placeholder: 'Type (e.g., Document, Software, Report)' },
                    { name: 'dueDate', placeholder: 'Due Date', type: 'date' },
                    { name: 'status', placeholder: 'Status (e.g., Pending, In Progress, Completed)' }
                  ]}
                />
              )}

              {projectSubTab === 'requirements' && (
                <ProjectSection
                  title="Requirements"
                  items={getFilteredData(props.requirements)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'description', label: 'Description' },
                    { name: 'priority', label: 'Priority' },
                    { name: 'status', label: 'Status' }
                  ]}
                  form={props.reqForm}
                  setForm={props.setReqForm}
                  onAdd={() => props.addRequirement(selectedTeam)}
                  onUpdate={(id, data) => props.updateRequirement(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteRequirement(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'priority', placeholder: 'Priority' },
                    { name: 'status', placeholder: 'Status' }
                  ]}
                />
              )}

              {projectSubTab === 'analysis' && (
                <ProjectSection
                  title="Analysis"
                  items={getFilteredData(props.analyses || [])}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'type', label: 'Type' },
                    { name: 'findings', label: 'Findings' },
                    { name: 'date', label: 'Date' }
                  ]}
                  form={props.analysisForm}
                  setForm={props.setAnalysisForm}
                  onAdd={() => props.addAnalysis(selectedTeam)}
                  onUpdate={(id, data) => props.updateAnalysis(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteAnalysis(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Analysis Title' },
                    { name: 'type', placeholder: 'Type (e.g., Risk, Cost, Feasibility)' },
                    { name: 'findings', placeholder: 'Key Findings' },
                    { name: 'date', placeholder: 'Date', type: 'date' }
                  ]}
                />
              )}

              {projectSubTab === 'architecture' && (
                <ProjectSection
                  title="Architecture"
                  items={getFilteredData(props.architectures)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'description', label: 'Description' },
                    { name: 'diagram_url', label: 'Diagram URL' }
                  ]}
                  form={props.archForm}
                  setForm={props.setArchForm}
                  onAdd={() => props.addArchitecture(selectedTeam)}
                  onUpdate={(id, data) => props.updateArchitecture(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteArchitecture(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'diagram_url', placeholder: 'Diagram URL' }
                  ]}
                />
              )}

              {projectSubTab === 'design' && (
                <ProjectSection
                  title="Design"
                  items={getFilteredData(props.designs)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'description', label: 'Description' },
                    { name: 'mockup_url', label: 'Mockup URL' }
                  ]}
                  form={props.designForm}
                  setForm={props.setDesignForm}
                  onAdd={() => props.addDesign(selectedTeam)}
                  onUpdate={(id, data) => props.updateDesign(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteDesign(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'mockup_url', placeholder: 'Mockup URL' }
                  ]}
                />
              )}

              {projectSubTab === 'implementation' && (
                <ProjectSection
                  title="Implementation"
                  items={getFilteredData(props.implementations)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'description', label: 'Description' },
                    { name: 'status', label: 'Status' },
                    { name: 'progress', label: 'Progress (%)' }
                  ]}
                  form={props.implForm}
                  setForm={props.setImplForm}
                  onAdd={() => props.addImplementation(selectedTeam)}
                  onUpdate={(id, data) => props.updateImplementation(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteImplementation(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'status', placeholder: 'Status' },
                    { name: 'progress', placeholder: 'Progress (%)', type: 'number' }
                  ]}
                />
              )}

              {projectSubTab === 'tasks' && (
                <ProjectSection
                  title="Tasks"
                  items={getFilteredData(props.projectTasks)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'description', label: 'Description' },
                    { name: 'assignee', label: 'Assignee' },
                    { name: 'status', label: 'Status' },
                    { name: 'priority', label: 'Priority' }
                  ]}
                  form={props.taskForm}
                  setForm={props.setTaskForm}
                  onAdd={() => props.addTask(selectedTeam)}
                  onUpdate={(id, data) => props.updateTask(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteTask(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'assignee', placeholder: 'Assignee' },
                    { name: 'status', placeholder: 'Status' },
                    { name: 'priority', placeholder: 'Priority' }
                  ]}
                />
              )}

              {projectSubTab === 'code' && (
                <ProjectSection
                  title="Code Repositories"
                  items={getFilteredData(props.codeRepos)}
                  fields={[
                    { name: 'name', label: 'Name' },
                    { name: 'url', label: 'URL' },
                    { name: 'branch', label: 'Branch' },
                    { name: 'description', label: 'Description' }
                  ]}
                  form={props.repoForm}
                  setForm={props.setRepoForm}
                  onAdd={() => props.addCode(selectedTeam)}
                  onUpdate={(id, data) => props.updateCode(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteCode(selectedTeam, id)}
                  formFields={[
                    { name: 'name', placeholder: 'Repository Name' },
                    { name: 'url', placeholder: 'URL' },
                    { name: 'branch', placeholder: 'Branch' },
                    { name: 'description', placeholder: 'Description' }
                  ]}
                />
              )}

              {projectSubTab === 'issues' && (
                <ProjectSection
                  title="Issues"
                  items={getFilteredData(props.issues)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'description', label: 'Description' },
                    { name: 'severity', label: 'Severity' },
                    { name: 'status', label: 'Status' },
                    { name: 'assignee', label: 'Assignee' }
                  ]}
                  form={props.issueForm}
                  setForm={props.setIssueForm}
                  onAdd={() => props.addIssue(selectedTeam)}
                  onUpdate={(id, data) => props.updateIssue(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteIssue(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'severity', placeholder: 'Severity' },
                    { name: 'status', placeholder: 'Status' },
                    { name: 'assignee', placeholder: 'Assignee' }
                  ]}
                />
              )}

              {projectSubTab === 'meetings' && (
                <ProjectSection
                  title="Meetings"
                  items={getFilteredData(props.meetings)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'date', label: 'Date' },
                    { name: 'time', label: 'Time' },
                    { name: 'agenda', label: 'Agenda' }
                  ]}
                  form={props.meetingForm}
                  setForm={props.setMeetingForm}
                  onAdd={() => props.addMeeting(selectedTeam)}
                  onUpdate={(id, data) => props.updateMeeting(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteMeeting(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'date', placeholder: 'Date', type: 'date' },
                    { name: 'time', placeholder: 'Time', type: 'time' },
                    { name: 'agenda', placeholder: 'Agenda' }
                  ]}
                />
              )}

              {projectSubTab === 'documents' && (
                <ProjectSection
                  title="Documents"
                  items={getFilteredData(documents)}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'type', label: 'Type' },
                    { name: 'url', label: 'URL' },
                    { name: 'uploadDate', label: 'Upload Date' }
                  ]}
                  form={documentForm}
                  setForm={setDocumentForm}
                  onAdd={() => {
                    const newDoc = { 
                      _id: Date.now().toString(), 
                      ...documentForm, 
                      projectId: activeProject?.projectId,
                      uploadDate: documentForm.uploadDate || new Date().toISOString().split('T')[0]
                    };
                    setDocuments([...documents, newDoc]);
                    setDocumentForm({ title: '', type: '', url: '', uploadDate: '', description: '' });
                  }}
                  onUpdate={(id, data) => setDocuments(documents.map(d => d._id === id ? data : d))}
                  onDelete={(id) => setDocuments(documents.filter(d => d._id !== id))}
                  formFields={[
                    { name: 'title', placeholder: 'Document Title' },
                    { name: 'type', placeholder: 'Type (e.g., PDF, Word, Excel, Presentation)' },
                    { name: 'url', placeholder: 'Document URL or Path' },
                    { name: 'uploadDate', placeholder: 'Upload Date', type: 'date' },
                    { name: 'description', placeholder: 'Description', type: 'textarea' }
                  ]}
                />
              )}

              {projectSubTab === 'notes' && (
                <ProjectSection
                  title="Notes"
                  items={getFilteredData(props.notes || [])}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'content', label: 'Content' },
                    { name: 'category', label: 'Category' },
                    { name: 'date', label: 'Date' }
                  ]}
                  form={props.noteForm}
                  setForm={props.setNoteForm}
                  onAdd={() => props.addNote(selectedTeam)}
                  onUpdate={(id, data) => props.updateNote(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteNote(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Title' },
                    { name: 'content', placeholder: 'Content' },
                    { name: 'category', placeholder: 'Category' },
                    { name: 'date', placeholder: 'Date', type: 'date' }
                  ]}
                />
              )}

              {projectSubTab === 'research' && (
                <ProjectSection
                  title="Research"
                  items={getFilteredData(props.research || [])}
                  fields={[
                    { name: 'topic', label: 'Topic' },
                    { name: 'description', label: 'Description' },
                    { name: 'status', label: 'Status' },
                    { name: 'findings', label: 'Findings' }
                  ]}
                  form={props.researchForm}
                  setForm={props.setResearchForm}
                  onAdd={() => props.addResearch(selectedTeam)}
                  onUpdate={(id, data) => props.updateResearch(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteResearch(selectedTeam, id)}
                  formFields={[
                    { name: 'topic', placeholder: 'Research Topic' },
                    { name: 'description', placeholder: 'Description' },
                    { name: 'status', placeholder: 'Status (e.g., In Progress, Completed)' },
                    { name: 'findings', placeholder: 'Key Findings' }
                  ]}
                />
              )}

              {projectSubTab === 'report' && (
                <ProjectSection
                  title="Report"
                  items={getFilteredData(props.reports || [])}
                  fields={[
                    { name: 'title', label: 'Title' },
                    { name: 'type', label: 'Type' },
                    { name: 'date', label: 'Date' },
                    { name: 'summary', label: 'Summary' }
                  ]}
                  form={props.reportForm}
                  setForm={props.setReportForm}
                  onAdd={() => props.addReport(selectedTeam)}
                  onUpdate={(id, data) => props.updateReport(selectedTeam, id, data)}
                  onDelete={(id) => props.deleteReport(selectedTeam, id)}
                  formFields={[
                    { name: 'title', placeholder: 'Report Title' },
                    { name: 'type', placeholder: 'Type (e.g., Weekly, Monthly, Final)' },
                    { name: 'date', placeholder: 'Date', type: 'date' },
                    { name: 'summary', placeholder: 'Summary' }
                  ]}
                />
              )}

              {projectSubTab === 'support' && (
                <ProjectSection
                  title="Support"
                  items={getFilteredData(supportTickets)}
                  fields={[
                    { name: 'ticketId', label: 'Ticket ID' },
                    { name: 'subject', label: 'Subject' },
                    { name: 'priority', label: 'Priority' },
                    { name: 'status', label: 'Status' }
                  ]}
                  form={supportForm}
                  setForm={setSupportForm}
                  onAdd={() => {
                    const newTicket = { 
                      _id: Date.now().toString(), 
                      ...supportForm, 
                      projectId: activeProject?.projectId,
                      ticketId: `TKT-${Date.now().toString().slice(-6)}`,
                      createdDate: new Date().toISOString().split('T')[0]
                    };
                    setSupportTickets([...supportTickets, newTicket]);
                    setSupportForm({ subject: '', description: '', priority: 'medium', status: 'open', assignee: '' });
                  }}
                  onUpdate={(id, data) => setSupportTickets(supportTickets.map(t => t._id === id ? data : t))}
                  onDelete={(id) => setSupportTickets(supportTickets.filter(t => t._id !== id))}
                  formFields={[
                    { name: 'subject', placeholder: 'Subject' },
                    { name: 'description', placeholder: 'Description', type: 'textarea' },
                    { name: 'priority', placeholder: 'Priority (e.g., Low, Medium, High, Critical)' },
                    { name: 'status', placeholder: 'Status (e.g., Open, In Progress, Resolved, Closed)' },
                    { name: 'assignee', placeholder: 'Assignee' }
                  ]}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
