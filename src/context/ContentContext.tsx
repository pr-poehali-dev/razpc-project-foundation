import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchContent, saveContent, type ContentMap } from '@/api/content';
import { useAuth } from '@/context/AuthContext';

interface ContentContextValue {
  content: ContentMap;
  loading: boolean;
  editMode: boolean;
  canEdit: boolean;
  dirtyCount: number;
  saving: boolean;
  toggleEditMode: () => void;
  getText: (key: string, fallback: string) => string;
  setDraft: (key: string, value: string) => void;
  saveAll: () => Promise<void>;
  discardAll: () => void;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';

  const [content, setContent] = useState<ContentMap>({});
  const [drafts, setDrafts] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent()
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

  // Гость и не-админ не могут быть в режиме редактирования
  useEffect(() => {
    if (!canEdit && editMode) setEditMode(false);
  }, [canEdit, editMode]);

  const toggleEditMode = useCallback(() => setEditMode((v) => !v), []);

  const getText = useCallback(
    (key: string, fallback: string) => {
      if (key in drafts) return drafts[key];
      if (key in content) return content[key];
      return fallback;
    },
    [drafts, content],
  );

  const setDraft = useCallback((key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveAll = useCallback(async () => {
    const keys = Object.keys(drafts);
    if (keys.length === 0) return;
    setSaving(true);
    try {
      await saveContent(keys.map((key) => ({ key, value: drafts[key] })));
      setContent((prev) => ({ ...prev, ...drafts }));
      setDrafts({});
    } finally {
      setSaving(false);
    }
  }, [drafts]);

  const discardAll = useCallback(() => setDrafts({}), []);

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        editMode,
        canEdit,
        dirtyCount: Object.keys(drafts).length,
        saving,
        toggleEditMode,
        getText,
        setDraft,
        saveAll,
        discardAll,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useContentEditor = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContentEditor должен использоваться внутри ContentProvider');
  return ctx;
};
