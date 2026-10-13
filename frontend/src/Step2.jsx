function Step2({ formData, errors, handleChange, handleFile, handleCollegeFile }) {
  const marksheetBoxes = [];

  for (let i = 0; i < Number(formData.marksheetCount); i++) {
    const inputId = 'collegeMarksheet' + i;

  marksheetBoxes.push(
  <div className="field" key={inputId}>
    <label htmlFor={inputId}>College Marksheet {i + 1} *</label>
    <input
      id={inputId}
      name={inputId}
      type="file"
      accept=".jpg,.jpeg,.pdf"
      onChange={e => handleCollegeFile(e, i)}
    />
    <span className="error">{errors['college' + i]}</span>
  </div>);
  }

  return (
    <div>
      <h2>Education Details</h2>

      <h3>10th</h3>

      <div className="field">
        <label htmlFor="tenthSchool">School Name *</label>
        <input id="tenthSchool" type="text" name="tenthSchool" value={formData.tenthSchool} onChange={handleChange} />
        <span className="error">{errors.tenthSchool}</span>
      </div>

      <div className="field">
        <label htmlFor="tenthPercentage">Percentage *</label>
        <input id="tenthPercentage" type="number" min="0" max="100" name="tenthPercentage" value={formData.tenthPercentage} onChange={handleChange} />
        <span className="error">{errors.tenthPercentage}</span>
      </div>

      <div className="field">
        <label htmlFor="tenthMarksheet">Marksheet *</label>
        <input id="tenthMarksheet" type="file" name="tenthMarksheet" accept=".jpg,.jpeg,.pdf" onChange={handleFile} />
        <span className="error">{errors.tenthMarksheet}</span>
      </div>

      <h3>12th</h3>

      <div className="field">
        <label htmlFor="twelfthSchool">School Name *</label>
        <input id="twelfthSchool" type="text" name="twelfthSchool" value={formData.twelfthSchool} onChange={handleChange} />
        <span className="error">{errors.twelfthSchool}</span>
      </div>

      <div className="field">
        <label htmlFor="twelfthPercentage">Percentage *</label>
        <input id="twelfthPercentage" type="number" min="0" max="100" name="twelfthPercentage" value={formData.twelfthPercentage} onChange={handleChange} />
        <span className="error">{errors.twelfthPercentage}</span>
      </div>

      <div className="field">
        <label htmlFor="twelfthMarksheet">Marksheet *</label>
        <input id="twelfthMarksheet" type="file" name="twelfthMarksheet" accept=".jpg,.jpeg,.pdf" onChange={handleFile} />
        <span className="error">{errors.twelfthMarksheet}</span>
      </div>

      <h3>College</h3>

      <div className="field">
        <label htmlFor="collegeName">College Name *</label>
        <input id="collegeName" type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} />
        <span className="error">{errors.collegeName}</span>
      </div>

      <div className="field">
        <label htmlFor="cgpa">CGPA *</label>
        <input id="cgpa" type="number" min="0" max="10" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} />
        <span className="error">{errors.cgpa}</span>
      </div>

      <div className="field">
        <label htmlFor="marksheetCount">How many marksheets will you upload? *</label>
        <select id="marksheetCount" name="marksheetCount" value={formData.marksheetCount} onChange={handleChange}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(count => (
            <option key={count} value={count}>{count}</option>
          ))}
        </select>
      </div>

      {marksheetBoxes}
    </div>
  );
}

export default Step2;