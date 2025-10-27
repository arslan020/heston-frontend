import React from 'react';

const FaultTable = ({ faults, onEdit, onDelete }) => {
  return (
    <table className="fault-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Component</th>
          <th>Condition</th>
          <th>Severity</th>
          <th>Photo</th>
          <th>Note</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {faults.length === 0 ? (
          <tr>
            <td colSpan="7" style={{ textAlign: 'center' }}>No faults added.</td>
          </tr>
        ) : (
          faults.map((f, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{f.part || '-'}</td>
              <td>{f.damage || '-'}</td>
              <td>{f.detail || '-'}</td>
              <td>{f.photo ? '📷' : '-'}</td>
              <td>{f.note || '-'}</td>
              <td>
                <button onClick={() => onEdit(i)}>Edit</button>
                <button onClick={() => onDelete(i)}>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default FaultTable;
