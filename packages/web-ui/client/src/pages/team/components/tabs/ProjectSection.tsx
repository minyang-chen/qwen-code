import React from 'react';

interface ProjectSectionProps {
  title: string;
  items: any[];
  fields: { name: string; label: string }[];
  form: any;
  setForm: (form: any) => void;
  onAdd: () => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  formFields: { name: string; placeholder: string; type?: string }[];
}

export function ProjectSection({
  title,
  items,
  fields,
  form,
  setForm,
  onAdd,
  onUpdate,
  onDelete,
  formFields
}: ProjectSectionProps) {
  const [page, setPage] = React.useState(1);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [subTab, setSubTab] = React.useState<'new' | 'list'>('list');
  const itemsPerPage = 10;
  
  // Only show sub-tabs for Project section
  const showSubTabs = title === 'Project';
  
  // Show stats for Analysis, Plan, and Deliverable sections
  const showStats = title === 'Analysis' || title === 'Plan' || title === 'Deliverable';

  const safeItems = items || [];
  const total = safeItems.length;
  const paginated = safeItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(total / itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd();
    setForm({});
    setSubTab('list');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Sub-tabs - Only for Project section */}
      {showSubTabs && (
        <div className="px-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setSubTab('new')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                subTab === 'new' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              New Project
            </button>
            <button
              onClick={() => setSubTab('list')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                subTab === 'list' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              List of Projects ({total})
            </button>
          </nav>
        </div>
      )}

      {/* Stats - For Analysis section */}
      {showStats && title === 'Analysis' && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Analysis</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Risk Analysis</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{safeItems.filter((a: any) => a.type?.toLowerCase().includes('risk')).length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Cost Analysis</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{safeItems.filter((a: any) => a.type?.toLowerCase().includes('cost')).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Feasibility</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{safeItems.filter((a: any) => a.type?.toLowerCase().includes('feasibility')).length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats - For Plan section */}
      {showStats && title === 'Plan' && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Plans</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                </div>
                <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-lime-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{safeItems.filter((p: any) => {
                    const now = new Date();
                    const start = p.startDate ? new Date(p.startDate) : null;
                    const end = p.endDate ? new Date(p.endDate) : null;
                    return start && end && start <= now && now <= end;
                  }).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{safeItems.filter((p: any) => {
                    const now = new Date();
                    const start = p.startDate ? new Date(p.startDate) : null;
                    return start && start > now;
                  }).length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{safeItems.filter((p: any) => {
                    const now = new Date();
                    const end = p.endDate ? new Date(p.endDate) : null;
                    return end && end < now;
                  }).length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats - For Deliverable section */}
      {showStats && title === 'Deliverable' && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Deliverables</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{safeItems.filter((d: any) => d.status?.toLowerCase() === 'completed').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{safeItems.filter((d: any) => d.status?.toLowerCase().includes('progress')).length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{safeItems.filter((d: any) => d.status?.toLowerCase() === 'pending').length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats - Only for Project section */}
      {showSubTabs && subTab === 'list' && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{safeItems.filter((p: any) => p.status?.toLowerCase() === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Planning</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{safeItems.filter((p: any) => p.status?.toLowerCase() === 'planning').length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{safeItems.filter((p: any) => p.status?.toLowerCase() === 'completed').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
              <span className="text-sm font-medium text-gray-700">Total: <span className="font-bold text-gray-900">{total}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <span className="text-sm font-medium text-gray-700">Page: <span className="font-bold text-gray-900">{page} of {totalPages || 1}</span></span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Form - Show based on sub-tab for Project, always show for other sections */}
        {(!showSubTabs || subTab === 'new') && (
          <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <div className="grid grid-cols-2 gap-3 mb-3">
            {formFields.map(field => {
              if (field.type === 'textarea') {
                return (
                  <textarea
                    key={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name] || ''}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                );
              }
              if (field.type === 'teams') {
                return (
                  <div key={field.name} className="col-span-2">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form._teamsInput || ''}
                      onChange={(e) => {
                        const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setForm({ ...form, _teamsInput: e.target.value, teams: items });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              }
              if (field.type === 'members') {
                return (
                  <div key={field.name} className="col-span-2">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form._membersInput || ''}
                      onChange={(e) => {
                        const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setForm({ ...form, _membersInput: e.target.value, members: items });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              }
              if (field.type === 'approvals') {
                return (
                  <div key={field.name} className="col-span-2">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form._approvalsInput || ''}
                      onChange={(e) => {
                        const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setForm({ ...form, _approvalsInput: e.target.value, approvals: items.map(item => ({ item, checked: false })) });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              }
              return (
                <input
                  key={field.name}
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              );
            })}
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Add {title}
          </button>
        </form>
        )}

        {/* List - Show based on sub-tab for Project, always show for other sections */}
        {(!showSubTabs || subTab === 'list') && (
          <>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {fields.map(field => (
                  <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{field.label}</th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr><td colSpan={fields.length + 1} className="px-6 py-12 text-center text-gray-500">No items yet</td></tr>
              ) : (
                paginated.map((item) => (
                  <React.Fragment key={item._id}>
                    <tr className="hover:bg-gray-50">
                      {fields.map(field => (
                        <td key={field.name} className="px-6 py-4">
                          {editingId === item._id ? (
                            <input
                              type="text"
                              defaultValue={item[field.name]}
                              onBlur={(e) => {
                                onUpdate(item._id, { ...item, [field.name]: e.target.value });
                                setEditingId(null);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item[field.name]}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="text-green-600 hover:text-green-900 mr-3">
                          {expandedId === item._id ? 'Collapse' : 'Expand'}
                        </button>
                        <button onClick={() => setEditingId(item._id)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button onClick={() => onDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                    {expandedId === item._id && (
                      <tr>
                        <td colSpan={fields.length + 1} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                              {item.description && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description:</h4>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-200">{item.description}</p>
                                </div>
                              )}
                            </div>
                            
                            {item.budget && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Budget</h4>
                                <p className="text-sm text-gray-900 font-medium">{item.budget}</p>
                              </div>
                            )}
                            
                            {item.sponsor && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Sponsor</h4>
                                <p className="text-sm text-gray-900">{item.sponsor}</p>
                              </div>
                            )}
                            
                            {item.funding && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Funding Source</h4>
                                <p className="text-sm text-gray-900">{item.funding}</p>
                              </div>
                            )}
                            
                            {item.deadline && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Deadline</h4>
                                <p className="text-sm text-gray-900">{item.deadline}</p>
                              </div>
                            )}
                            
                            {item.teams && item.teams.length > 0 && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Project Teams</h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.teams.map((team: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                      {team}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {item.members && item.members.length > 0 && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Team Members</h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.members.map((member: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                      {member}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {item.marketSegments && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Target Market Segments</h4>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.marketSegments}</p>
                              </div>
                            )}
                            
                            {item.products && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Products</h4>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.products}</p>
                              </div>
                            )}
                            
                            {item.targetUser && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Target User</h4>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.targetUser}</p>
                              </div>
                            )}
                            
                            {item.dependencies && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Dependencies</h4>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.dependencies}</p>
                              </div>
                            )}
                            
                            {item.approvals && item.approvals.length > 0 && (
                              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Approval Checklist</h4>
                                <div className="space-y-2">
                                  {item.approvals.map((approval: any, idx: number) => (
                                    <label key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                      <input
                                        type="checkbox"
                                        checked={approval.checked || false}
                                        onChange={(e) => {
                                          const updated = [...item.approvals];
                                          updated[idx] = { ...updated[idx], checked: e.target.checked };
                                          onUpdate(item._id, { ...item, approvals: updated });
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                      />
                                      <span className={approval.checked ? 'line-through text-gray-400' : ''}>{approval.item}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, total)}</span> of <span className="font-medium">{total}</span> results
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-2 text-sm font-medium rounded-lg ${page === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
