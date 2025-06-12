import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  getMetrics, createMetric, updateMetric, deleteMetric,
  getGoals, createGoal, updateGoal, deleteGoal,
  getFeedback, createFeedback, updateFeedback, deleteFeedback,
} from '../services/api';
import { useAuth } from './AuthContext';

const PerformanceContext = createContext();

const initialState = {
  metrics: [],
  goals: [],
  feedback: [],
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_METRICS': return { ...state, metrics: action.payload };
    case 'SET_GOALS': return { ...state, goals: action.payload };
    case 'SET_FEEDBACK': return { ...state, feedback: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    default: return state;
  }
}

export const PerformanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();

  // Fetch all performance data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const [metrics, goals, feedback] = await Promise.all([
          getMetrics(user.token),
          getGoals(user.token),
          getFeedback(user.token)
        ]);
        dispatch({ type: 'SET_METRICS', payload: metrics });
        dispatch({ type: 'SET_GOALS', payload: goals });
        dispatch({ type: 'SET_FEEDBACK', payload: feedback });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    
    if (user?.token) {
      fetchData();
    }
  }, [user]);

  const refreshMetrics = async () => {
    try {
      const data = await getMetrics(user.token);
      dispatch({ type: 'SET_METRICS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshGoals = async () => {
    try {
      const data = await getGoals(user.token);
      dispatch({ type: 'SET_GOALS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshFeedback = async () => {
    try {
      const data = await getFeedback(user.token);
      dispatch({ type: 'SET_FEEDBACK', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const value = {
    ...state,
    refreshMetrics,
    refreshGoals,
    refreshFeedback,
    createMetric: (data) => createMetric(data, user.token),
    updateMetric: (id, data) => updateMetric(id, data, user.token),
    deleteMetric: (id) => deleteMetric(id, user.token),
    createGoal: (data) => createGoal(data, user.token),
    updateGoal: (id, data) => updateGoal(id, data, user.token),
    deleteGoal: (id) => deleteGoal(id, user.token),
    createFeedback: (data) => createFeedback(data, user.token),
    updateFeedback: (id, data) => updateFeedback(id, data, user.token),
    deleteFeedback: (id) => deleteFeedback(id, user.token),
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};