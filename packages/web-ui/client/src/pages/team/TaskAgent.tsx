import { useEffect, useState } from 'react';
import { ChatContainer } from '../../components/ChatContainer';
import { useChatStore } from '../../store/chatStore';

const TEAM_API_BASE = 'http://localhost:3001';

interface TaskAgentProps {
  workspaceType: 'private' | 'team';
  selectedTeamId?: string;
}

export function TaskAgent({ workspaceType, selectedTeamId }: TaskAgentProps) {
  const [loading, setLoading] = useState(true);
  const { setSessionId, setSessions, addSession } = useChatStore();

  useEffect(() => {
    async function init() {
      try {
        // Get user ID from backend
        const userRes = await fetch(`${TEAM_API_BASE}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('team_session_token')}`,
          },
        });

        if (!userRes.ok) {
          console.error('Failed to get user info');
          setLoading(false);
          return;
        }

        const { userId } = await userRes.json();

        // Construct NFS directory path (using actual host path)
        const nfsBasePath = '/workdisk/hosting/my_qwen_code/qwen-code/infrastructure/nfs-data';
        let workingDirectory: string;
        if (workspaceType === 'private') {
          workingDirectory = `${nfsBasePath}/private/${userId}`;
        } else if (workspaceType === 'team' && selectedTeamId) {
          workingDirectory = `${nfsBasePath}/shared/${selectedTeamId}`;
        } else {
          console.error('Invalid workspace configuration');
          setLoading(false);
          return;
        }

        // Get OpenAI config from backend and auto-authenticate
        const configRes = await fetch(`${TEAM_API_BASE}/api/team/openai-config`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('team_session_token')}`,
          },
        });

        if (!configRes.ok) {
          console.error('Failed to get OpenAI config');
          setLoading(false);
          return;
        }

        const config = await configRes.json();

        // Authenticate with web-ui server using OpenAI credentials
        const authRes = await fetch('/api/auth/login/openai', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });

        if (!authRes.ok) {
          console.error('Failed to authenticate');
          setLoading(false);
          return;
        }

        // Get or create shared session
        const sessionsRes = await fetch('/api/sessions', {
          credentials: 'include',
        });

        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          setSessions(sessions);

          if (sessions.length > 0) {
            setSessionId(sessions[0].id);
          } else {
            const newSessionRes = await fetch('/api/sessions', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workingDirectory }),
            });

            if (newSessionRes.ok) {
              const { sessionId } = await newSessionRes.json();
              const newSession = {
                id: sessionId,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
              };
              addSession(newSession);
              setSessionId(sessionId);
            }
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [setSessionId, setSessions, addSession, workspaceType, selectedTeamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-sm text-gray-600">Loading chat...</div>
        </div>
      </div>
    );
  }

  return <ChatContainer />;
}
