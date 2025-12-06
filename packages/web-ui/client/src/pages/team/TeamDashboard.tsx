import { useState, useEffect } from 'react';
import { teamApi } from '../../services/team/api';
import { TaskAgent } from './TaskAgent';

type TabType = 'workspace' | 'team' | 'task-agent';

export function TeamDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');
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

  useEffect(() => {
    loadFiles();
    loadMyTeams();
  }, [workspaceType, selectedTeamId]);

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
    window.location.href = '/team/login';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Team Workspace</h1>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-4 py-2 font-medium rounded transition-colors ${
                activeTab === 'workspace'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 font-medium rounded transition-colors ${
                activeTab === 'team'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveTab('task-agent')}
              className={`px-4 py-2 font-medium rounded transition-colors ${
                activeTab === 'task-agent'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Task Agent
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </nav>

      {activeTab === 'task-agent' ? (
        <div className="h-[calc(100vh-80px)]">
          <TaskAgent workspaceType={workspaceType} selectedTeamId={selectedTeamId} />
        </div>
      ) : activeTab === 'team' ? (
        <div className="max-w-4xl mx-auto px-4 py-4">
          {message && (
            <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>
          )}

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-sm font-medium mb-3">My Teams</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {myTeams.length > 0 ? (
                myTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex-shrink-0 w-64 p-3 border rounded-lg hover:border-blue-500 cursor-pointer"
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
          </div>

          <div className="bg-white p-8 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-bold mb-6">Create Team</h2>
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
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Join Team</h2>
            
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
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-4">
        {message && (
          <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-bold mb-4">My Teams</h2>
          {myTeams.length > 0 ? (
            <div className="space-y-2">
              {myTeams.map((team) => (
                <div key={team.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{team.team_name}</div>
                      {team.specialization && (
                        <div className="text-sm text-gray-600">{team.specialization}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Role: {team.role}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-400">ID: {team.id}</div>
                      {team.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Your teams will appear here once you create or join one.</p>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
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

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
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
      )}
    </div>
  );
}
