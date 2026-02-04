
import React from 'react';

export const AddressList = ({ addresses, selectedId, onSelect, onEdit, onDelete, onSetDefault }) => {
  if (!addresses || addresses.length === 0) return null;

  return (
    <div style={styles.list}>
      {addresses.map(a => (
        <div key={a.id} style={{ ...styles.card, borderColor: selectedId === a.id ? '#007bff' : '#eee' }}>
          <div style={styles.header}>
            <div style={styles.label}>{a.label}</div>
            {a.isDefault && <div style={styles.tagDefault}>Default</div>}
          </div>

          <div style={styles.body} onClick={() => onSelect(a.id)}>
            <strong>{a.name}</strong>
            <div style={{ color: '#555' }}>{a.phone}</div>
            <div>{a.addressLine1}</div>
            {a.addressLine2 && <div>{a.addressLine2}</div>}
            <div>{a.city}, {a.state} - {a.pincode}</div>
          </div>

          <div style={styles.actions}>
            <button style={styles.smallBtn} onClick={() => onEdit(a.id)}>Edit</button>
            <button style={styles.smallBtn} onClick={() => onDelete(a.id)}>Delete</button>
            {!a.isDefault && (
              <button style={styles.smallBtn} onClick={() => onSetDefault(a.id)}>Set Default</button>
            )}
            {/* <button
              style={{ ...styles.smallBtn, background: selectedId === a.id ? 'rgb(47, 191, 93)' : '#eee', color: selectedId === a.id ? '#fff' : 'rgb(47, 191, 93)' }}
              onClick={() => onSelect(a.id)}
            >
              Deliver Here
            </button> */}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  list: { display: 'grid', gridTemplateColumns: '1fr', gap: 12 },
  card: { border: '2px solid #eee', borderRadius: 8, padding: 12, background: '#fff' },
  header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 12, padding: '2px 6px', borderRadius: 4, background: '#f0f3ff', color: '#3b4cca' },
  tagDefault: { fontSize: 12, padding: '2px 6px', borderRadius: 4, background: '#e6ffed', color: '#067d40' },
  body: { cursor: 'pointer', marginBottom: 8 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  smallBtn: { padding: '6px 10px', borderRadius: 6, border: 'none', background: '#eee', cursor: 'pointer' },
};

export default AddressList;
