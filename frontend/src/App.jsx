import { useState } from 'react';
import './App.css';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

const initialFormData = {
  fullName: '',
  dob: '',
  gender: '',
  mobile: '',
  altMobile: '',
  email: '',
  fatherName: '',
  motherName: '',
  maritalStatus: '',
  bloodGroup: '',
  photo: null,
  signature: null,
  aadhar: null,
  pan: null,
  passport: null,
  tenthSchool: '',
  tenthPercentage: '',
  tenthMarksheet: null,
  twelfthSchool: '',
  twelfthPercentage: '',
  twelfthMarksheet: null,
  collegeName: '',
  cgpa: '',
  marksheetCount: '1',
  collegeMarksheets: [],
  bankName: '',
  accountNo: '',
  ifsc: '',
  branch: '',
  passbook: null,
  offerLetter: null,
  agree: false
};

function isValidRange(value, min, max) {
  if (value === '' || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max;
}

function validateStep1(data) {
  const errors = {};

  if (!data.fullName.trim()) errors.fullName = 'Name is required';
  if (!data.dob) errors.dob = 'Date of birth is required';
  if (!data.gender) errors.gender = 'Select gender';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email';
  }

  if (!/^\d{10}$/.test(data.mobile)) {
    errors.mobile = 'Enter 10 digit mobile number';
  }

  if (!/^\d{10}$/.test(data.altMobile)) {
    errors.altMobile = 'Enter 10 digit alternate number';
  }

  if (
    !errors.mobile &&
    !errors.altMobile &&
    data.mobile === data.altMobile
  ) {
    errors.altMobile = 'Alternate number must be different';
  }

  if (!data.fatherName.trim()) errors.fatherName = 'Father name is required';
  if (!data.motherName.trim()) errors.motherName = 'Mother name is required';
  if (!data.maritalStatus) errors.maritalStatus = 'Select marital status';
  if (!data.bloodGroup) errors.bloodGroup = 'Select blood group';

  for (const name of ['photo', 'signature', 'aadhar', 'pan']) {
    if (!data[name]) {
      errors[name] = name + ' is required';
    } else if (data[name].type !== 'image/jpeg') {
      errors[name] = 'Only JPG allowed';
    }
  }

  if (data.passport && data.passport.type !== 'image/jpeg') {
    errors.passport = 'Only JPG allowed';
  }

  return errors;
}

function validateStep2(data) {
  const errors = {};

  if (!data.tenthSchool.trim()) {
    errors.tenthSchool = 'School name is required';
  }

  if (!isValidRange(data.tenthPercentage, 0, 100)) {
    errors.tenthPercentage = 'Enter percentage between 0 and 100';
  }

  if (!data.tenthMarksheet) {
    errors.tenthMarksheet = 'Marksheet is required';
  }

  if (!data.twelfthSchool.trim()) {
    errors.twelfthSchool = 'School name is required';
  }

  if (!isValidRange(data.twelfthPercentage, 0, 100)) {
    errors.twelfthPercentage = 'Enter percentage between 0 and 100';
  }

  if (!data.twelfthMarksheet) {
    errors.twelfthMarksheet = 'Marksheet is required';
  }

  if (!data.collegeName.trim()) {
    errors.collegeName = 'College name is required';
  }

  if (!isValidRange(data.cgpa, 0, 10)) {
    errors.cgpa = 'Enter CGPA between 0 and 10';
  }

  for (let i = 0; i < Number(data.marksheetCount); i++) {
    if (!data.collegeMarksheets[i]) {
      errors['college' + i] = 'Marksheet ' + (i + 1) + ' is required';
    }
  }

  return errors;
}

function validateStep3(data) {
  const errors = {};

  if (!data.bankName.trim()) errors.bankName = 'Bank name is required';

  if (!/^\d{9,18}$/.test(data.accountNo)) {
    errors.accountNo = 'Enter account number with 9 to 18 digits';
  }

  if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(data.ifsc)) {
    errors.ifsc = 'Enter a valid IFSC code';
  }

  if (!data.branch.trim()) errors.branch = 'Branch is required';
  if (!data.passbook) errors.passbook = 'Passbook is required';
  if (!data.offerLetter) errors.offerLetter = 'Offer letter is required';

  if (!data.agree) errors.agree = 'You must tick the checkbox';

  return errors;
}

function App() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData(previous => ({
      ...previous,
      [name]: value,
      ...(name === 'marksheetCount' ? {
        collegeMarksheets: previous.collegeMarksheets.slice(0, Number(value))
      } : {})
    }));
  }

  function handleFile(e) {
    const { name, files } = e.target;

    setFormData(previous => ({
      ...previous,
      [name]: files[0] || null
    }));
  }

  function handleCheckbox(e) {
    setFormData(previous => ({
      ...previous,
      agree: e.target.checked
    }));
  }

  function handleCollegeFile(e, index) {
    const file = e.target.files[0];

    setFormData(previous => {
      const list = [...previous.collegeMarksheets];
      list[index] = file || null;

      return {
        ...previous,
        collegeMarksheets: list
      };
    });
  }

  function handleNext(e) {
    e.preventDefault();

    let newErrors = {};

    if (step === 1) newErrors = validateStep1(formData);
    else if (step === 2) newErrors = validateStep2(formData);
    else newErrors = validateStep3(formData);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    if (step < 3) {
      setStep(current => current + 1);
      return;
    }

    void submitForm();
  }

  async function submitForm() {
    if (submitting) return;

    setSubmitting(true);

    const data = new FormData();

    for (const [key, value] of Object.entries(formData)) {
      if (key === 'collegeMarksheets') {
        for (let i = 0; i < Number(formData.marksheetCount); i++) {
          const file = formData.collegeMarksheets[i];

          if (file) data.append('collegeMarksheets', file);
        }
      } else if (key === 'agree') {
        data.append(key, String(value));
      } else if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    }

      try {
        const response = await fetch('http://localhost:5000/register', {
          method: 'POST',
          body: data
        });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(result.message || 'Registration failed');
        return;
      }

      alert(result.message || 'Registration successful!');

      setFormData(initialFormData);
      setErrors({});
      setStep(1);
    } catch {
      console.error('Registration request failed');
      alert('Cannot connect to the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>tringapps</h1>
      <h2 className="on">OnBoard Registration</h2>

      <div className="progress">
        <span className={step === 1 ? 'active' : ''}>1. Personal Details</span>
        <span className={step === 2 ? 'active' : ''}>2. Education Details</span>
        <span className={step === 3 ? 'active' : ''}>3. Bank Details</span>
      </div>

      <form onSubmit={handleNext} noValidate>
        {step === 1 && (
          <Step1
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleFile={handleFile}
          />
        )}

        {step === 2 && (
          <Step2
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleFile={handleFile}
            handleCollegeFile={handleCollegeFile}
          />
        )}

        {step === 3 && (
          <Step3
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleFile={handleFile}
            handleCheckbox={handleCheckbox}
          />
        )}

        <div className="buttons">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep(current => current - 1);
              }}
            >
              Back
            </button>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : step < 3 ? 'Save & Continue' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;