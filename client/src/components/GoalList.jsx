import { useState } from 'react';
import { usePerformance } from '../context/PerformanceContext';

const GoalList = () => {
  const { goals, createGoal, updateGoal, deleteGoal, refreshGoals } = usePerformance();
  const [newGoal, setNewGoal] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newGoal.trim()) return;
    await createGoal({ goal_name: newGoal, goal_description: '' });
    setNewGoal('');
    refreshGoals();
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    await updateGoal(id, { goal_name: editValue });
    setEditingId(null);
    refreshGoals();
  };

  return (
    <section>
      <h3>Goals</h3>
      <ul>
        {goals.map((g) => (
          <li key={g._id}>
            {editingId === g._id ? (
              <>
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                <button onClick={() => handleEdit(g._id)}>✅</button>
                <button onClick={() => setEditingId(null)}>❌</button>
              </>
            ) : (
              <>
                {g.goal_name}
                <button onClick={() => { setEditingId(g._id); setEditValue(g.goal_name); }}>✏️</button>
                <button onClick={() => { deleteGoal(g._id); refreshGoals(); }}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <input placeholder="New goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
      <button onClick={handleAdd}>Add Goal</button>
    </section>
  );
};

export default GoalList;