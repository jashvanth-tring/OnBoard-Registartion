const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Fake database: registered in the require cache so ../db (and MySQL) never loads.
const dbPath = require.resolve('../db');
const fakeDb = {
  handler: (sql, params, cb) => cb(null, { insertId: 1 }),
  query(...args) {
    const callback = args.pop();
    fakeDb.handler(args[0], args[1], callback);
  }
};
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: fakeDb
};

const JPEG = 'image/jpeg';
const PDF = 'application/pdf';

const validFields = {
  fullName: 'Test User',
  dob: '2004-05-10',
  gender: 'Male',
  email: 'test@example.com',
  mobile: '9876543210',
  altMobile: '9123456780',
  fatherName: 'Test Father',
  motherName: 'Test Mother',
  maritalStatus: 'Single',
  bloodGroup: 'O+',
  tenthSchool: 'Test School',
  tenthPercentage: '90',
  twelfthSchool: 'Test Higher Secondary',
  twelfthPercentage: '88',
  collegeName: 'Test College',
  cgpa: '8.5',
  marksheetCount: '1',
  bankName: 'State Bank Of India',
  accountNo: '123456789012',
  ifsc: 'SBIN0001234',
  branch: 'Chennai',
  agree: 'true'
};

const validFiles = {
  photo: JPEG,
  signature: JPEG,
  aadhar: JPEG,
  pan: JPEG,
  tenthMarksheet: PDF,
  twelfthMarksheet: PDF,
  passbook: PDF,
  offerLetter: PDF
};

// Text fields are appended before files so multer sees fullName first.
function makeForm({ fields = {}, files = {}, collegeCount = 1, collegeType = PDF } = {}) {
  const form = new FormData();

  for (const [key, value] of Object.entries({ ...validFields, ...fields })) {
    if (value !== undefined) {
      form.append(key, value);
    }
  }

  for (const [name, spec] of Object.entries({ ...validFiles, ...files })) {
    if (spec === undefined) {
      continue;
    }

    const { type, size = 10 } = typeof spec === 'string' ? { type: spec } : spec;
    const extension = type === JPEG ? '.jpg' : '.pdf';

    form.append(
      name,
      new Blob([Buffer.alloc(size, 1)], { type }),
      name + extension
    );
  }

  for (let i = 0; i < collegeCount; i++) {
    form.append(
      'collegeMarksheets',
      new Blob(['x'], { type: collegeType }),
      'college' + i + '.pdf'
    );
  }

  return form;
}

describe('registration backend', () => {
  let server;
  let baseUrl;
  const uploadsDir = path.join(__dirname, '..', 'uploads');

  async function post(form) {
    const response = await fetch(baseUrl + '/register', {
      method: 'POST',
      body: form
    });

    return { status: response.status, body: await response.json() };
  }

  before(async () => {
    const app = require('../server');

    server = await new Promise(resolve => {
      const instance = app.listen(0, () => resolve(instance));
    });

    baseUrl = 'http://127.0.0.1:' + server.address().port;
  });

  after(() => {
    server.closeAllConnections?.();
    server.close();

    for (const name of fs.readdirSync(uploadsDir)) {
      if (name.startsWith('Test_User_')) {
        fs.rmSync(path.join(uploadsDir, name), { recursive: true, force: true });
      }
    }
  });

  beforeEach(() => {
    fakeDb.handler = (sql, params, cb) => cb(null, { insertId: 1 });
  });

  describe('basic routes', () => {
    it('GET / reports the server is running', async () => {
      const response = await fetch(baseUrl + '/');

      assert.equal(response.status, 200);
      assert.equal(await response.text(), 'server is running');
    });

    it('GET /test-db reports a connected database', async () => {
      fakeDb.handler = (sql, params, cb) => cb(null);

      const response = await fetch(baseUrl + '/test-db');

      assert.equal(response.status, 200);
      assert.equal(await response.text(), 'connected');
    });

    it('GET /test-db reports a database failure', async () => {
      fakeDb.handler = (sql, params, cb) => cb(new Error('down'));

      const response = await fetch(baseUrl + '/test-db');

      assert.equal(response.status, 500);
      assert.equal(await response.text(), 'Database not connected');
    });
  });

  describe('field validation', () => {
    const cases = [
      ['missing full name', { fullName: undefined }, 'fullName is required'],
      ['blank branch', { branch: '   ' }, 'branch is required'],
      ['short mobile', { mobile: '123' }, 'Mobile must be 10 digits'],
      ['non numeric mobile', { mobile: '98765abcde' }, 'Mobile must be 10 digits'],
      ['short alternate mobile', { altMobile: '12' }, 'Alternate mobile must be 10 digits'],
      ['same mobile numbers', { altMobile: '9876543210' }, 'Mobile and alternate mobile must not be the same'],
      ['email without at sign', { email: 'plain' }, 'Enter a valid email'],
      ['email with two at signs', { email: 'a@@b.com' }, 'Enter a valid email'],
      ['email without local part', { email: '@b.com' }, 'Enter a valid email'],
      ['email ending with at sign', { email: 'a@' }, 'Enter a valid email'],
      ['email with space in local part', { email: 'a b@c.com' }, 'Enter a valid email'],
      ['email without dot in domain', { email: 'a@b' }, 'Enter a valid email'],
      ['email ending with dot', { email: 'a@b.' }, 'Enter a valid email'],
      ['email with space in domain', { email: 'a@b .com' }, 'Enter a valid email'],
      ['email local part too long', { email: 'a'.repeat(65) + '@b.com' }, 'Enter a valid email'],
      ['email too long', { email: 'a'.repeat(250) + '@b.com' }, 'Enter a valid email'],
      ['dob wrong format', { dob: 'not-a-date' }, 'Enter a valid date of birth'],
      ['dob that does not exist', { dob: '2023-02-29' }, 'Enter a valid date of birth'],
      ['invalid gender', { gender: 'Robot' }, 'Select a valid gender'],
      ['invalid marital status', { maritalStatus: 'Complicated' }, 'Select a valid marital status'],
      ['invalid blood group', { bloodGroup: 'Z+' }, 'Select a valid blood group'],
      ['10th percentage too high', { tenthPercentage: '101' }, '10th percentage must be 0 to 100'],
      ['12th percentage not a number', { twelfthPercentage: 'abc' }, '12th percentage must be 0 to 100'],
      ['cgpa too high', { cgpa: '11' }, 'CGPA must be 0 to 10'],
      ['marksheet count too high', { marksheetCount: '9' }, 'Marksheet count must be 1 to 8'],
      ['marksheet count zero', { marksheetCount: '0' }, 'Marksheet count must be 1 to 8'],
      ['marksheet count not a number', { marksheetCount: 'x' }, 'Marksheet count must be 1 to 8'],
      ['short account number', { accountNo: '123' }, 'Account number must be 9 to 18 digits'],
      ['invalid IFSC', { ifsc: 'BAD' }, 'Enter a valid 11-character IFSC code'],
      ['IFSC without zero', { ifsc: 'SBIN1001234' }, 'Enter a valid 11-character IFSC code'],
      ['agreement not accepted', { agree: 'false' }, 'You must agree to join']
    ];

    for (const [title, fields, message] of cases) {
      it('rejects ' + title, async () => {
        const result = await post(makeForm({ fields }));

        assert.equal(result.status, 400);
        assert.equal(result.body.message, message);
      });
    }

    it('rejects a request that has no form data at all', async () => {
      const response = await fetch(baseUrl + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });

      assert.equal(response.status, 400);
      assert.equal((await response.json()).message, 'fullName is required');
    });
  });

  describe('file validation', () => {
    it('rejects a missing required file', async () => {
      const result = await post(makeForm({ files: { photo: undefined } }));

      assert.equal(result.status, 400);
      assert.equal(result.body.message, 'photo file is required');
    });

    it('rejects the wrong number of college marksheets', async () => {
      const result = await post(
        makeForm({ fields: { marksheetCount: '2' }, collegeCount: 1 })
      );

      assert.equal(result.status, 400);
      assert.equal(
        result.body.message,
        'Please upload exactly 2 college marksheet(s)'
      );
    });

    it('rejects a PDF uploaded as a photo', async () => {
      const result = await post(makeForm({ files: { photo: PDF } }));

      assert.equal(result.status, 400);
      assert.equal(result.body.message, 'Invalid file type for photo');
    });

    it('rejects an invalid college marksheet type', async () => {
      const result = await post(makeForm({ collegeType: 'text/plain' }));

      assert.equal(result.status, 400);
      assert.equal(
        result.body.message,
        'Invalid file type for collegeMarksheets'
      );
    });

    it('rejects an unexpected file field', async () => {
      const form = makeForm();
      form.append('hacker', new Blob(['x'], { type: JPEG }), 'hacker.jpg');

      const result = await post(form);

      assert.equal(result.status, 400);
      assert.equal(result.body.message, 'Unexpected file field: hacker');
    });

    it('rejects a file larger than 5 MB', async () => {
      const result = await post(
        makeForm({ files: { photo: { type: JPEG, size: 5 * 1024 * 1024 + 1 } } })
      );

      assert.equal(result.status, 400);
      assert.equal(result.body.message, 'Each file must be 5 MB or smaller');
    });
  });

  describe('saving a registration', () => {
    it('saves a valid registration with an optional passport', async () => {
      let captured;

      fakeDb.handler = (sql, record, cb) => {
        captured = { sql, record };
        cb(null, { insertId: 42 });
      };

      const result = await post(
        makeForm({
          fields: { ifsc: 'sbin0001234', marksheetCount: '3' },
          files: { passport: JPEG },
          collegeCount: 3
        })
      );

      assert.equal(result.status, 201);
      assert.equal(result.body.id, 42);
      assert.equal(captured.sql, 'INSERT INTO registrations SET ?');
      assert.equal(captured.record.ifsc, 'SBIN0001234');
      assert.equal(captured.record.photo, 'photo.jpg');
      assert.equal(captured.record.passport, 'passport.jpg');
      assert.equal(captured.record.cgpa, 8.5);
      assert.equal(
        captured.record.college_marksheets,
        'collegeMarksheet1.pdf,collegeMarksheet2.pdf,collegeMarksheet3.pdf'
      );
    });

    it('saves a registration without a passport', async () => {
      let captured;

      fakeDb.handler = (sql, record, cb) => {
        captured = record;
        cb(null, { insertId: 7 });
      };

      const result = await post(makeForm());

      assert.equal(result.status, 201);
      assert.equal(captured.passport, null);
    });

    it('reports a duplicate email or mobile', async () => {
      fakeDb.handler = (sql, record, cb) => cb({ code: 'ER_DUP_ENTRY' });

      const result = await post(makeForm());

      assert.equal(result.status, 400);
      assert.equal(
        result.body.message,
        'This email or mobile is already registered'
      );
    });

    it('reports other database errors', async t => {
      t.mock.method(console, 'error', () => {});
      fakeDb.handler = (sql, record, cb) => cb(new Error('boom'));

      const result = await post(makeForm());

      assert.equal(result.status, 500);
      assert.equal(result.body.message, 'Database error, please try again');
    });
  });
});