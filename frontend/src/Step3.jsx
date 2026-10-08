function Step3({ formData, errors, handleChange, handleFile, handleCheckbox }) {
  return (
    <div>
      <h2>Bank Details</h2>

      <div className="field">
        <label>Bank Name *</label>
        <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} />
        <span className="error">{errors.bankName}</span>
      </div>

      <div className="field">
        <label>Account Number *</label>
        <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} />
        <span className="error">{errors.accountNo}</span>
      </div>

      <div className="field">
        <label>IFSC Code *</label>
        <input type="text" name="ifsc" maxLength="11" value={formData.ifsc} onChange={handleChange} />
        <span className="error">{errors.ifsc}</span>
      </div>

      <div className="field">
        <label>Branch *</label>
        <input type="text" name="branch" value={formData.branch} onChange={handleChange} />
        <span className="error">{errors.branch}</span>
      </div>

      <div className="field">
        <label>Bank Passbook *</label>
        <input type="file" name="passbook" accept=".jpg,.jpeg,.pdf" onChange={handleFile} />
        <span className="error">{errors.passbook}</span>
      </div>

      <div className="field">
        <label>Offer Letter *</label>
        <input type="file" name="offerLetter" accept=".jpg,.jpeg,.pdf" onChange={handleFile} />
        <span className="error">{errors.offerLetter}</span>
      </div>

      <div className="field">
        {/* a checkbox uses "checked" (true or false) instead of "value" */}
        <label>
          <input type="checkbox" checked={formData.agree} onChange={handleCheckbox} />
          I agree to join in TringApps
        </label>
        <span className="error">{errors.agree}</span>
      </div>
    </div>
  );
}

export default Step3;