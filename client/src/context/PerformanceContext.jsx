import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  getMetrics, createMetric, updateMetric, deleteMetric,
  getGoals, createGoal, updateGoal, deleteGoal,
  getFeedback, createFeedback, updateFeedback, deleteFeedback,
} from '../services/api';

const PerformanceContext = createContext();

const initialState = {
  metrics: [],
  goals: [],
  feedback: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_METRICS': return { ...state, metrics: action.payload };
    case 'SET_GOALS': return { ...state, goals: action.payload };
    case 'SET_FEEDBACK': return { ...state, feedback: action.payload };
    default: return state;
  }
}

export const PerformanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch all performance data on mount
  useEffect(() => {
    async function fetchData() {
      const [metrics, goals, feedback] = await Promise.all([
        getMetrics(), getGoals(), getFeedback()
      ]);
      dispatch({ type: 'SET_METRICS', payload: metrics });
      dispatch({ type: 'SET_GOALS', payload: goals });
      dispatch({ type: 'SET_FEEDBACK', payload: feedback });
    }
    fetchData();
  }, []);

  const refreshMetrics = async () => {
    const data = await getMetrics();
    dispatch({ type: 'SET_METRICS', payload: data });
  };

  const refreshGoals = async () => {
    const data = await getGoals();
    dispatch({ type: 'SET_GOALS', payload: data });
  };

  const refreshFeedback = async () => {
    const data = await getFeedback();
    dispatch({ type: 'SET_FEEDBACK', payload: data });
  };

  return (
    <PerformanceContext.Provider value={{
      ...state,
      refreshMetrics,
      refreshGoals,
      refreshFeedback,
      createMetric,
      updateMetric,
      deleteMetric,
      createGoal,
      updateGoal,
      deleteGoal,
      createFeedback,
      updateFeedback,
      deleteFeedback
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);