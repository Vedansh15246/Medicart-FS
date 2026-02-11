import React, { useEffect, useState } from 'react';
import './AddressForm.css';

const initial = {
  name: '',
  streetAddress: '',
  addressLine1: '',
  addressLine2: '',
  phone: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

const AddressForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setForm(initialValues ? { ...initial, ...initialValues } : initial);
    setErrors({});
    setTouched({});
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
    if (touched[field]) {
      // Validate on change if field was touched
      const tempErrors = { ...errors };
      delete tempErrors[field];
      setErrors(tempErrors);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form, isDefault: !!form.isDefault };
    console.log("This",payload);
    
    onSubmit && onSubmit(payload);
    // Reset only if you're adding a new address (not editing)
    if (!initialValues) {
      setForm(initial);
      setTouched({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="address-form" noValidate>
      <div className="form-section">
        <h4 className="section-title">
          Personal Information
        </h4>
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Enter your full name"
              autoComplete="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4 className="section-title">
          Address Details
        </h4>
        
        <div className="form-row">
          <div className="form-field full-width">
            <label htmlFor="streetAddress" className="form-label">
              Street Address <span className="required">*</span>
            </label>
            <input
              id="streetAddress"
              type="text"
              value={form.streetAddress}
              onChange={e => handleChange('streetAddress', e.target.value)}
              onBlur={() => handleBlur('streetAddress')}
              placeholder="House no., building name, street name"
              autoComplete="street-address"
              className={`form-input ${errors.streetAddress ? 'error' : ''}`}
            />
            {errors.streetAddress && <span className="error-message">{errors.streetAddress}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="addressLine1" className="form-label">
              Address Line 1 <span className="required">*</span>
            </label>
            <input
              id="addressLine1"
              type="text"
              value={form.addressLine1}
              onChange={e => handleChange('addressLine1', e.target.value)}
              onBlur={() => handleBlur('addressLine1')}
              placeholder="Apartment, suite, unit, floor"
              autoComplete="address-line1"
              className={`form-input ${errors.addressLine1 ? 'error' : ''}`}
            />
            {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="addressLine2" className="form-label">
              Address Line 2 <span className="optional">(Optional)</span>
            </label>
            <input
              id="addressLine2"
              type="text"
              value={form.addressLine2}
              onChange={e => handleChange('addressLine2', e.target.value)}
              placeholder="Area, landmark, nearby location"
              autoComplete="address-line2"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="city" className="form-label">
              City <span className="required">*</span>
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={e => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder="e.g., Mumbai"
              autoComplete="address-level2"
              className={`form-input ${errors.city ? 'error' : ''}`}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="state" className="form-label">
              State <span className="required">*</span>
            </label>
            <input
              id="state"
              type="text"
              value={form.state}
              onChange={e => handleChange('state', e.target.value)}
              onBlur={() => handleBlur('state')}
              placeholder="e.g., Maharashtra"
              autoComplete="address-level1"
              className={`form-input ${errors.state ? 'error' : ''}`}
            />
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="postalCode" className="form-label">
              PIN Code <span className="required">*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              inputMode="numeric"
              value={form.postalCode}
              onChange={e => handleChange('postalCode', e.target.value)}
              onBlur={() => handleBlur('postalCode')}
              placeholder="6-digit PIN"
              autoComplete="postal-code"
              className={`form-input ${errors.postalCode ? 'error' : ''}`}
            />
            {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="country" className="form-label">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={form.country}
              onChange={e => handleChange('country', e.target.value)}
              placeholder="e.g., India"
              autoComplete="country"
              className="form-input"
            />
          </div>

          <div className="form-field checkbox-field">
            <label htmlFor="isDefault" className="checkbox-label">
              <input
                id="isDefault"
                type="checkbox"
                checked={form.isDefault}
                onChange={e => handleChange('isDefault', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                Set as default address
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialValues ? 'Save Changes' : 'Add Address'}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
