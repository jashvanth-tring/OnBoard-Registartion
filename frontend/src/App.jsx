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

function isDigits(value, minLength, maxLength = minLength) {
  if (
    typeof value !== 'string' ||
    value.length < minLength ||
    value.length > maxLength
  ) {
    return false;
  }

  return [...value].every(char => char >= '0' && char <= '9');
}

function isValidEmail(value) {
  const email = value.trim();
  const atIndex = email.indexOf('@');

  if (
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf('@') ||
    email.includes(' ') ||
    email.includes('..')
  ) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf('.');

  return (
    localPart.length > 0 &&
    !localPart.startsWith('.') &&
    !localPart.endsWith('.') &&
    domain.length > 0 &&
    dotIndex > 0 &&
    dotIndex < domain.length - 2 &&
    !domain.startsWith('.') &&
    !domain.endsWith('.') &&
    !domain.includes('..')
  );
}

function addRequiredError(errors, data, field, message) {
  if (!String(data[field] ?? '').trim()) {
    errors[field] = message;
  }
}

function validateJpegFields(data, errors) {
  const requiredFiles = ['photo', 'signature', 'aadhar', 'pan'];

  for (const name of requiredFiles) {
    const file = data[name];

    if (!file) {
      errors[name] = `${name} is required`;
    } else if (file.type !== 'image/jpeg') {
      errors[name] = 'Only JPG allowed';
    }
  }

  if (data.passport && data.passport.type !== 'image/jpeg') {
    errors.passport = 'Only JPG allowed';
  }
}

function validateStep1(data) {
  const errors = {};

  addRequiredError(errors, data, 'fullName', 'Name is required');
  addRequiredError(errors, data, 'dob', 'Date of birth is required');
  addRequiredError(errors, data, 'gender', 'Select gender');

  if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email';
  }

  if (!isDigits(data.mobile, 10)) {
    errors.mobile = 'Enter 10 digit mobile number';
  }

  if (!isDigits(data.altMobile, 10)) {
    errors.altMobile = 'Enter 10 digit alternate number';
  }

  if (
    !errors.mobile &&
    !errors.altMobile &&
    data.mobile === data.altMobile
  ) {
    errors.altMobile = 'Alternate number must be different';
  }

  addRequiredError(errors, data, 'fatherName', 'Father name is required');
  addRequiredError(errors, data, 'motherName', 'Mother name is required');
  addRequiredError(errors, data, 'maritalStatus', 'Select marital status');
  addRequiredError(errors, data, 'bloodGroup', 'Select blood group');

  validateJpegFields(data, errors);

  return errors;
}

function validateSchoolDetails(data, errors, prefix, schoolField, percentageField, marksheetField) {
  addRequiredError(errors, data, schoolField, 'School name is required');

  if (!isValidRange(data[percentageField], 0, 100)) {
    errors[percentageField] = 'Enter percentage between 0 and 100';
  }

  if (!data[marksheetField]) {
    errors[marksheetField] = 'Marksheet is required';
  }
}

function validateCollegeDetails(data, errors) {
  addRequiredError(errors, data, 'collegeName', 'College name is required');

  if (!isValidRange(data.cgpa, 0, 10)) {
    errors.cgpa = 'Enter CGPA between 0 and 10';
  }

  const count = Number(data.marksheetCount);

  for (let index = 0; index < count; index += 1) {
    if (!data.collegeMarksheets[index]) {
      errors[`college${index}`] = `Marksheet ${index + 1} is required`;
    }
  }
}

function validateStep2(data) {
  const errors = {};

  validateSchoolDetails(
    data,
    errors,
    'tenth',
    'tenthSchool',
    'tenthPercentage',
    'tenthMarksheet'
  );

  validateSchoolDetails(
    data,
    errors,
    'twelfth',
    'twelfthSchool',
    'twelfthPercentage',
    'twelfthMarksheet'
  );

  validateCollegeDetails(data, errors);

  return errors;
}

function validateStep3(data) {
  const errors = {};

  addRequiredError(errors, data, 'bankName', 'Bank name is required');

  if (!isDigits(data.accountNo, 9, 18)) {
    errors.accountNo = 'Enter account number with 9 to 18 digits';
  }

  if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(data.ifsc)) {
    errors.ifsc = 'Enter a valid IFSC code';
  }

  addRequiredError(errors, data, 'branch', 'Branch is required');

  if (!data.passbook) {
    errors.passbook = 'Passbook is required';
  }

  if (!data.offerLetter) {
    errors.offerLetter = 'Offer letter is required';
  }

  if (!data.agree) {
    errors.agree = 'You must tick the checkbox';
  }

  return errors;
}

function validateCurrentStep(step, data) {
  const validators = {
    1: validateStep1,
    2: validateStep2,
    3: validateStep3
  };

  return validators[step](data);
}

function App() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData(previous => ({
      ...previous,
      [name]: value,
      ...(name === 'marksheetCount'
        ? {
            collegeMarksheets: previous.collegeMarksheets.slice(
              0,
              Number(value)
            )
          }
        : {})
    }));
  }

  function handleFile(event) {
    const { name, files } = event.target;

    setFormData(previous => ({
      ...previous,
      [name]: files?.[0] || null
    }));
  }

  function handleCheckbox(event) {
    setFormData(previous => ({
      ...previous,
      agree: event.target.checked
    }));
  }

  function handleCollegeFile(event, index) {
    const file = event.target.files?.[0] || null;

    setFormData(previous => {
      const collegeMarksheets = [...previous.collegeMarksheets];
      collegeMarksheets[index] = file;

      return {
        ...previous,
        collegeMarksheets
      };
    });
  }

  async function submitForm() {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      for (const [key, value] of Object.entries(formData)) {
        if (key === 'collegeMarksheets') {
          const count = Number(formData.marksheetCount);

          for (let index = 0; index < count; index += 1) {
            const file = formData.collegeMarksheets[index];

            if (file) {
              data.append('collegeMarksheets', file);
            }
          }

          continue;
        }

        if (key === 'agree') {
          data.append(key, String(value));
          continue;
        }

        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      }

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
    } catch (error) {
      console.error('Registration request failed:', error);
      alert('Cannot connect to the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext(event) {
    event.preventDefault();

    const newErrors = validateCurrentStep(step, formData);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (step < 3) {
      setStep(current => current + 1);
      return;
    }

    await submitForm();
  }

  function handleBack() {
    setErrors({});
    setStep(current => Math.max(1, current - 1));
  }

  let submitButtonText = 'Submit';

  if (submitting) {
    submitButtonText = 'Submitting...';
  } else if (step < 3) {
    submitButtonText = 'Save & Continue';
  }

  return (
    <div className="container">
      <h1>tringapps</h1>
      <h2 className="on">OnBoard Registration</h2>

      <div className="progress">
        <span className={step === 1 ? 'active' : ''}>
          1. Personal Details
        </span>

        <span className={step === 2 ? 'active' : ''}>
          2. Education Details
        </span>

        <span className={step === 3 ? 'active' : ''}>
          3. Bank Details
        </span>
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
            <button type="button" onClick={handleBack}>
              Back
            </button>
          )}

          <button type="submit" disabled={submitting}>
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;