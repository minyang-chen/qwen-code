import React from 'react';
import { teamApi } from '../../../../services/team/api';
import { WorkspaceType } from '../../types/team.types';

interface KnowledgeTabProps {
  files: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  workspaceType: WorkspaceType;
  setWorkspaceType: (type: WorkspaceType) => void;
  selectedTeamId: string;
  handleFileUpload: (file: File, workspaceType: WorkspaceType, selectedTeamId: string | undefined, setMessage: (msg: string) => void) => void;
  handleDelete: (filePath: string, workspaceType: WorkspaceType, selectedTeamId: string | undefined, setMessage: (msg: string) => void) => void;
  handleSearch: (workspaceType: WorkspaceType, selectedTeamId: string | undefined, setMessage: (msg: string) => void) => void;
  message: string;
  setMessage: (msg: string) => void;
}

export function KnowledgeTab({
  files,
  searchQuery,
  setSearchQuery,
  searchResults,
  workspaceType,
  setWorkspaceType,
  selectedTeamId,
  handleFileUpload,
  handleDelete,
  handleSearch,
  message,
  setMessage
}: KnowledgeTabProps) {
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, workspaceType, selectedTeamId || undefined, setMessage);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(workspaceType, selectedTeamId || undefined, setMessage);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {message && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">{message}</div>
      )}

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Files</h2>
          <div className="flex gap-3">
            <select
              value={workspaceType}
              onChange={(e) => setWorkspaceType(e.target.value as WorkspaceType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Private Workspace</option>
              <option value="team">Team Workspace</option>
            </select>
            <label className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Upload File
              <input type="file" onChange={onFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      No files uploaded yet
                    </td>
                  </tr>
                ) : (
                  files.map((file, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{file.path}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => teamApi.downloadFile(file.path)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(file.path, workspaceType, selectedTeamId || undefined, setMessage)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Semantic Search</h2>
        </div>
        <div className="p-6">
          <form onSubmit={onSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files by content..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search
              </button>
            </div>
          </form>

          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                      <span className="font-semibold text-gray-900">{result.file_name}</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {result.similarity_score}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{result.file_path}</p>
                  {result.content_preview && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Content Preview:</div>
                      <div className="text-sm text-gray-700 line-clamp-3">{result.content_preview}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              No results found
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
