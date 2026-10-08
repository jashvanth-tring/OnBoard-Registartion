function Step1({ formData, errors, handleChange, handleFile }) {
  return (
    <div>
      <h2>Personal Details</h2>

      <div className="field">
        <label>Full Name *</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
        <span className="error">{errors.fullName}</span>
      </div>

      <div className="field">
        <label>Date of Birth *</label>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
        <span className="error">{errors.dob}</span>
      </div>

      <div className="field">
        <label>Gender *</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <span className="error">{errors.gender}</span>
      </div>

      <div className="field">
        <label>Email *</label>
        <input type="text" name="email" value={formData.email} onChange={handleChange} />
        <span className="error">{errors.email}</span>
      </div>

      <div className="field">
        <label>Mobile Number *</label>
        {/* maxLength=10 stops the user typing more than 10 digits */}
        <input type="text" name="mobile" maxLength="10" value={formData.mobile} onChange={handleChange} />
        <span className="error">{errors.mobile}</span>
      </div>

      <div className="field">
        <label>Alternate Mobile Number *</label>
        <input type="text" name="altMobile" maxLength="10" value={formData.altMobile} onChange={handleChange} />
        <span className="error">{errors.altMobile}</span>
      </div>

      <div className="field">
        <label>Father's Name *</label>
        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
        <span className="error">{errors.fatherName}</span>
      </div>

      <div className="field">
        <label>Mother's Name *</label>
        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
        <span className="error">{errors.motherName}</span>
      </div>

      <div className="field">
        <label>Marital Status *</label>
        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
          <option value="">Select</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
        </select>
        <span className="error">{errors.maritalStatus}</span>
      </div>

      <div className="field">
        <label>Blood Group *</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
          <option value="">Select</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        <span className="error">{errors.bloodGroup}</span>
      </div>

      <h3>Uploads (JPG only)</h3>

      
      <div className="field">
        <label>Photo *</label>
        <input type="file" name="photo" accept=".jpg,.jpeg" onChange={handleFile} />
        <span className="error">{errors.photo}</span>
      </div>

      <div className="field">
        <label>Signature *</label>
        <input type="file" name="signature" accept=".jpg,.jpeg" onChange={handleFile} />
        <span className="error">{errors.signature}</span>
      </div>

      <div className="field">
        <label>Aadhar *</label>
        <input type="file" name="aadhar" accept=".jpg,.jpeg" onChange={handleFile} />
        <span className="error">{errors.aadhar}</span>
      </div>

      <div className="field">
        <label>PAN *</label>
        <input type="file" name="pan" accept=".jpg,.jpeg" onChange={handleFile} />
        <span className="error">{errors.pan}</span>
      </div>

      <div className="field">
        <label>Passport (optional)</label>
        <input type="file" name="passport" accept=".jpg,.jpeg" onChange={handleFile} />
        <span className="error">{errors.passport}</span>
      </div>
    </div>
  );
}

export default Step1;