
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest';

import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor
} from '@testing-library/react';

import App from '../App';

// Find an input using its name attribute
const getInput = (name) => {
  const input = document.querySelector(`[name="${name}"]`);

  if (!input) {
    throw new Error(`Input not found: ${name}`);
  }

  return input;
};

// Enter text or select a value
const changeInput = (name, value) => {
  fireEvent.change(getInput(name), {
    target: { value }
  });
};

// Upload a file
const uploadFile = (name, file) => {
  fireEvent.change(getInput(name), {
    target: { files: [file] }
  });
};

// Create test files
const jpgFile = (name = 'test.jpg') =>
  new File(['test image'], name, {
    type: 'image/jpeg'
  });

const pdfFile = (name = 'test.pdf') =>
  new File(['test document'], name, {
    type: 'application/pdf'
  });

// Find a college marksheet input by its label
const getCollegeMarksheetInput = (index = 0) => {
  const fields = [...document.querySelectorAll('.field')];

  const field = fields.find((element) => {
    const label = element.querySelector('label');

    if (!label) {
      return false;
    }

    const labelText = label.textContent
      .replace(/\s+/g, ' ')
      .trim();

    return labelText.includes(`College Marksheet ${index + 1}`);
  });

  const input = field?.querySelector('input[type="file"]');

  if (!input) {
    throw new Error(
      `College marksheet ${index + 1} input not found`
    );
  }

  return input;
};

// Upload a college marksheet
const uploadCollegeMarksheet = (
  index = 0,
  file = pdfFile('college.pdf')
) => {
  fireEvent.change(getCollegeMarksheetInput(index), {
    target: { files: [file] }
  });
};

// Click Save & Continue or Submit
const clickContinue = () => {
  const button = screen.getByRole('button', {
    name: /save\s*&\s*continue|submit|submitting/i
  });

  fireEvent.click(button);
};

// Fill valid personal details
const fillPersonalDetails = () => {
  changeInput('fullName', 'Test User');
  changeInput('dob', '2004-05-10');
  changeInput('gender', 'Male');
  changeInput('email', 'test@example.com');
  changeInput('mobile', '9876543210');
  changeInput('altMobile', '9123456780');
  changeInput('fatherName', 'Test Father');
  changeInput('motherName', 'Test Mother');
  changeInput('maritalStatus', 'Single');
  changeInput('bloodGroup', 'O+');

  uploadFile('photo', jpgFile('photo.jpg'));
  uploadFile('signature', jpgFile('signature.jpg'));
  uploadFile('aadhar', jpgFile('aadhar.jpg'));
  uploadFile('pan', jpgFile('pan.jpg'));
};

// Fill valid education details
const fillEducationDetails = () => {
  changeInput('tenthSchool', 'Test Higher Secondary School');
  changeInput('tenthPercentage', '90');
  uploadFile('tenthMarksheet', pdfFile('tenth.pdf'));

  changeInput('twelfthSchool', 'Test Senior Secondary School');
  changeInput('twelfthPercentage', '88');
  uploadFile('twelfthMarksheet', pdfFile('twelfth.pdf'));

  changeInput('collegeName', 'Test Engineering College');
  changeInput('cgpa', '8.5');

  uploadCollegeMarksheet(0);
};

// Fill valid bank details
const fillBankDetails = () => {
  changeInput('bankName', 'State Bank Of India');
  changeInput('accountNo', '123456789012');
  changeInput('ifsc', 'SBIN0001234');
  changeInput('branch', 'Chennai Guindy');

  uploadFile('passbook', pdfFile('passbook.pdf'));
  uploadFile('offerLetter', pdfFile('offer-letter.pdf'));

  fireEvent.click(
    screen.getByLabelText(/I agree to join in TringApps/i)
  );
};

// Navigate to the education step
const goToEducation = () => {
  fillPersonalDetails();
  clickContinue();

  expect(
    screen.getByRole('heading', { name: 'Education Details' })
  ).toBeTruthy();
};

// Navigate to the bank step
const goToBank = () => {
  goToEducation();
  fillEducationDetails();
  clickContinue();

  expect(
    screen.getByRole('heading', { name: 'Bank Details' })
  ).toBeTruthy();
};

describe('OnBoard Registration App', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // 1. Render the application
  it('renders the registration application', () => {
    render(<App />);

    expect(screen.getByText('tringapps')).toBeTruthy();
    expect(screen.getByText('OnBoard Registration')).toBeTruthy();

    expect(
      screen.getByRole('heading', { name: 'Personal Details' })
    ).toBeTruthy();

    expect(
      screen.getByRole('button', {
        name: /save\s*&\s*continue/i
      })
    ).toBeTruthy();
  });

  // 2. Show personal detail fields
  it('shows personal detail fields', () => {
    render(<App />);

    expect(getInput('fullName')).toBeTruthy();
    expect(getInput('dob')).toBeTruthy();
    expect(getInput('email')).toBeTruthy();
    expect(getInput('mobile')).toBeTruthy();
    expect(getInput('altMobile')).toBeTruthy();
  });

  // 3. Validate empty personal details
  it('shows validation errors when personal details are empty', () => {
    render(<App />);

    clickContinue();

    expect(screen.getByText(/^Name is required$/i)).toBeTruthy();
    expect(
      screen.getByText(/^Date of birth is required$/i)
    ).toBeTruthy();
    expect(screen.getByText(/^Enter a valid email$/i)).toBeTruthy();
    expect(screen.getByText(/^Select gender$/i)).toBeTruthy();
    expect(screen.getByText(/^Select blood group$/i)).toBeTruthy();
  });

  // 4. Accept personal detail input
  it('accepts personal detail input', () => {
    render(<App />);

    changeInput('fullName', 'Test User');
    changeInput('email', 'test@example.com');

    expect(getInput('fullName').value).toBe('Test User');
    expect(getInput('email').value).toBe('test@example.com');
  });

  // 5. Validate email
  it('shows a validation error for an invalid email', () => {
    render(<App />);

    changeInput('email', 'invalid-email');
    clickContinue();

    expect(
      screen.getByText(/valid email|invalid email|email is invalid/i)
    ).toBeTruthy();
  });

  // 6. Validate mobile number
  it('shows a validation error for an invalid mobile number', () => {
    render(<App />);

    changeInput('mobile', '123');
    clickContinue();

    expect(
      screen.getByText(/^Enter 10 digit mobile number$/i)
    ).toBeTruthy();
  });

  // 7. Ensure mobile numbers are different
  it('shows an error when both mobile numbers are identical', () => {
    render(<App />);

    changeInput('mobile', '9876543210');
    changeInput('altMobile', '9876543210');

    clickContinue();

    expect(
      screen.getByText(/^Alternate number must be different$/i)
    ).toBeTruthy();
  });

  // 8. Navigate to education
  it('moves to education after valid personal details', () => {
    render(<App />);

    fillPersonalDetails();
    clickContinue();

    expect(
      screen.getByRole('heading', { name: 'Education Details' })
    ).toBeTruthy();
  });

  // 9. Validate empty education details
  it('shows education validation errors when fields are empty', () => {
    render(<App />);

    goToEducation();
    clickContinue();

    expect(
      screen.getAllByText(/school name is required/i).length
    ).toBeGreaterThanOrEqual(2);

    expect(
      screen.getByText(/college name is required/i)
    ).toBeTruthy();
  });

  // 10. Show education fields
  it('shows the education fields', () => {
    render(<App />);

    goToEducation();

    expect(getInput('tenthSchool')).toBeTruthy();
    expect(getInput('tenthPercentage')).toBeTruthy();
    expect(getInput('twelfthSchool')).toBeTruthy();
    expect(getInput('twelfthPercentage')).toBeTruthy();
    expect(getInput('collegeName')).toBeTruthy();
    expect(getInput('cgpa')).toBeTruthy();
  });

  // 11. Accept education details
  it('accepts education details', () => {
    render(<App />);

    goToEducation();

    changeInput('tenthSchool', 'Test School');
    changeInput('tenthPercentage', '90');
    changeInput('twelfthSchool', 'Test Higher Secondary School');
    changeInput('twelfthPercentage', '88');
    changeInput('collegeName', 'Test Engineering College');
    changeInput('cgpa', '8.5');

    expect(getInput('tenthSchool').value).toBe('Test School');
    expect(getInput('tenthPercentage').value).toBe('90');
    expect(getInput('collegeName').value).toBe(
      'Test Engineering College'
    );
    expect(getInput('cgpa').value).toBe('8.5');
  });

  // 12. Change college marksheet count
  it('allows the college marksheet count to be changed', () => {
    render(<App />);

    goToEducation();

    changeInput('marksheetCount', '3');

    expect(getCollegeMarksheetInput(0)).toBeTruthy();
    expect(getCollegeMarksheetInput(1)).toBeTruthy();
    expect(getCollegeMarksheetInput(2)).toBeTruthy();
  });

  // 13. Upload college marksheet
  it('accepts a college marksheet upload', () => {
    render(<App />);

    goToEducation();

    uploadCollegeMarksheet(0, pdfFile('college.pdf'));

    expect(getCollegeMarksheetInput(0)).toBeTruthy();
  });

  // 14. Navigate to bank details
  it('moves to bank details after valid education details', () => {
    render(<App />);

    goToBank();

    expect(
      screen.getByRole('heading', { name: 'Bank Details' })
    ).toBeTruthy();
  });

  // 15. Show bank detail fields
  it('shows bank detail fields', () => {
    render(<App />);

    goToBank();

    expect(getInput('bankName')).toBeTruthy();
    expect(getInput('accountNo')).toBeTruthy();
    expect(getInput('ifsc')).toBeTruthy();
    expect(getInput('branch')).toBeTruthy();
  });

  // 16. Validate empty bank details
  it('shows bank validation errors when required fields are empty', () => {
    render(<App />);

    goToBank();
    clickContinue();

    expect(
      screen.getByText(/bank name is required/i)
    ).toBeTruthy();

    expect(
      screen.getByText(/enter account number with 9 to 18 digits/i)
    ).toBeTruthy();

    expect(
      screen.getByText(/enter a valid IFSC code/i)
    ).toBeTruthy();

    expect(
      screen.getByText(/branch is required/i)
    ).toBeTruthy();
  });

  // 17. Accept bank detail input
  it('accepts bank detail input', () => {
    render(<App />);

    goToBank();

    changeInput('bankName', 'State Bank Of India');
    changeInput('accountNo', '123456789012');
    changeInput('ifsc', 'SBIN0001234');
    changeInput('branch', 'Chennai Guindy');

    expect(getInput('bankName').value).toBe('State Bank Of India');
    expect(getInput('accountNo').value).toBe('123456789012');
    expect(getInput('ifsc').value).toBe('SBIN0001234');
    expect(getInput('branch').value).toBe('Chennai Guindy');
  });

  // 18. Navigate back to education
  it('navigates back from bank details to education', () => {
    render(<App />);

    goToBank();

    fireEvent.click(
      screen.getByRole('button', { name: /back/i })
    );

    expect(
      screen.getByRole('heading', { name: 'Education Details' })
    ).toBeTruthy();
  });

  // 19. Navigate back to personal details
  it('navigates back from education to personal details', () => {
    render(<App />);

    goToEducation();

    fireEvent.click(
      screen.getByRole('button', { name: /back/i })
    );

    expect(
      screen.getByRole('heading', { name: 'Personal Details' })
    ).toBeTruthy();
  });

  // 20. Validate account number
  it('shows a validation error for an invalid account number', () => {
    render(<App />);

    goToBank();

    changeInput('accountNo', '12345');
    clickContinue();

    expect(
      screen.getByText(/enter account number with 9 to 18 digits/i)
    ).toBeTruthy();
  });

  // 21. Validate IFSC
  it('shows a validation error for an invalid IFSC code', () => {
    render(<App />);

    goToBank();

    changeInput('ifsc', 'INVALID');
    clickContinue();

    expect(
      screen.getByText(/enter a valid IFSC code/i)
    ).toBeTruthy();
  });

  // 22. Validate agreement checkbox
  it('shows an error when the agreement checkbox is not selected', () => {
    render(<App />);

    goToBank();

    changeInput('bankName', 'State Bank Of India');
    changeInput('accountNo', '123456789012');
    changeInput('ifsc', 'SBIN0001234');
    changeInput('branch', 'Chennai Guindy');

    uploadFile('passbook', pdfFile('passbook.pdf'));
    uploadFile('offerLetter', pdfFile('offer-letter.pdf'));

    clickContinue();

    expect(screen.getByText(/agree/i)).toBeTruthy();
  });

  // 23. Submit valid registration
  it('sends registration data when all details are valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Registration successful'
      })
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    goToBank();
    fillBankDetails();
    clickContinue();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock.mock.calls[0][0]).toContain('/register');
    expect(window.alert).toHaveBeenCalled();
  });

  // 24. Handle server rejection
  it('shows an error when the server rejects registration', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Registration failed'
      })
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    goToBank();
    fillBankDetails();
    clickContinue();

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  // 25. Handle network failure
  it('shows an error when the server request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(
      new Error('Network error')
    );

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    goToBank();
    fillBankDetails();
    clickContinue();

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  // 26. Handle invalid JSON response
  it('handles a response that is not valid JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      }
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    goToBank();
    fillBankDetails();
    clickContinue();

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  // 27. Prevent invalid submission
  it('prevents submission when personal validation fails', () => {
    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    clickContinue();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  // 28. Check first-step button
  it('renders the correct button text on the first step', () => {
    render(<App />);

    expect(
      screen.getByRole('button', {
        name: /save\s*&\s*continue/i
      })
    ).toBeTruthy();
  });

  // 29. Check final-step button
  it('renders the submit button on the final step', () => {
    render(<App />);

    goToBank();

    expect(
      screen.getByRole('button', { name: /submit/i })
    ).toBeTruthy();
  });
});
