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

  useEffect(() => {
    loadFiles();
    loadMyTeams();
    loadTodos();
    setUsername(localStorage.getItem('team_username') || '');
    loadProfile();
  }, [workspaceType, selectedTeamId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
                Project
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
          <div className="flex flex-col items-center gap-1">
            <div className="text-gray-700 text-xs">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' '}
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
        </div>
      </nav>

      {activeTab === 'task-assistant' ? (
        <div className="h-[calc(100vh-80px)]">
          <TaskAgent workspaceType={workspaceType} selectedTeamId={selectedTeamId} />
        </div>
      ) : activeTab === 'project' ? (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Project</h2>
            <p className="text-gray-600">Project management features coming soon...</p>
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
                        onClick={(e) => saveEdit(todo._id, e.currentTarget.previousElementSibling?.['value'] || todo.text)}
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
        </div>
      )}
    </div>
  );
}
