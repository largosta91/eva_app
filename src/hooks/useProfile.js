// src/hooks/useProfile.js
import { useState } from 'react';
import useAppStore from '../app/store/useAppStore';
import { supabase } from '../services/api/supabase';

export function useProfile() {
  const { user, setUser } = useAppStore();
  const [saving, setSaving] = useState(false);

  const updateName = async (newName) => {
    if (!newName.trim() || newName === user?.display_name) return;
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ display_name: newName.trim() })
      .eq('id', user.id);
    if (!error) setUser({ ...user, display_name: newName.trim() });
    setSaving(false);
    return !error;
  };

  const updateAvatar = async (file) => {
    if (!file || !user?.id) return;
    setSaving(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
      setUser({ ...user, avatar_url: publicUrl });
    } catch (err) {
      console.error('Error subiendo avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    saving,
    updateName,
    updateAvatar,
    displayName: user?.display_name ?? '',
    avatarUrl: user?.avatar_url ?? null,
    isCreator: user?.role === 'creator',
    isVerified: user?.is_verified ?? false,
  };
}