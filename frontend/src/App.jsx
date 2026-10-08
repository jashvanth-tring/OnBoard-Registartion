import { useState } from "react";
import "./App.css";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

function App(){
  const[step,setStep]=useState(1);
  const[errors, setErrors] = useState({});
  const[formData, setFormData] = useState({
    fullName :"",
    dob: "",
    gender: "",
    mobile: "",
    altMobile: "",
    mail:"",
    fatherName: "",
    motherName: "",
    maritalStatus: "",
    bloodGroup: "",
    photo: null,
    signature: null,
    aadhar: null,
    pan: null,
    passport: null,
  
    tenthSchool: "",
    tenthPercentage: "",
    tenthMarksheet: null,
    twelfthSchool: "",
    twelfthPercentage: "",
    twelfthMarksheet: null,
    collegeName: "",
    cgpa: "",
    marksheetCount: 1,
    collegeMarksheets: [],
    
    bankName: "",
    accountNo: "",
    ifsc: "",
    branch: "",
    passbook: null,
    offerLetter: null,
    agree: false,
  });
  function handleChange(e){
    setFormData({...formData,[e.target.name]: e.target.value});  
  }
   function handleFile(e) {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  }
 function handleCheckbox(e) {
    setFormData({ ...formData, agree: e.target.checked });
  }
   function handleCollegeFile(e, index) {
    const list = [...formData.collegeMarksheets]; 
    list[index] = e.target.files[0];               
    setFormData({ ...formData, collegeMarksheets: list });
  }
   function validateStep1() {
    const newErrors = {};
     if (formData.fullName === "") newErrors.fullName = "Name is required";
    if (formData.dob === "") newErrors.dob = "Date of birth is required";
    if (formData.gender === "") newErrors.gender = "Select gender";
if (!formData.photo) newErrors.photo = "Photo is required";
    else if (formData.photo.type !== "image/jpeg") newErrors.photo = "Only JPG allowed";

    if (formData.email === "") newErrors.email = "Email is required";
    else if (!formData.email.includes("@")) newErrors.email = "Enter a valid email";

    if (formData.mobile.length !== 10 || isNaN(formData.mobile)) {
      newErrors.mobile = "Enter 10 digit mobile number";
    }
    if (formData.altMobile.length !== 10 || isNaN(formData.altMobile)) {
      newErrors.altMobile = "Enter 10 digit alternate number";
    }

    if (!newErrors.mobile && !newErrors.altMobile && formData.mobile === formData.altMobile) {
      newErrors.altMobile = "Alternate number must be different from mobile number";
    }
    

    if (formData.fatherName === "") newErrors.fatherName = "Father name is required";
    if (formData.motherName === "") newErrors.motherName = "Mother name is required";
    if (formData.maritalStatus === "") newErrors.maritalStatus = "Select marital status";
    if (formData.bloodGroup === "") newErrors.bloodGroup = "Select blood group";


    if (!formData.photo) newErrors.photo = "Photo is required";
    else if (formData.photo.type !== "image/jpeg") newErrors.photo = "Only JPG allowed";


     if (!formData.signature) newErrors.signature = "Signature is required";
    else if (formData.signature.type !== "image/jpeg") newErrors.signature = "Only JPG allowed";


    if (!formData.aadhar) newErrors.aadhar = "Aadhar is required";
    else if (formData.aadhar.type !== "image/jpeg") newErrors.aadhar = "Only JPG allowed";

    if (!formData.pan) newErrors.pan = "PAN is required";
    else if (formData.pan.type !== "image/jpeg") newErrors.pan = "Only JPG allowed";

    if (formData.passport && formData.passport.type !== "image/jpeg") {
      newErrors.passport = "Only JPG allowed";
    }

    return newErrors;
    }

  function validateStep2() {
    const newErrors = {};

    if (formData.tenthSchool === "") newErrors.tenthSchool = "School name is required";
    if (formData.tenthPercentage === "" || formData.tenthPercentage < 0 || formData.tenthPercentage > 100) {
      newErrors.tenthPercentage = "Enter percentage between 0 and 100";
    }
    if (!formData.tenthMarksheet) newErrors.tenthMarksheet = "Marksheet is required";

    if (formData.twelfthSchool === "") newErrors.twelfthSchool = "School name is required";
    if (formData.twelfthPercentage === "" || formData.twelfthPercentage < 0 || formData.twelfthPercentage > 100) {
      newErrors.twelfthPercentage = "Enter percentage between 0 and 100";
    }
    if (!formData.twelfthMarksheet) newErrors.twelfthMarksheet = "Marksheet is required";

    if (formData.collegeName === "") newErrors.collegeName = "College name is required";
    if (formData.cgpa === "" || formData.cgpa < 0 || formData.cgpa > 10) {
      newErrors.cgpa = "Enter CGPA between 0 and 10";
    }

    // check only as many boxes as the user selected in the dropdown
    for (let i = 0; i < Number(formData.marksheetCount); i++) {
      if (!formData.collegeMarksheets[i]) {
        newErrors["college" + i] = "Marksheet " + (i + 1) + " is required";
      }
    }

    return newErrors;
  }

  function validateStep3() {
    const newErrors = {};

    if (formData.bankName === "") newErrors.bankName = "Bank name is required";

    // account number: only digits, between 9 and 18 long
    if (formData.accountNo.length < 9 || formData.accountNo.length > 18 || isNaN(formData.accountNo)) {
      newErrors.accountNo = "Enter valid account number (9 to 18 digits)";
    }

    // IFSC code is always exactly 11 characters
    if (formData.ifsc.length !== 11) newErrors.ifsc = "IFSC must be 11 characters";

    if (formData.branch === "") newErrors.branch = "Branch is required";
    if (!formData.passbook) newErrors.passbook = "Passbook is required";
    if (!formData.offerLetter) newErrors.offerLetter = "Offer letter is required";
    if (!formData.agree) newErrors.agree = "You must tick the checkbox";

    return newErrors;
  }
 function handleNext(e) {
    e.preventDefault(); // stop the page from reloading when the form is submitted

    // check the current step only
    let newErrors = {};
    if (step === 1) newErrors = validateStep1();
    if (step === 2) newErrors = validateStep2();
    if (step === 3) newErrors = validateStep3();

    setErrors(newErrors); // show the errors on screen

    // Object.keys(...).length = number of errors. 0 means no mistakes.
    if (Object.keys(newErrors).length === 0) {
      if (step < 3) {
        setStep(step + 1); // go to the next page
      } else {
        submitForm();      // last page, so send the data
      }
    }
  }

  // ---------- SUBMIT ----------
  function submitForm() {
    // FormData is the way to send text AND files together to the backend
    const data = new FormData();

    for (let key in formData) {
      if (key === "collegeMarksheets") {
        // this one is a list of files, so add each file
        for (let i = 0; i < formData.collegeMarksheets.length; i++) {
          data.append("collegeMarksheets", formData.collegeMarksheets[i]);
        }
      } else if (formData[key] !== null) {
        // skip empty files such as passport when not uploaded
        data.append(key, formData[key]);
      }
    }

    // Backend is not ready yet, so we only print it. We will connect it later.
    console.log("Form data ready:", formData);
    alert("Form submitted! Check the console (F12).");
  }

  return(
    <div className="container">
      <h1>TringApps OnBoard Registration</h1>
       {/* progress bar: the current step gets the class "active" so CSS can colour it */}
      <div className="progress">
        <span className={step === 1 ? "active" : ""}>1. Personal Details</span>
        <span className={step === 2 ? "active" : ""}>2. Education Details</span>
        <span className={step === 3 ? "active" : ""}>3. Bank Details</span>
    </div>

     <form onSubmit={handleNext} noValidate>
        {/* show only the step we are on, and pass it what it needs as props */}
        {step === 1 && (
          <Step1 formData={formData} errors={errors} handleChange={handleChange} handleFile={handleFile} />
        )}
        {step === 2 && (
          <Step2 formData={formData} errors={errors} handleChange={handleChange} handleFile={handleFile} handleCollegeFile={handleCollegeFile} />
        )}
        {step === 3 && (
          <Step3 formData={formData} errors={errors} handleChange={handleChange} handleFile={handleFile} handleCheckbox={handleCheckbox} />
        )}

        <div className="buttons">
          {/* Back button shows only on step 2 and 3 */}
          {step > 1 && (
            <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }}>
              Back
            </button>
          )}
          <button type="submit">{step < 3 ? "Save & Continue" : "Submit"}</button>
        </div>
      </form>
    </div>
  );
}

export default App;
 



