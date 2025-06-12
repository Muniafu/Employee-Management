import { useState } from 'react';
import { usePerformance } from '../context/PerformanceContext';

const MetricList = () => {
  const { metrics, createMetric, updateMetric, deleteMetric, refreshMetrics } = usePerformance();
  const [newMetric, setNewMetric] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newMetric.trim()) return;
    await createMetric({ metric_name: newMetric, metric_value: 1 });
    setNewMetric('');
    refreshMetrics();
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    await updateMetric(id, { metric_name: editValue });
    setEditingId(null);
    refreshMetrics();
  };

  return (
    <section>
      <h3>Performance Metrics</h3>
      <ul>
        {metrics.map((m) => (
          <li key={m._id}>
            {editingId === m._id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button onClick={() => handleEdit(m._id)}>✅</button>
                <button onClick={() => setEditingId(null)}>❌</button>
              </>
            ) : (
              <>
                {m.metric_name} – {m.metric_value}
                <button onClick={() => { setEditingId(m._id); setEditValue(m.metric_name); }}>✏️</button>
                <button onClick={() => { deleteMetric(m._id); refreshMetrics(); }}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <input
        placeholder="New metric"
        value={newMetric}
        onChange={(e) => setNewMetric(e.target.value)}
      />
      <button onClick={handleAdd}>Add Metric</button>
    </section>
  );
};

export default MetricList;
