import { useState, useEffect } from 'react';
import { teamApi } from '../../services/team/api';
import { TaskAgent } from './TaskAgent';

type TabType = 'dashboard' | 'task-assistant' | 'project' | 'knowledge' | 'team' | 'profile';

export function TeamDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [teamName, setTeamName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [workspaceType, setWorkspaceType] = useState<'private' | 'team'>('private');
  const [selectedTeamId] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamSearchResults, setTeamSearchResults] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todos, setTodos] = useState<Array<{_id: string; text: string; completed: boolean; editing?: boolean}>>([]);
  const [newTodo, setNewTodo] = useState('');
  const [teamSubTab, setTeamSubTab] = useState<'my-teams' | 'all-teams'>('my-teams');
  const [teamActionTab, setTeamActionTab] = useState<'create' | 'join'>('create');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [profileData, setProfileData] = useState({ username: '', email: '', full_name: '', phone: '', api_key: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('general');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [dashboardSubTab, setDashboardSubTab] = useState<'notifications' | 'todo-list' | 'calendar'>('notifications');
  const [projectSubTab, setProjectSubTab] = useState<'requirements' | 'architecture' | 'design' | 'implementation' | 'tasks' | 'code' | 'issues' | 'meetings'>('requirements');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', description: '' });
  
  // Project management state
  const [requirements, setRequirements] = useState<any[]>([]);
  const [architectures, setArchitectures] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [implementations, setImplementations] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [codeRepos, setCodeRepos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  
  // Form states
  const [reqForm, setReqForm] = useState({ title: '', description: '', priority: 'medium', status: 'draft' });
  const [archForm, setArchForm] = useState({ title: '', description: '', diagram_url: '' });
  const [designForm, setDesignForm] = useState({ title: '', description: '', mockup_url: '' });
  const [implForm, setImplForm] = useState({ title: '', description: '', status: 'planned', progress: 0 });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', status: 'todo', priority: 'medium' });
  const [repoForm, setRepoForm] = useState({ name: '', url: '', branch: 'main', description: '' });
  const [issueForm, setIssueForm] = useState({ title: '', description: '', severity: 'medium', status: 'open', assignee: '' });
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '', agenda: '', notes: '' });

  useEffect(() => {
    loadFiles();
    loadMyTeams();
    loadTodos();
    setUsername(localStorage.getItem('team_username') || '');
    loadProfile();
    if (selectedTeam) {
      loadNotifications(selectedTeam.id);
    }
  }, [workspaceType, selectedTeamId, selectedTeam]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' && myTeams.length > 0) {
      loadAllTeamNotifications();
    }
  }, [activeTab, myTeams]);

  useEffect(() => {
    if (selectedTeam && activeTab === 'project') {
      loadProjectData();
    }
  }, [selectedTeam, activeTab]);

  const loadProfile = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      if (data.username) {
        setProfileData({
          username: data.username || '',
          email: data.email || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          api_key: data.api_key || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('Profile updated successfully');
        setIsEditingProfile(false);
        loadProfile();
      }
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Regenerate API key? The old key will be deactivated.')) return;
    
    try {
      const res = await fetch('http://localhost:3001/api/user/regenerate-api-key', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('API key regenerated successfully');
        loadProfile();
      }
    } catch (err) {
      setMessage('Failed to regenerate API key');
    }
  };

  const loadFiles = async () => {
    try {
      const data = await teamApi.listFiles(workspaceType, selectedTeamId || undefined);
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const loadMyTeams = async () => {
    try {
      const data = await teamApi.getUserTeams();
      if (data.teams) setMyTeams(data.teams);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await teamApi.uploadFile(file, workspaceType, selectedTeamId || undefined);
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('File uploaded successfully');
        loadFiles();
      }
    } catch (err) {
      setMessage('Failed to upload file');
    }
  };

  const handleDelete = async (filePath: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      await teamApi.deleteFile(filePath);
      setMessage('File deleted');
      loadFiles();
    } catch (err) {
      setMessage('Failed to delete file');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const data = await teamApi.searchFiles(searchQuery, workspaceType, selectedTeamId || undefined);
      if (data.results) setSearchResults(data.results);
    } catch (err) {
      setMessage('Search failed');
    }
  };

  const handleLogout = () => {
    teamApi.logout();
    //window.location.reload();
    window.location.href = '/team';
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await teamApi.createTeam(teamName, specialization, description);
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage(`Team created! Workspace: ${data.workspace_path}`);
        setTeamName('');
        setSpecialization('');
        setDescription('');
        loadMyTeams();
      }
    } catch (err) {
      setMessage('Failed to create team');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ team_id: teamId })
      });
      const data = await res.json();

      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage(`Joined team! Workspace: ${data.workspace_path}`);
        setTeamId('');
        setTeamSearchResults([]);
        loadMyTeams();
      }
    } catch (err) {
      setMessage('Failed to join team');
    }
  };

  const handleTeamSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await teamApi.searchTeams(teamSearchQuery);
      if (data.teams) setTeamSearchResults(data.teams);
    } catch (err) {
      setMessage('Team search failed');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Delete this team? This action cannot be undone.')) return;

    try {
      const data = await teamApi.deleteTeam(teamId);
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('Team deleted successfully');
        loadMyTeams();
      }
    } catch (err) {
      setMessage('Failed to delete team');
    }
  };

  const loadTodos = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Failed to load todos');
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await fetch('http://localhost:3001/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ text: newTodo })
      });
      const todo = await res.json();
      setTodos([todo, ...todos]);
      setNewTodo('');
    } catch (err) {
      console.error('Failed to add todo');
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ completed: !todo.completed })
      });
      setTodos(todos.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.error('Failed to toggle todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete todo');
    }
  };

  const startEdit = (id: string) => {
    setTodos(todos.map(t => t._id === id ? { ...t, editing: true } : t));
  };

  const saveEdit = async (id: string, newText: string) => {
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ text: newText })
      });
      setTodos(todos.map(t => t._id === id ? { ...t, text: newText, editing: false } : t));
    } catch (err) {
      console.error('Failed to save todo');
    }
  };

  const cancelEdit = (id: string) => {
    setTodos(todos.map(t => t._id === id ? { ...t, editing: false } : t));
  };

  // Project management functions
  const loadProjectData = async () => {
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

  const addRequirement = async () => {
    if (!selectedTeam || !reqForm.title) return;
    try {
      const item = await teamApi.createRequirement(selectedTeam.id, reqForm);
      setRequirements([item, ...requirements]);
      setReqForm({ title: '', description: '', priority: 'medium', status: 'draft' });
    } catch (err) {
      console.error('Failed to add requirement');
    }
  };

  const updateRequirement = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateRequirement(selectedTeam.id, id, data);
      setRequirements(requirements.map(r => r._id === id ? updated : r));
    } catch (err) {
      console.error('Failed to update requirement');
    }
  };

  const deleteRequirement = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteRequirement(selectedTeam.id, id);
      setRequirements(requirements.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete requirement');
    }
  };

  const addArchitecture = async () => {
    if (!selectedTeam || !archForm.title) return;
    try {
      const item = await teamApi.createArchitecture(selectedTeam.id, archForm);
      setArchitectures([item, ...architectures]);
      setArchForm({ title: '', description: '', diagram_url: '' });
    } catch (err) {
      console.error('Failed to add architecture');
    }
  };

  const updateArchitecture = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateArchitecture(selectedTeam.id, id, data);
      setArchitectures(architectures.map(a => a._id === id ? updated : a));
    } catch (err) {
      console.error('Failed to update architecture');
    }
  };

  const deleteArchitecture = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteArchitecture(selectedTeam.id, id);
      setArchitectures(architectures.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete architecture');
    }
  };

  const addDesign = async () => {
    if (!selectedTeam || !designForm.title) return;
    try {
      const item = await teamApi.createDesign(selectedTeam.id, designForm);
      setDesigns([item, ...designs]);
      setDesignForm({ title: '', description: '', mockup_url: '' });
    } catch (err) {
      console.error('Failed to add design');
    }
  };

  const updateDesign = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateDesign(selectedTeam.id, id, data);
      setDesigns(designs.map(d => d._id === id ? updated : d));
    } catch (err) {
      console.error('Failed to update design');
    }
  };

  const deleteDesign = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteDesign(selectedTeam.id, id);
      setDesigns(designs.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete design');
    }
  };

  const addImplementation = async () => {
    if (!selectedTeam || !implForm.title) return;
    try {
      const item = await teamApi.createImplementation(selectedTeam.id, implForm);
      setImplementations([item, ...implementations]);
      setImplForm({ title: '', description: '', status: 'planned', progress: 0 });
    } catch (err) {
      console.error('Failed to add implementation');
    }
  };

  const updateImplementation = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateImplementation(selectedTeam.id, id, data);
      setImplementations(implementations.map(i => i._id === id ? updated : i));
    } catch (err) {
      console.error('Failed to update implementation');
    }
  };

  const deleteImplementation = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteImplementation(selectedTeam.id, id);
      setImplementations(implementations.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete implementation');
    }
  };

  const addTask = async () => {
    if (!selectedTeam || !taskForm.title) return;
    try {
      const item = await teamApi.createTask(selectedTeam.id, taskForm);
      setProjectTasks([item, ...projectTasks]);
      setTaskForm({ title: '', description: '', assignee: '', status: 'todo', priority: 'medium' });
    } catch (err) {
      console.error('Failed to add task');
    }
  };

  const updateTask = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateTask(selectedTeam.id, id, data);
      setProjectTasks(projectTasks.map(t => t._id === id ? updated : t));
    } catch (err) {
      console.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteTask(selectedTeam.id, id);
      setProjectTasks(projectTasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task');
    }
  };

  const addCode = async () => {
    if (!selectedTeam || !repoForm.name) return;
    try {
      const item = await teamApi.createCode(selectedTeam.id, repoForm);
      setCodeRepos([item, ...codeRepos]);
      setRepoForm({ name: '', url: '', branch: 'main', description: '' });
    } catch (err) {
      console.error('Failed to add code');
    }
  };

  const updateCode = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateCode(selectedTeam.id, id, data);
      setCodeRepos(codeRepos.map(c => c._id === id ? updated : c));
    } catch (err) {
      console.error('Failed to update code');
    }
  };

  const deleteCode = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteCode(selectedTeam.id, id);
      setCodeRepos(codeRepos.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete code');
    }
  };

  const addIssue = async () => {
    if (!selectedTeam || !issueForm.title) return;
    try {
      const item = await teamApi.createIssue(selectedTeam.id, issueForm);
      setIssues([item, ...issues]);
      setIssueForm({ title: '', description: '', severity: 'medium', status: 'open', assignee: '' });
    } catch (err) {
      console.error('Failed to add issue');
    }
  };

  const updateIssue = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateIssue(selectedTeam.id, id, data);
      setIssues(issues.map(i => i._id === id ? updated : i));
    } catch (err) {
      console.error('Failed to update issue');
    }
  };

  const deleteIssue = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteIssue(selectedTeam.id, id);
      setIssues(issues.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete issue');
    }
  };

  const addMeeting = async () => {
    if (!selectedTeam || !meetingForm.title) return;
    try {
      const item = await teamApi.createMeeting(selectedTeam.id, meetingForm);
      setMeetings([item, ...meetings]);
      setMeetingForm({ title: '', date: '', time: '', agenda: '', notes: '' });
    } catch (err) {
      console.error('Failed to add meeting');
    }
  };

  const updateMeeting = async (id: string, data: any) => {
    if (!selectedTeam) return;
    try {
      const updated = await teamApi.updateMeeting(selectedTeam.id, id, data);
      setMeetings(meetings.map(m => m._id === id ? updated : m));
    } catch (err) {
      console.error('Failed to update meeting');
    }
  };

  const deleteMeeting = async (id: string) => {
    if (!selectedTeam) return;
    try {
      await teamApi.deleteMeeting(selectedTeam.id, id);
      setMeetings(meetings.filter(m => m._id !== id));
    } catch (err) {
      console.error('Failed to delete meeting');
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${teamId}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      if (data.members) {
        setTeamMembers(data.members);
      } else {
        // If endpoint doesn't exist or returns no data, show placeholder
        setTeamMembers([]);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
      // Show placeholder when endpoint is not available
      setTeamMembers([]);
    }
  };

  const handleSelectTeam = (team: any) => {
    setSelectedTeam(team);
    loadTeamMembers(team.id);
    loadNotifications(team.id);
  };

  const loadNotifications = async (teamId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${teamId}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const loadAllTeamNotifications = async () => {
    try {
      const allNotifications: any[] = [];
      for (const team of myTeams) {
        const res = await fetch(`http://localhost:3001/api/teams/${team.id}/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
        });
        const data = await res.json();
        if (data.notifications) {
          allNotifications.push(...data.notifications.map((n: any) => ({ ...n, team_name: team.team_name })));
        }
      }
      setNotifications(allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('Failed to load all notifications:', err);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !broadcastMessage.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${selectedTeam.id}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ 
          message: broadcastMessage,
          message_type: broadcastType
        })
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('Broadcast sent successfully');
        setBroadcastMessage('');
        loadNotifications(selectedTeam.id);
      }
    } catch (err) {
      setMessage('Failed to send broadcast');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedNotification || !replyMessage.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${selectedTeam.id}/notifications/${selectedNotification._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('Reply sent successfully');
        setReplyMessage('');
        loadNotifications(selectedTeam.id);
      }
    } catch (err) {
      setMessage('Failed to send reply');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newMemberEmail.trim()) return;
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ email: newMemberEmail })
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('Member added successfully');
        setNewMemberEmail('');
        loadTeamMembers(selectedTeam.id);
      }
    } catch (err) {
      setMessage('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam || !confirm('Remove this member?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${selectedTeam.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage('Member removed');
        loadTeamMembers(selectedTeam.id);
      }
    } catch (err) {
      setMessage('Failed to remove member');
    }
  };

  const handleToggleMemberStatus = async (memberId: string, currentStatus: string) => {
    if (!selectedTeam) return;
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`http://localhost:3001/api/teams/${selectedTeam.id}/members/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error.message}`);
      } else {
        setMessage(`Member ${newStatus}`);
        loadTeamMembers(selectedTeam.id);
      }
    } catch (err) {
      setMessage('Failed to update member status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Team Workspace</h1>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 font-medium rounded transition-colors ${activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('task-assistant')}
                className={`px-4 py-2 font-medium rounded transition-colors ${activeTab === 'task-assistant'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Task Assistant
              </button>
              <button
                onClick={() => setActiveTab('project')}
                className={`px-4 py-2 font-medium rounded transition-colors ${activeTab === 'project'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Project Task
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-4 py-2 font-medium rounded transition-colors ${activeTab === 'knowledge'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Knowledge
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`px-4 py-2 font-medium rounded transition-colors ${activeTab === 'team'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Team
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 font-medium rounded transition-colors ${activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Profile
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {username && <span className="text-gray-700 text-xs">{username}</span>}
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {activeTab === 'task-assistant' ? (
        <div className="h-[calc(100vh-80px)]">
          <TaskAgent workspaceType={workspaceType} selectedTeamId={selectedTeamId} />
        </div>
      ) : activeTab === 'project' ? (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Project Management</h2>
            
            <div className="flex gap-2 mb-6 border-b overflow-x-auto">
              {(['requirements', 'architecture', 'design', 'implementation', 'tasks', 'code', 'issues', 'meetings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setProjectSubTab(tab)}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    projectSubTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {projectSubTab === 'requirements' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Requirement</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={reqForm.title}
                      onChange={(e) => setReqForm({...reqForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={reqForm.description}
                      onChange={(e) => setReqForm({...reqForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <select
                        value={reqForm.priority}
                        onChange={(e) => setReqForm({...reqForm, priority: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <select
                        value={reqForm.status}
                        onChange={(e) => setReqForm({...reqForm, status: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="draft">Draft</option>
                        <option value="approved">Approved</option>
                        <option value="implemented">Implemented</option>
                      </select>
                      <button
                        onClick={addRequirement}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div key={req.id} className="border rounded p-4">
                      {req.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={req.title}
                            onChange={(e) => setRequirements(requirements.map(r => r._id === req._id ? {...r, title: e.target.value} : r))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={req.description}
                            onChange={(e) => setRequirements(requirements.map(r => r._id === req._id ? {...r, description: e.target.value} : r))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <div className="flex gap-3">
                            <select
                              value={req.priority}
                              onChange={(e) => setRequirements(requirements.map(r => r._id === req._id ? {...r, priority: e.target.value} : r))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <select
                              value={req.status}
                              onChange={(e) => setRequirements(requirements.map(r => r._id === req._id ? {...r, status: e.target.value} : r))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="draft">Draft</option>
                              <option value="approved">Approved</option>
                              <option value="implemented">Implemented</option>
                            </select>
                            <button
                              onClick={() => {
                                updateRequirement(req._id, { title: req.title, description: req.description, priority: req.priority, status: req.status });
                                setRequirements(requirements.map(r => r._id === req._id ? {...r, editing: false} : r));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setRequirements(requirements.map(r => r._id === req._id ? {...r, editing: false} : r))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{req.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${req.priority === 'high' ? 'bg-red-100 text-red-700' : req.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {req.priority}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">{req.status}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRequirements(requirements.map(r => r._id === req._id ? {...r, editing: true} : r))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteRequirement(req._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setRequirements(requirements.filter(r => r.id !== req.id))}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'architecture' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Architecture Document</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={archForm.title}
                      onChange={(e) => setArchForm({...archForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={archForm.description}
                      onChange={(e) => setArchForm({...archForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <input
                      type="text"
                      placeholder="Diagram URL (optional)"
                      value={archForm.diagram_url}
                      onChange={(e) => setArchForm({...archForm, diagram_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <button
                      onClick={() => {
                        if (archForm.title) {
                          addArchitecture();
                          setArchForm({ title: '', description: '', diagram_url: '' });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {architectures.map((arch) => (
                    <div key={arch.id} className="border rounded p-4">
                      {arch.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={arch.title}
                            onChange={(e) => setArchitectures(architectures.map(a => a._id === arch._id ? {...a, title: e.target.value} : a))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={arch.description}
                            onChange={(e) => setArchitectures(architectures.map(a => a._id === arch._id ? {...a, description: e.target.value} : a))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <input
                            type="text"
                            placeholder="Diagram URL"
                            value={arch.diagram_url}
                            onChange={(e) => setArchitectures(architectures.map(a => a._id === arch._id ? {...a, diagram_url: e.target.value} : a))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                updateArchitecture(arch._id, { title: arch.title, description: arch.description, diagram_url: arch.diagram_url });
                                setArchitectures(architectures.map(a => a._id === arch._id ? {...a, editing: false} : a));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                updateArchitecture(arch._id, { title: arch.title, description: arch.description, diagram_url: arch.diagram_url });
                                setArchitectures(architectures.map(a => a._id === arch._id ? {...a, editing: false} : a));
                              }}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{arch.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{arch.description}</p>
                            {arch.diagram_url && (
                              <a href={arch.diagram_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                View Diagram
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setArchitectures(architectures.map(a => a._id === arch._id ? {...a, editing: true} : a))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteArchitecture(arch._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'design' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Design</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={designForm.title}
                      onChange={(e) => setDesignForm({...designForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={designForm.description}
                      onChange={(e) => setDesignForm({...designForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <input
                      type="text"
                      placeholder="Mockup URL (optional)"
                      value={designForm.mockup_url}
                      onChange={(e) => setDesignForm({...designForm, mockup_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <button
                      onClick={() => {
                        if (designForm.title) {
                          addDesign();
                          setDesignForm({ title: '', description: '', mockup_url: '' });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {designs.map((design) => (
                    <div key={design.id} className="border rounded p-4">
                      {design.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={design.title}
                            onChange={(e) => setDesigns(designs.map(d => d._id === design._id ? {...d, title: e.target.value} : d))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={design.description}
                            onChange={(e) => setDesigns(designs.map(d => d._id === design._id ? {...d, description: e.target.value} : d))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <input
                            type="text"
                            placeholder="Mockup URL"
                            value={design.mockup_url}
                            onChange={(e) => setDesigns(designs.map(d => d._id === design._id ? {...d, mockup_url: e.target.value} : d))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                updateDesign(design._id, { title: design.title, description: design.description, mockup_url: design.mockup_url });
                                setDesigns(designs.map(d => d._id === design._id ? {...d, editing: false} : d));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setDesigns(designs.map(d => d._id === design._id ? {...d, editing: false} : d))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{design.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{design.description}</p>
                            {design.mockup_url && (
                              <a href={design.mockup_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                View Mockup
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDesigns(designs.map(d => d._id === design._id ? {...d, editing: true} : d))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDesign(design._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'implementation' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Implementation</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={implForm.title}
                      onChange={(e) => setImplForm({...implForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={implForm.description}
                      onChange={(e) => setImplForm({...implForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <select
                        value={implForm.status}
                        onChange={(e) => setImplForm({...implForm, status: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Progress %"
                        value={implForm.progress}
                        onChange={(e) => setImplForm({...implForm, progress: parseInt(e.target.value) || 0})}
                        className="px-3 py-2 border rounded w-32"
                        min="0"
                        max="100"
                      />
                      <button
                        onClick={() => {
                          if (implForm.title) {
                            addImplementation();
                            setImplForm({ title: '', description: '', status: 'planned', progress: 0 });
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {implementations.map((impl) => (
                    <div key={impl.id} className="border rounded p-4">
                      {impl.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={impl.title}
                            onChange={(e) => setImplementations(implementations.map(i => i._id === impl._id ? {...i, title: e.target.value} : i))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={impl.description}
                            onChange={(e) => setImplementations(implementations.map(i => i._id === impl._id ? {...i, description: e.target.value} : i))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <div className="flex gap-3">
                            <select
                              value={impl.status}
                              onChange={(e) => setImplementations(implementations.map(i => i._id === impl._id ? {...i, status: e.target.value} : i))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="planned">Planned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            <input
                              type="number"
                              value={impl.progress}
                              onChange={(e) => setImplementations(implementations.map(i => i._id === impl._id ? {...i, progress: parseInt(e.target.value) || 0} : i))}
                              className="px-3 py-2 border rounded w-32"
                              min="0"
                              max="100"
                            />
                            <button
                              onClick={() => {
                                updateImplementation(impl._id, { title: impl.title, description: impl.description, status: impl.status, progress: impl.progress });
                                setImplementations(implementations.map(i => i._id === impl._id ? {...i, editing: false} : i));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setImplementations(implementations.map(i => i._id === impl._id ? {...i, editing: false} : i))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{impl.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{impl.description}</p>
                            <div className="flex gap-2 mt-2 items-center">
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">{impl.status}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${impl.progress}%`}}></div>
                              </div>
                              <span className="text-xs text-gray-600">{impl.progress}%</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setImplementations(implementations.map(i => i._id === impl._id ? {...i, editing: true} : i))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteImplementation(impl._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'tasks' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Task</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Assignee"
                        value={taskForm.assignee}
                        onChange={(e) => setTaskForm({...taskForm, assignee: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button
                        onClick={() => {
                          if (taskForm.title) {
                            addTask();
                            setTaskForm({ title: '', description: '', assignee: '', status: 'todo', priority: 'medium' });
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="border rounded p-4">
                      {task.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, title: e.target.value} : t))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={task.description}
                            onChange={(e) => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, description: e.target.value} : t))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="Assignee"
                              value={task.assignee}
                              onChange={(e) => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, assignee: e.target.value} : t))}
                              className="flex-1 px-3 py-2 border rounded"
                            />
                            <select
                              value={task.status}
                              onChange={(e) => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, status: e.target.value} : t))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <select
                              value={task.priority}
                              onChange={(e) => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, priority: e.target.value} : t))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <button
                              onClick={() => {
                                updateTask(task._id, { title: task.title, description: task.description, assignee: task.assignee, status: task.status, priority: task.priority });
                                setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, editing: false} : t));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, editing: false} : t))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <div className="flex gap-2 mt-2">
                              {task.assignee && <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">@{task.assignee}</span>}
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">{task.status}</span>
                              <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setProjectTasks(projectTasks.map(t => t._id === task._id ? {...t, editing: true} : t))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'code' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Repository</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Repository Name"
                      value={repoForm.name}
                      onChange={(e) => setRepoForm({...repoForm, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Repository URL"
                      value={repoForm.url}
                      onChange={(e) => setRepoForm({...repoForm, url: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Branch"
                        value={repoForm.branch}
                        onChange={(e) => setRepoForm({...repoForm, branch: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <button
                        onClick={() => {
                          if (repoForm.name && repoForm.url) {
                            addCode();
                            setRepoForm({ name: '', url: '', branch: 'main', description: '' });
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {codeRepos.map((repo) => (
                    <div key={repo.id} className="border rounded p-4">
                      {repo.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Repository Name"
                            value={repo.name}
                            onChange={(e) => setCodeRepos(codeRepos.map(r => r._id === repo._id ? {...r, name: e.target.value} : r))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Repository URL"
                            value={repo.url}
                            onChange={(e) => setCodeRepos(codeRepos.map(r => r._id === repo._id ? {...r, url: e.target.value} : r))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="Branch"
                              value={repo.branch}
                              onChange={(e) => setCodeRepos(codeRepos.map(r => r._id === repo._id ? {...r, branch: e.target.value} : r))}
                              className="flex-1 px-3 py-2 border rounded"
                            />
                            <button
                              onClick={() => {
                                updateCode(repo._id, { name: repo.name, url: repo.url, branch: repo.branch, description: repo.description });
                                setCodeRepos(codeRepos.map(r => r._id === repo._id ? {...r, editing: false} : r));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setCodeRepos(codeRepos.map(r => r._id === repo._id ? {...r, editing: false} : r))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{repo.name}</h4>
                            <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {repo.url}
                            </a>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">Branch: {repo.branch}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCodeRepos(codeRepos.map(r => r._id === repo._id ? {...r, editing: true} : r))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setCodeRepos(codeRepos.filter(r => r.id !== repo.id))}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'issues' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Issue</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={issueForm.title}
                      onChange={(e) => setIssueForm({...issueForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={issueForm.description}
                      onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <select
                        value={issueForm.severity}
                        onChange={(e) => setIssueForm({...issueForm, severity: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <select
                        value={issueForm.status}
                        onChange={(e) => setIssueForm({...issueForm, status: e.target.value})}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Assignee"
                        value={issueForm.assignee}
                        onChange={(e) => setIssueForm({...issueForm, assignee: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <button
                        onClick={() => {
                          if (issueForm.title) {
                            addIssue();
                            setIssueForm({ title: '', description: '', severity: 'medium', status: 'open', assignee: '' });
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div key={issue.id} className="border rounded p-4">
                      {issue.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={issue.title}
                            onChange={(e) => setIssues(issues.map(i => i._id === issue._id ? {...i, title: e.target.value} : i))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <textarea
                            value={issue.description}
                            onChange={(e) => setIssues(issues.map(i => i._id === issue._id ? {...i, description: e.target.value} : i))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <div className="flex gap-3">
                            <select
                              value={issue.severity}
                              onChange={(e) => setIssues(issues.map(i => i._id === issue._id ? {...i, severity: e.target.value} : i))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                            <select
                              value={issue.status}
                              onChange={(e) => setIssues(issues.map(i => i._id === issue._id ? {...i, status: e.target.value} : i))}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="open">Open</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Assignee"
                              value={issue.assignee}
                              onChange={(e) => setIssues(issues.map(i => i._id === issue._id ? {...i, assignee: e.target.value} : i))}
                              className="flex-1 px-3 py-2 border rounded"
                            />
                            <button
                              onClick={() => {
                                updateIssue(issue._id, { title: issue.title, description: issue.description, severity: issue.severity, status: issue.status, assignee: issue.assignee });
                                setIssues(issues.map(i => i._id === issue._id ? {...i, editing: false} : i));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIssues(issues.map(i => i._id === issue._id ? {...i, editing: false} : i))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{issue.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${issue.severity === 'critical' ? 'bg-red-600 text-white' : issue.severity === 'high' ? 'bg-red-100 text-red-700' : issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {issue.severity}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">{issue.status}</span>
                              {issue.assignee && <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">@{issue.assignee}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIssues(issues.map(i => i._id === issue._id ? {...i, editing: true} : i))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setIssues(issues.filter(i => i.id !== issue.id))}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSubTab === 'meetings' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Add Meeting</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={meetingForm.title}
                      onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <div className="flex gap-3">
                      <input
                        type="date"
                        value={meetingForm.date}
                        onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <input
                        type="time"
                        value={meetingForm.time}
                        onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                    </div>
                    <textarea
                      placeholder="Agenda"
                      value={meetingForm.agenda}
                      onChange={(e) => setMeetingForm({...meetingForm, agenda: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                    />
                    <textarea
                      placeholder="Notes"
                      value={meetingForm.notes}
                      onChange={(e) => setMeetingForm({...meetingForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                    />
                    <button
                      onClick={() => {
                        if (meetingForm.title) {
                          addMeeting();
                          setMeetingForm({ title: '', date: '', time: '', agenda: '', notes: '' });
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded p-4">
                      {meeting.editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={meeting.title}
                            onChange={(e) => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, title: e.target.value} : m))}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <div className="flex gap-3">
                            <input
                              type="date"
                              value={meeting.date}
                              onChange={(e) => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, date: e.target.value} : m))}
                              className="flex-1 px-3 py-2 border rounded"
                            />
                            <input
                              type="time"
                              value={meeting.time}
                              onChange={(e) => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, time: e.target.value} : m))}
                              className="flex-1 px-3 py-2 border rounded"
                            />
                          </div>
                          <textarea
                            placeholder="Agenda"
                            value={meeting.agenda}
                            onChange={(e) => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, agenda: e.target.value} : m))}
                            className="w-full px-3 py-2 border rounded"
                            rows={2}
                          />
                          <textarea
                            placeholder="Notes"
                            value={meeting.notes}
                            onChange={(e) => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, notes: e.target.value} : m))}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                updateMeeting(meeting._id, { title: meeting.title, date: meeting.date, time: meeting.time, agenda: meeting.agenda, notes: meeting.notes });
                                setMeetings(meetings.map(m => m._id === meeting._id ? {...m, editing: false} : m));
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, editing: false} : m))}
                              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              {meeting.date && meeting.time && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  {meeting.date} at {meeting.time}
                                </span>
                              )}
                            </div>
                            {meeting.agenda && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-700">Agenda:</p>
                                <p className="text-sm text-gray-600">{meeting.agenda}</p>
                              </div>
                            )}
                            {meeting.notes && (
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-700">Notes:</p>
                                <p className="text-sm text-gray-600">{meeting.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setMeetings(meetings.map(m => m._id === meeting._id ? {...m, editing: true} : m))}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMeeting(meeting._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'profile' ? (
        <div className="max-w-4xl mx-auto px-4 py-4">
          {message && (
            <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Profile</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border rounded-lg ${!isEditingProfile ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border rounded-lg ${!isEditingProfile ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border rounded-lg ${!isEditingProfile ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileData.api_key}
                    disabled
                    className="flex-1 px-4 py-2 border rounded-lg bg-gray-100 font-mono text-sm"
                  />
                  {isEditingProfile && (
                    <button
                      type="button"
                      onClick={handleRegenerateApiKey}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      loadProfile();
                    }}
                    className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : activeTab === 'knowledge' ? (
        <div className="max-w-7xl mx-auto px-4 py-4">
          {message && (
            <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>
          )}

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Files</h2>
              <div className="flex gap-2">
                <select
                  value={workspaceType}
                  onChange={(e) => setWorkspaceType(e.target.value as 'private' | 'team')}
                  className="px-3 py-1 border rounded"
                >
                  <option value="private">Private</option>
                  <option value="team">Team</option>
                </select>
                <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  Upload
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">{file.path}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => teamApi.downloadFile(file.path)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.path)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <p className="text-gray-600 text-center py-4">No files yet</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Semantic Search</h2>
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files by content..."
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Search
                </button>
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((result, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{result.file_name}</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {result.similarity_score}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{result.file_path}</p>
                    {result.content_preview && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <div className="font-medium text-xs text-gray-500 mb-1">Preview:</div>
                        <div className="line-clamp-3">{result.content_preview}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'team' ? (
        <div className="max-w-4xl mx-auto px-4 py-4">
          {message && (
            <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>
          )}

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setTeamSubTab('my-teams')}
                className={`px-4 py-2 font-medium transition-colors ${teamSubTab === 'my-teams'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                My Teams
              </button>
              <button
                onClick={() => setTeamSubTab('all-teams')}
                className={`px-4 py-2 font-medium transition-colors ${teamSubTab === 'all-teams'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                All Teams
              </button>
            </div>

            {teamSubTab === 'my-teams' ? (
              <div>
                <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                  {myTeams.length > 0 ? (
                    myTeams.map((team) => (
                      <div
                        key={team.id}
                        onClick={() => handleSelectTeam(team)}
                        className={`flex-shrink-0 w-64 p-3 border rounded-lg cursor-pointer ${selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}`}
                      >
                        <div className="font-medium truncate">{team.team_name}</div>
                        {team.specialization && (
                          <div className="text-sm text-gray-600 truncate">{team.specialization}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Role: {team.role}</div>
                        {team.role === 'admin' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                            className="mt-2 w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete Team
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No teams yet</p>
                  )}
                </div>

                {selectedTeam && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Team Members - {selectedTeam.team_name}</h4>
                    
                    {selectedTeam.role === 'admin' && (
                      <form onSubmit={handleAddMember} className="mb-4">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="Enter member email"
                            className="flex-1 px-3 py-2 text-sm border rounded"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add Member
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="text-sm font-medium">{member.username || member.email}</div>
                            <div className="text-xs text-gray-500">
                              Role: {member.role} | Status: {member.status || 'active'}
                            </div>
                          </div>
                          {selectedTeam.role === 'admin' && member.role !== 'admin' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleMemberStatus(member.id, member.status || 'active')}
                                className={`px-2 py-1 text-xs rounded ${member.status === 'disabled' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
                              >
                                {member.status === 'disabled' ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm mb-2">Team member list unavailable</p>
                          <p className="text-xs text-gray-400">Backend endpoint /api/teams/:id/members needs to be implemented</p>
                        </div>
                      )}
                    </div>

                    {selectedTeam.role === 'admin' && (
                      <div className="border-t mt-4 pt-4">
                        <h4 className="font-medium mb-3">Send Broadcast Message</h4>
                        <form onSubmit={handleSendBroadcast} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Message Type</label>
                            <select
                              value={broadcastType}
                              onChange={(e) => setBroadcastType(e.target.value)}
                              className="w-full px-3 py-2 text-sm border rounded"
                            >
                              <option value="general">General</option>
                              <option value="announcement">Announcement</option>
                              <option value="urgent">Urgent</option>
                              <option value="reminder">Reminder</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                              value={broadcastMessage}
                              onChange={(e) => setBroadcastMessage(e.target.value)}
                              placeholder="Enter broadcast message..."
                              rows={3}
                              className="w-full px-3 py-2 text-sm border rounded"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Send Broadcast
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                  {myTeams.length > 0 ? (
                    myTeams.map((team) => (
                      <div
                        key={team.id}
                        onClick={() => handleSelectTeam(team)}
                        className={`flex-shrink-0 w-64 p-3 border rounded-lg cursor-pointer ${selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}`}
                      >
                        <div className="font-medium truncate">{team.team_name}</div>
                        {team.specialization && (
                          <div className="text-sm text-gray-600 truncate">{team.specialization}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Role: {team.role}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No teams yet</p>
                  )}
                </div>

                {selectedTeam && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Team Members - {selectedTeam.team_name}</h4>
                    
                    {selectedTeam.role === 'admin' && (
                      <form onSubmit={handleAddMember} className="mb-4">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="Enter member email"
                            className="flex-1 px-3 py-2 text-sm border rounded"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add Member
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="text-sm font-medium">{member.username || member.email}</div>
                            <div className="text-xs text-gray-500">
                              Role: {member.role} | Status: {member.status || 'active'}
                            </div>
                          </div>
                          {selectedTeam.role === 'admin' && member.role !== 'admin' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleMemberStatus(member.id, member.status || 'active')}
                                className={`px-2 py-1 text-xs rounded ${member.status === 'disabled' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
                              >
                                {member.status === 'disabled' ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm mb-2">Team member list unavailable</p>
                          <p className="text-xs text-gray-400">Backend endpoint /api/teams/:id/members needs to be implemented</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setTeamActionTab('create')}
                className={`px-4 py-2 font-medium transition-colors ${teamActionTab === 'create'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Create Team
              </button>
              <button
                onClick={() => setTeamActionTab('join')}
                className={`px-4 py-2 font-medium transition-colors ${teamActionTab === 'join'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Join Team
              </button>
            </div>

            {teamActionTab === 'create' ? (
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g., AI Development, Data Science"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your team's purpose and goals"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Team
                </button>
              </form>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Search Teams</h3>
                  <form onSubmit={handleTeamSearch} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        placeholder="Search by name, specialization..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Search
                      </button>
                    </div>
                  </form>

                  {teamSearchResults.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {teamSearchResults.map((team) => (
                        <div key={team.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{team.team_name}</div>
                              {team.specialization && (
                                <div className="text-sm text-gray-600">{team.specialization}</div>
                              )}
                              {team.description && (
                                <div className="text-sm text-gray-500 mt-1">{team.description}</div>
                              )}
                            </div>
                            <button
                              onClick={() => setTeamId(team.id)}
                              className="ml-4 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleJoinTeam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team ID *</label>
                    <input
                      type="text"
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      placeholder="Enter team ID or select from search"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Join Team
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-4">
          {message && (
            <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>
          )}

          <div className="mb-4 flex gap-2 border-b">
            <button
              onClick={() => setDashboardSubTab('notifications')}
              className={`px-4 py-2 font-medium ${dashboardSubTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Team Notifications
            </button>
            <button
              onClick={() => setDashboardSubTab('todo-list')}
              className={`px-4 py-2 font-medium ${dashboardSubTab === 'todo-list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              To-Do List
            </button>
            <button
              onClick={() => setDashboardSubTab('calendar')}
              className={`px-4 py-2 font-medium ${dashboardSubTab === 'calendar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Calendar
            </button>
          </div>

          {dashboardSubTab === 'notifications' ? (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold mb-4">Team Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notif, i) => (
                  <div key={i} className={`p-4 border rounded-lg cursor-pointer ${selectedNotification?._id === notif._id ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => setSelectedNotification(notif)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {notif.team_name && (
                          <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 font-medium">
                            {notif.team_name}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded ${
                          notif.message_type === 'urgent' ? 'bg-red-100 text-red-800' :
                          notif.message_type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                          notif.message_type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notif.message_type}
                        </span>
                        <span className="text-sm font-medium text-gray-700">From: {notif.sender}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{notif.message}</p>
                    {notif.replies && notif.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                        {notif.replies.map((reply: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-gray-600">{reply.sender}:</span>
                            <span className="text-gray-700 ml-2">{reply.message}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}
                
                {selectedNotification && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Reply to this notification</h3>
                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-3 py-2 text-sm border rounded"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Send Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
          ) : dashboardSubTab === 'todo-list' ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">To-Do List</h2>
              <form onSubmit={addTodo} className="mb-4">
                <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {todos.map((todo) => (
                <div key={todo._id} className="flex items-center gap-2 p-3 border rounded">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo._id)}
                    className="w-4 h-4"
                  />
                  {todo.editing ? (
                    <>
                      <input
                        type="text"
                        defaultValue={todo.text}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(todo._id, e.currentTarget.value);
                          if (e.key === 'Escape') cancelEdit(todo._id);
                        }}
                        className="flex-1 px-2 py-1 border rounded"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveEdit(todo._id, (e.currentTarget.previousElementSibling as HTMLInputElement)?.value || todo.text)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEdit(todo._id)}
                        className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => startEdit(todo._id)}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
              {todos.length === 0 && (
                <p className="text-gray-600 text-center py-4">No tasks yet. Add one above!</p>
              )}
            </div>
            </div>
          ) : null}

          {dashboardSubTab === 'calendar' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Calendar</h2>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      ←
                    </button>
                    <span className="font-medium">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-100">
                      {day}
                    </div>
                  ))}
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const days = [];
                    
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="border p-2 h-20 bg-gray-50"></div>);
                    }
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEvents = calendarEvents.filter(e => e.date === dateStr);
                      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                      
                      days.push(
                        <div key={day} className={`border p-2 h-20 overflow-y-auto ${isToday ? 'bg-blue-50 border-blue-400' : ''}`}>
                          <div className="font-semibold text-sm">{day}</div>
                          {dayEvents.map((evt, i) => (
                            <div key={i} className="text-xs bg-blue-100 text-blue-800 px-1 rounded mt-1 truncate" title={evt.title}>
                              {evt.time} {evt.title}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    return days;
                  })()}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Add Event</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Event title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                  <button
                    onClick={() => {
                      if (eventForm.title && eventForm.date) {
                        setCalendarEvents([...calendarEvents, {...eventForm, id: Date.now()}]);
                        setEventForm({ title: '', date: '', time: '', description: '' });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Event
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Upcoming Events</h3>
                  <div className="space-y-2">
                    {calendarEvents
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((evt) => (
                        <div key={evt.id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{evt.title}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                {evt.time && ` at ${evt.time}`}
                              </p>
                              {evt.description && <p className="text-sm text-gray-600 mt-1">{evt.description}</p>}
                            </div>
                            <button
                              onClick={() => setCalendarEvents(calendarEvents.filter(e => e.id !== evt.id))}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    {calendarEvents.length === 0 && (
                      <p className="text-gray-600 text-center py-4">No events scheduled</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
