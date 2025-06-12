import { usePerformance } from '../context/PerformanceContext';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const {
    metrics, goals, feedback,
    createMetric, deleteMetric, refreshMetrics,
    createGoal, deleteGoal, refreshGoals,
    createFeedback, deleteFeedback, refreshFeedback
  } = usePerformance();

  const [newMetric, setNewMetric] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newFeedback, setNewFeedback] = useState('');

  const handleAddMetric = async () => {
    if (!newMetric.trim()) return;
    await createMetric({ metric_name: newMetric, metric_value: 1 });
    setNewMetric('');
    await refreshMetrics();
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    await createGoal({ goal_name: newGoal, goal_description: '' });
    setNewGoal('');
    await refreshGoals();
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) return;
    await createFeedback({ feedback_text: newFeedback, review_text: '' });
    setNewFeedback('');
    await refreshFeedback();
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <section>
        <h3>Performance Metrics</h3>
        <ul>
          {metrics.map(m => (
            <li key={m._id}>{m.metric_name} – {m.metric_value}
              <button onClick={() => { deleteMetric(m._id); refreshMetrics(); }}>❌</button>
            </li>
          ))}
        </ul>
        <input placeholder="New metric" value={newMetric} onChange={e => setNewMetric(e.target.value)} />
        <button onClick={handleAddMetric}>Add Metric</button>
      </section>

      <section>
        <h3>Goals</h3>
        <ul>
          {goals.map(g => (
            <li key={g._id}>{g.goal_name}
              <button onClick={() => { deleteGoal(g._id); refreshGoals(); }}>❌</button>
            </li>
          ))}
        </ul>
        <input placeholder="New goal" value={newGoal} onChange={e => setNewGoal(e.target.value)} />
        <button onClick={handleAddGoal}>Add Goal</button>
      </section>

      <section>
        <h3>Feedback</h3>
        <ul>
          {feedback.map(f => (
            <li key={f._id}>{f.feedback_text}
              <button onClick={() => { deleteFeedback(f._id); refreshFeedback(); }}>❌</button>
            </li>
          ))}
        </ul>
        <input placeholder="Feedback" value={newFeedback} onChange={e => setNewFeedback(e.target.value)} />
        <button onClick={handleAddFeedback}>Add Feedback</button>
      </section>
    </div>
  );
};

export default Dashboard;