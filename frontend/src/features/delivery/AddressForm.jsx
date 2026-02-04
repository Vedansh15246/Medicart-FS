
import React, { useEffect, useState } from 'react';

const initial = {
  name: '',
  streetAddress: '',
  addressLine1: '',
  addressLine2: '',
  phone: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'USA',
  isDefault: false,
};

 const AddressForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialValues ? { ...initial, ...initialValues } : initial);
    setErrors({});
  }, [initialValues]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.streetAddress.trim()) e.streetAddress = 'Street address is required';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address line 1 is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be 10 digits';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!/^\d{6}$/.test(form.postalCode)) e.postalCode = 'PIN code must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form, isDefault: !!form.isDefault };
    onSubmit && onSubmit(payload);
    // Reset only if you’re adding a new address (not editing)
    if (!initialValues) setForm(initial);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form} noValidate>
      {/* Name, Street Address & Phone */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="name" style={styles.label}>Full Name</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="e.g., Shahid"
            autoComplete="name"
            style={styles.input}
          />
          {errors.name && <span style={styles.error}>{errors.name}</span>}
        </div>
        <div style={styles.field}>
          <label htmlFor="streetAddress" style={styles.label}>Street Address</label>
          <input
            id="streetAddress"
            type="text"
            value={form.streetAddress}
            onChange={e => handleChange('streetAddress', e.target.value)}
            placeholder="House no., street name"
            autoComplete="street-address"
            style={styles.input}
          />
          {errors.streetAddress && <span style={styles.error}>{errors.streetAddress}</span>}
        </div>
        <div style={styles.field}>
          <label htmlFor="phone" style={styles.label}>Phone</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="10 digits"
            autoComplete="tel"
            style={styles.input}
          />
          {errors.phone && <span style={styles.error}>{errors.phone}</span>}
        </div>
      </div>

      {/* Address Line 1 & 2 */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="addressLine1" style={styles.label}>Address Line 1</label>
          <input
            id="addressLine1"
            type="text"
            value={form.addressLine1}
            onChange={e => handleChange('addressLine1', e.target.value)}
            placeholder="Apartment, suite, etc."
            autoComplete="address-line1"
            style={styles.input}
          />
          {errors.addressLine1 && <span style={styles.error}>{errors.addressLine1}</span>}
        </div>
        <div style={styles.field}>
          <label htmlFor="addressLine2" style={styles.label}>Address Line 2 (optional)</label>
          <input
            id="addressLine2"
            type="text"
            value={form.addressLine2}
            onChange={e => handleChange('addressLine2', e.target.value)}
            placeholder="Area, landmark"
            autoComplete="address-line2"
            style={styles.input}
          />
        </div>
      </div>

      {/* City, State, Postal Code */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="city" style={styles.label}>City</label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={e => handleChange('city', e.target.value)}
            placeholder="e.g., Pune"
            autoComplete="address-level2"
            style={styles.input}
          />
          {errors.city && <span style={styles.error}>{errors.city}</span>}
        </div>
        <div style={styles.field}>
          <label htmlFor="state" style={styles.label}>State</label>
          <input
            id="state"
            type="text"
            value={form.state}
            onChange={e => handleChange('state', e.target.value)}
            placeholder="e.g., MH"
            autoComplete="address-level1"
            style={styles.input}
          />
          {errors.state && <span style={styles.error}>{errors.state}</span>}
        </div>
        <div style={styles.field}>
          <label htmlFor="postalCode" style={styles.label}>PIN Code</label>
          <input
            id="postalCode"
            type="text"
            inputMode="numeric"
            value={form.postalCode}
            onChange={e => handleChange('postalCode', e.target.value)}
            placeholder="6 digits"
            autoComplete="postal-code"
            style={styles.input}
          />
          {errors.postalCode && <span style={styles.error}>{errors.postalCode}</span>}
        </div>
      </div>

      {/* Country & Default */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="country" style={styles.label}>Country</label>
          <input
            id="country"
            type="text"
            value={form.country}
            onChange={e => handleChange('country', e.target.value)}
            placeholder="e.g., USA"
            autoComplete="country"
            style={styles.input}
          />
        </div>
        <div style={{ ...styles.field, justifyContent: 'flex-end' }}>
          <label htmlFor="isDefault" style={styles.checkboxLabel}>
            <input
              id="isDefault"
              type="checkbox"
              checked={form.isDefault}
              onChange={e => handleChange('isDefault', e.target.checked)}
            />
            {' '}Set as default
          </label>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {onCancel && (
          <button type="button" style={styles.secondary} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" style={styles.primary}>
          {initialValues ? 'Save Changes' : 'Add Address'}
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: 600 },
  input: {
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  },
  error: { color: '#b00020', fontSize: 12, marginTop: 4 },
  radioGroup: {display: 'flex', gap: 16, alignItems: 'center' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  primary: { background: 'rgb(47, 191, 93)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' },
  secondary: { background: '#eee', color: '#333', border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' },
};

export default AddressForm;