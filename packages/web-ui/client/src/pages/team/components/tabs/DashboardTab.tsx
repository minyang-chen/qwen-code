import React from 'react';
import { DashboardSubTab } from '../../types/team.types';

interface DashboardTabProps {
  dashboardSubTab: DashboardSubTab;
  setDashboardSubTab: (tab: DashboardSubTab) => void;
  notifications: any[];
  selectedNotification: any;
  setSelectedNotification: (notif: any) => void;
  replyMessage: string;
  setReplyMessage: (msg: string) => void;
  handleSendReply: (selectedTeam: any, setMessage: (msg: string) => void) => void;
  todos: any[];
  setTodos: (todos: any[]) => void;
  newTodo: string;
  setNewTodo: (text: string) => void;
  addTodo: (e: React.FormEvent) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  startEditing: (id: string) => void;
  cancelEditing: (id: string) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  calendarEvents: any[];
  setCalendarEvents: (events: any[]) => void;
  eventForm: any;
  setEventForm: (form: any) => void;
  addCalendarEvent: () => void;
  deleteCalendarEvent: (id: string) => void;
  previousMonth: () => void;
  nextMonth: () => void;
  selectedTeam: any;
  message: string;
  setMessage: (msg: string) => void;
}

export function DashboardTab(props: DashboardTabProps) {
  const {
    dashboardSubTab, setDashboardSubTab, notifications, selectedNotification, setSelectedNotification,
    replyMessage, setReplyMessage, handleSendReply, todos, setTodos, newTodo, setNewTodo,
    addTodo, toggleTodo, deleteTodo, updateTodo, startEditing, cancelEditing,
    currentMonth, calendarEvents, eventForm, setEventForm, addCalendarEvent, deleteCalendarEvent,
    previousMonth, nextMonth, selectedTeam, message, setMessage
  } = props;

  const onReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendReply(selectedTeam, setMessage);
  };

  const sidebarItems = [
    { id: 'notifications' as DashboardSubTab, label: '🔔 Team Notifications' },
    { id: 'todo-list' as DashboardSubTab, label: '✅ To-Do List' },
    { id: 'calendar' as DashboardSubTab, label: '📅 Calendar' }
  ];

  return (
    <div className="flex h-full">
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <nav className="space-y-1">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setDashboardSubTab(item.id)} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${dashboardSubTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {message && <div className="mb-4 p-4 bg-blue-100 rounded">{message}</div>}

      {dashboardSubTab === 'notifications' && (
        <div className="max-w-3xl">
          {!selectedTeam ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <p className="mt-4 text-gray-500">Please select a team to view notifications</p>
            </div>
          ) : notifications.filter(n => n.team_id === selectedTeam.id).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p className="mt-4 text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {notifications.filter(n => n.team_id === selectedTeam.id).map((notif, idx, arr) => (
                  <li key={notif._id || idx}>
                    <div className="relative pb-8">
                      {idx !== arr.length - 1 && <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedNotification(notif)}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{notif.sender}</span>
                                {notif.team_name && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{notif.team_name}</span>}
                              </div>
                              <time className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</time>
                            </div>
                            <p className="text-sm text-gray-700">{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedNotification && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Reply to notification</h3>
              <form onSubmit={onReplySubmit} className="flex gap-3">
                <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type your reply..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Send</button>
              </form>
            </div>
          )}
        </div>
      )}

      {dashboardSubTab === 'todo-list' && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">To-Do List</h2>
            </div>
            <div className="p-6">
              <form onSubmit={addTodo} className="mb-6">
                <div className="flex gap-3">
                  <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add a new task..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Task</button>
                </div>
              </form>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th scope="col" className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todos.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No tasks yet. Add one above!</td>
                      </tr>
                    ) : (
                      todos.map((todo) => (
                        <tr key={todo._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo._id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                          </td>
                          <td className="px-6 py-4">
                            {todo.editing ? (
                              <input type="text" defaultValue={todo.text} onBlur={(e) => { updateTodo(todo._id, e.target.value); cancelEditing(todo._id); }} className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" autoFocus />
                            ) : (
                              <span className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{todo.text}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {todo.editing ? (
                              <button onClick={() => cancelEditing(todo._id)} className="text-gray-600 hover:text-gray-900">Cancel</button>
                            ) : (
                              <div className="flex justify-end gap-3">
                                <button onClick={() => startEditing(todo._id)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                <button onClick={() => deleteTodo(todo._id)} className="text-red-600 hover:text-red-900">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardSubTab === 'calendar' && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-2">
                <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-700 uppercase">{day}</div>
                ))}
                {(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const today = new Date();
                  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  const days = [];
                  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="bg-white min-h-24"></div>);
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = calendarEvents.filter(e => e.date === dateStr);
                    days.push(
                      <div key={day} className="bg-white p-2 min-h-24 hover:bg-gray-50 transition-colors">
                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>{day}</div>
                        <div className="space-y-1">
                          {dayEvents.map((evt, i) => (
                            <div key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate" title={`${evt.time} ${evt.title}`}>
                              <span className="font-medium">{evt.time}</span> {evt.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Event</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="time" value={eventForm.time} onChange={(e) => setEventForm({...eventForm, time: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button onClick={addCalendarEvent} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Event</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
