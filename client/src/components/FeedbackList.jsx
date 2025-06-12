import { useState } from 'react';
import { usePerformance } from '../context/PerformanceContext';

const FeedbackList = () => {
  const { feedback, createFeedback, updateFeedback, deleteFeedback, refreshFeedback } = usePerformance();
  const [newFeedback, setNewFeedback] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newFeedback.trim()) return;
    await createFeedback({ feedback_text: newFeedback, review_text: '' });
    setNewFeedback('');
    refreshFeedback();
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    await updateFeedback(id, { feedback_text: editValue });
    setEditingId(null);
    refreshFeedback();
  };

  return (
    <section>
      <h3>Feedback</h3>
      <ul>
        {feedback.map((f) => (
          <li key={f._id}>
            {editingId === f._id ? (
              <>
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                <button onClick={() => handleEdit(f._id)}>✅</button>
                <button onClick={() => setEditingId(null)}>❌</button>
              </>
            ) : (
              <>
                {f.feedback_text}
                <button onClick={() => { setEditingId(f._id); setEditValue(f.feedback_text); }}>✏️</button>
                <button onClick={() => { deleteFeedback(f._id); refreshFeedback(); }}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <input placeholder="New feedback" value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} />
      <button onClick={handleAdd}>Add Feedback</button>
    </section>
  );
};

export default FeedbackList;