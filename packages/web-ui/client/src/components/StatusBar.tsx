import { useEffect, useState } from 'react';

interface AuthInfo {
  loginType: string;
  baseUrl: string | null;
}

export function StatusBar() {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);

  useEffect(() => {
    fetch('/api/auth/info', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => setAuthInfo(data))
      .catch(() => setAuthInfo(null));
  }, []);

  if (!authInfo) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-1.5">
      <div className="max-w-5xl mx-auto flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="font-medium">
            {authInfo.loginType === 'openai' ? 'OpenAI' : 'Qwen OAuth'}
          </span>
        </span>
        {authInfo.baseUrl && (
          <span className="text-gray-500">• {authInfo.baseUrl}</span>
        )}
      </div>
    </div>
  );
}
