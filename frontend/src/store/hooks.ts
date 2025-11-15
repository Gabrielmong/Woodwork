import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { logout } from './authSlice';
import { resetSettings } from './settings/settingsSlice';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
