import React from 'react';
import { TeamSubTab, TeamActionTab, Notification } from '../../types/team.types';

interface TeamTabProps {
  teamSubTab: TeamSubTab;
  setTeamSubTab: (tab: TeamSubTab) => void;
  teamActionTab: TeamActionTab;
  setTeamActionTab: (tab: TeamActionTab) => void;
  myTeams: any[];
  selectedTeam: any;
  handleSelectTeam: (team: any) => void;
  teamMembers: any[];
  newMemberEmail: string;
  setNewMemberEmail: (email: string) => void;
  handleAddMember: (setMessage: (msg: string) => void) => void;
  handleRemoveMember: (memberId: string, setMessage: (msg: string) => void) => void;
  handleDeleteTeam: (teamId: string, setMessage: (msg: string) => void) => void;
  teamName: string;
  setTeamName: (name: string) => void;
  specialization: string;
  setSpecialization: (spec: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  handleCreateTeam: (setMessage: (msg: string) => void) => void;
  teamId: string;
  setTeamId: (id: string) => void;
  teamSearchQuery: string;
  setTeamSearchQuery: (query: string) => void;
  teamSearchResults: any[];
  handleTeamSearch: (setMessage: (msg: string) => void) => void;
  handleJoinTeam: (setMessage: (msg: string) => void) => void;
  broadcastMessage: string;
  setBroadcastMessage: (msg: string) => void;
  broadcastType: string;
  setBroadcastType: (type: string) => void;
  handleSendBroadcast: (selectedTeam: any, setMessage: (msg: string) => void, loadNotifications: (teamId: string) => void) => void;
  loadNotifications: (teamId: string) => void;
  notifications: Notification[];
  message: string;
  setMessage: (msg: string) => void;
}

export function TeamTab(props: TeamTabProps) {
  const {
    teamSubTab, setTeamSubTab, teamActionTab, setTeamActionTab, myTeams, selectedTeam, handleSelectTeam,
    teamMembers, newMemberEmail, setNewMemberEmail, handleAddMember, handleRemoveMember, handleDeleteTeam,
    teamName, setTeamName, specialization, setSpecialization, description, setDescription, handleCreateTeam,
    teamId, setTeamId, teamSearchQuery, setTeamSearchQuery, teamSearchResults, handleTeamSearch, handleJoinTeam,
    broadcastMessage, setBroadcastMessage, broadcastType, setBroadcastType, handleSendBroadcast, loadNotifications,
    notifications, message, setMessage
  } = props;

  const onCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateTeam(setMessage);
  };

  const onJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoinTeam(setMessage);
  };

  const onAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddMember(setMessage);
  };

  const onBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendBroadcast(selectedTeam, setMessage, loadNotifications);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {message && <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">{message}</div>}

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button onClick={() => setTeamSubTab('my-teams')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${teamSubTab === 'my-teams' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Teams</button>
            <button onClick={() => setTeamSubTab('all-teams')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${teamSubTab === 'all-teams' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>All Teams</button>
            <button onClick={() => setTeamSubTab('notifications')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${teamSubTab === 'notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Notifications</button>
          </nav>
        </div>

        <div className="p-6">
          {teamSubTab === 'my-teams' ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {myTeams.length > 0 ? myTeams.map((team) => (
                  <div key={team.id} onClick={() => handleSelectTeam(team)} className={`relative p-5 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate pr-2">{team.team_name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${team.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{team.role}</span>
                    </div>
                    {team.specialization && <p className="text-sm text-gray-600 mb-3 truncate">{team.specialization}</p>}
                    {team.role === 'admin' && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id, setMessage); }} className="w-full mt-2 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete Team</button>
                    )}
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    No teams yet
                  </div>
                )}
              </div>

              {selectedTeam && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Members - {selectedTeam.team_name}</h4>
                  {selectedTeam.role === 'admin' && (
                    <form onSubmit={onAddMember} className="mb-6">
                      <div className="flex gap-3">
                        <input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Enter member email" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Member</button>
                      </div>
                    </form>
                  )}
                  <div className="overflow-hidden border border-gray-200 rounded-lg mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teamMembers.map((member) => (
                          <tr key={member._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{member.username || member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{member.role}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {selectedTeam.role === 'admin' && member.role !== 'admin' ? (
                                <button onClick={() => handleRemoveMember(member._id, setMessage)} className="text-red-600 hover:text-red-900">Remove</button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedTeam.role === 'admin' && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Send Broadcast Message</h4>
                      <form onSubmit={onBroadcast} className="space-y-4">
                        <div>
                          <label htmlFor="broadcast-type" className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                          <select id="broadcast-type" value={broadcastType} onChange={(e) => setBroadcastType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="general">General</option>
                            <option value="announcement">Announcement</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="broadcast-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                          <textarea id="broadcast-message" value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Enter broadcast message..." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
                        </div>
                        <button type="submit" className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Send Broadcast</button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
        ) : teamSubTab === 'notifications' ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Team Notifications</h3>
            {selectedTeam ? (
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {notifications.filter(n => n.team_id === selectedTeam.id).length > 0 ? (
                    notifications.filter(n => n.team_id === selectedTeam.id).map((notification, idx, arr) => (
                      <li key={notification._id}>
                        <div className="relative pb-8">
                          {idx !== arr.length - 1 && (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${notification.type === 'urgent' ? 'bg-red-500' : notification.type === 'announcement' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium text-gray-900">{notification.from_user || 'System'}</span>
                                  {' '}{notification.type && <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{notification.type}</span>}
                                </p>
                                <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time dateTime={notification.created_at}>
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm py-4">No notifications for this team</li>
                  )}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Please select a team to view notifications</p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex gap-3 mb-6">
              <button onClick={() => setTeamActionTab('create')} className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${teamActionTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Create Team</button>
              <button onClick={() => setTeamActionTab('join')} className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${teamActionTab === 'join' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Join Team</button>
            </div>

            {teamActionTab === 'create' ? (
              <form onSubmit={onCreateTeam} className="space-y-6">
                <div>
                  <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <input type="text" id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization (Optional)</label>
                  <input type="text" id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Development, Design, Marketing" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your team..." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Create Team</button>
              </form>
            ) : (
              <form onSubmit={onJoinTeam} className="space-y-6">
                <div>
                  <label htmlFor="team-id" className="block text-sm font-medium text-gray-700 mb-1">Team ID</label>
                  <input type="text" id="team-id" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="Enter team ID to join" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
                  <p className="mt-1 text-xs text-gray-500">Ask your team admin for the team ID</p>
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Join Team</button>
              </form>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
