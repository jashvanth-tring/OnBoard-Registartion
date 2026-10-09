function Step2({ formData, errors, handleChange, handleFile, handleCollegeFile }) {
  const marksheetBoxes = [];
  for (let i = 0; i < Number(formData.marksheetCount); i++) {
    marksheetBoxes.push(
      <div className="field" key={i}>
        <label>College Marksheet {i + 1} *</label>
        <input type="file" accept=".jpg,.jpeg,.pdf" onChange={(e) => handleCollegeFile(e, i)} />
        <span className="error">{errors["college" + i]}</span>
      </div>
    );
  }

  return (
    <div>
      <h2>Education Details</h2>

      <h3>10th</h3>
      <div className="field">
        <label>School Name *</label>
        <input type="text" name="tenthSchool" value={formData.tenthSchool} onChange={handleChange} />
        <span className="error">{errors.tenthSchool}</span>
      </div>
      <div className="field">
        <label>Percentage *</label>
        <input type="number" name="tenthPercentage" placeholder="80%" value={formData.tenthPercentage} onChange={handleChange} />
        <span className="error">{errors.tenthPercentage}</span>
      </div>
      <div className="field">
        <label>Marksheet *</label>
        <input type="file" name="tenthMarksheet" accept=".jpg,.jpeg,.pdf" onChange={handleFile} />
        <span className="error">{errors.tenthMarksheet}</span>
      </div>

      <h3>12th</h3>
      <div className="field">
        <label>School Name *</label>
        <input type="text" name="twelfthSchool" value={formData.twelfthSchool} onChange={handleChange} />
        <span className="error">{errors.twelfthSchool}</span>
      </div>
      <div className="field">
        <label>Percentage *</label>
        <input type="number" name="twelfthPercentage"  placeholder="80%" value={formData.twelfthPercentage} onChange={handleChange} />
        <span className="error">{errors.twelfthPercentage}</span>
      </div>
      <div className="field">
        <label>Marksheet *</label>
        <input type="file" name="twelfthMarksheet" accept=".jpg,.jpeg,.pdf" onChange={handleFile} />
        <span className="error">{errors.twelfthMarksheet}</span>
      </div>

      <h3>College</h3>
      <div className="field">
        <label>College Name *</label>
        <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} />
        <span className="error">{errors.collegeName}</span>
      </div>
      <div className="field">
        <label>CGPA *</label>
        <input type="number" step="0.01" name="cgpa"  placeholder="8.1" value={formData.cgpa} onChange={handleChange} />
        <span className="error">{errors.cgpa}</span>
      </div>

      <div className="field">
        <label>How many marksheets will you upload? *</label>
        <select name="marksheetCount" value={formData.marksheetCount} onChange={handleChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
      </div>

      {marksheetBoxes}
    </div>
  );
}

export default Step2;