import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client';
import { loadUserFromStorage } from '../../store/authSlice';
import { setCurrency, setLanguage, setThemeMode } from '../../store/settings/settingsSlice';
import { GET_SETTINGS } from '../../graphql';
import { store } from '../../store/store';
import type { Currency, Language, ThemeMode } from '../../types/settings';

export function AppInitializer() {
  const dispatch = useDispatch();

  // Load user from localStorage on app init
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Query settings from backend on first render and apply them
  useQuery(GET_SETTINGS, {
    skip: !store.getState().auth.isAuthenticated,
    onCompleted: (data) => {
      if (data?.settings) {
        dispatch(setCurrency(data.settings.currency as Currency));
        dispatch(setLanguage(data.settings.language as Language));
        dispatch(setThemeMode(data.settings.themeMode as ThemeMode));
      }
    },
  });

  return null;
}
