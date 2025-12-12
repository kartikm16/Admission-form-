// /app/api/enquiry/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";

/* ---------- Firebase init (raw JSON only) ---------- */
/**
 * This init expects:
 * - process.env.FIREBASE_SERVICE_ACCOUNT to contain the raw JSON string you downloaded
 *   (the full multi-line JSON object).
 * - process.env.FIREBASE_DATABASE_URL to be set (e.g. https://<your-project>-default-rtdb.firebaseio.com/)
 *
 * If you prefer local file-based credentials for dev, see tips below (GOOGLE_APPLICATION_CREDENTIALS).
 */
function initFirebaseRawJson() {
  if (admin.apps.length) return admin;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT env var. Paste your raw service-account JSON into this env var (not a URL)."
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    // Provide a helpful error and include a short sample to debug (no secrets beyond first 300 chars)
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT (first 300 chars):", String(raw).slice(0, 300));
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Make sure you pasted the exact service account JSON file contents (beginning with '{')."
    );
  }

  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    throw new Error("Missing FIREBASE_DATABASE_URL env var (e.g. https://<project>-default-rtdb.firebaseio.com/)");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });

  return admin;
}

let adminInstance;
try {
  adminInstance = initFirebaseRawJson();
} catch (err) {
  // Initialization failed — log it. Handlers will return a helpful error if init failed.
  console.error("Firebase init error:", err && err.message ? err.message : err);
}

const db = adminInstance ? adminInstance.database() : null;

/* ---------- Helpers ---------- */
const PATH = "enquiries";

function normalizeString(v = "") { return String(v || "").trim(); }
function validateInputs(payload) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const name = normalizeString(payload.name);
  const email = normalizeString(payload.email).toLowerCase();
  const phone = normalizeString(payload.phone);
  const program = normalizeString(payload.program);

  if (!name) errors.push("Name is required");
  if (!email || !emailRegex.test(email)) errors.push("Valid email is required");
  if (!phone || !/^\d{10}$/.test(phone)) errors.push("Valid phone number is required (10 digits)");
  if (!program) errors.push("Program is required");

  if (name.length > 200) errors.push("Name is too long");
  if (email.length > 200) errors.push("Email is too long");
  if (program.length > 200) errors.push("Program is too long");

  return { errors, normalized: { name, email, phone, program } };
}

function compEmailProg(program, email) { return `${program}__${email}`; }
function compPhoneProg(program, phone) { return `${program}__${phone}`; }

async function duplicateEmail(program, email) {
  const val = compEmailProg(program, email);
  const snap = await db.ref(PATH).orderByChild("email_program").equalTo(val).limitToFirst(1).get();
  return snap.exists();
}
async function duplicatePhone(program, phone) {
  const val = compPhoneProg(program, phone);
  const snap = await db.ref(PATH).orderByChild("phone_program").equalTo(val).limitToFirst(1).get();
  return snap.exists();
}

/* ---------- POST handler ---------- */
export async function POST(req) {
  // Ensure firebase init succeeded
  if (!adminInstance || !db) {
    console.error("Firebase not initialized. Check FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL.");
    return NextResponse.json({ error: "Server configuration error (firebase)." }, { status: 500 });
  }

  // parse body
  let body;
  try { body = await req.json(); } catch (err) {
    let raw = "<unavailable>";
    try { raw = await req.text(); } catch {}
    console.error("Request JSON parse failed. Raw body sample:", String(raw).slice(0, 500));
    return NextResponse.json({ error: "Invalid request body; expected JSON." }, { status: 400 });
  }

  try {
    const { errors: inputErrors, normalized } = validateInputs(body);
    if (inputErrors.length) return NextResponse.json({ error: inputErrors.join(", ") }, { status: 400 });

    // duplicate checks
    const [dupE, dupP] = await Promise.all([
      duplicateEmail(normalized.program, normalized.email),
      duplicatePhone(normalized.program, normalized.phone),
    ]);

    const dupErrors = [];
    if (dupE && dupP) dupErrors.push("Email and phone number already registered.");
    else {
      if (dupE) dupErrors.push("Email already registered");
      if (dupP) dupErrors.push("Mobile number already registered");
    }
    if (dupErrors.length) return NextResponse.json({ error: dupErrors.join(", ") }, { status: 400 });

    const entry = {
      id: crypto.randomUUID(),
      name: normalized.name,
      email: normalized.email,
      phone: normalized.phone,
      program: normalized.program,
      email_program: compEmailProg(normalized.program, normalized.email),
      phone_program: compPhoneProg(normalized.program, normalized.phone),
      submittedAt: new Date().toISOString(),
    };

    try {
      await db.ref(`${PATH}/${entry.id}`).set(entry);
    } catch (dbErr) {
      console.error("Realtime DB write error:", dbErr && dbErr.message ? dbErr.message : dbErr);
      return NextResponse.json({ error: "Database write failed." }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (err) {
    console.error("Unhandled POST error:", err && err.stack ? err.stack : err);
    return NextResponse.json({ error: "Unable to process your enquiry at the moment." }, { status: 500 });
  }
}

/* ---------- GET handler ---------- */
export async function GET() {
  if (!adminInstance || !db) {
    console.error("Firebase not initialized. Check FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL.");
    return NextResponse.json({ error: "Server configuration error (firebase)." }, { status: 500 });
  }

  try {
    const snap = await db.ref(PATH).orderByChild("submittedAt").limitToLast(1000).get();
    const items = [];
    if (snap.exists()) {
      const val = snap.val();
      for (const k of Object.keys(val)) items.push(val[k]);
      items.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : a.submittedAt > b.submittedAt ? -1 : 0));
    }
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET error:", err && err.stack ? err.stack : err);
    return NextResponse.json({ error: "Unable to fetch enquiries" }, { status: 500 });
  }
}



/////////////////FOR LOCAL STORAGE////////////////////////

// import { NextResponse } from "next/server";
// import { promises as fs } from "fs";
// import path from "path";
// import crypto from "crypto";

// const dataDir = path.join(process.cwd(), "data");
// const dataFile = path.join(dataDir, "enquiries.json");

// async function ensureDataFile() {
//   try {
//     await fs.mkdir(dataDir, { recursive: true });
//     await fs.access(dataFile);
//   } catch {
//     await fs.writeFile(dataFile, "[]", "utf-8");
//   }
// }

// async function validatePayload(payload) {
//   const errors = [];
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   if (!payload.name || !payload.name.trim()) errors.push("Name is required");
//   if (!payload.email || !emailRegex.test(payload.email)) errors.push("Valid email is required");
//   if (!payload.phone || payload.phone.length!=10)
//     errors.push("Valid phone number is required");
//   if (!payload.program || !payload.program.trim()) errors.push("Program is required");
//   ensureDataFile();
//   const raw = await fs.readFile(dataFile, "utf-8");
//   const items = JSON.parse(raw || "[]");
//   items.map((item,i)=>{
//   const emailRegistered = item.email===payload.email && item.program==payload.program
//   const phoneRegistered = item.phone===payload.phone && item.program==payload.program
//   if(emailRegistered&&phoneRegistered){
//     errors.push("Email and phone number already registered.")
//   }
//   else if(emailRegistered){
//       errors.push("Email already registered");
//      }
//   else if(phoneRegistered){
//       errors.push("Mobile number already registered");
//      };
  
//   })

 
//   return errors;
// }

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const errors =await validatePayload(body);
//     if (errors.length) {
//       return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
//     }

//     await ensureDataFile();
//     const raw = await fs.readFile(dataFile, "utf-8");
//     const items = JSON.parse(raw || "[]");

//     const entry = {
//       id: crypto.randomUUID(),
//       name: body.name.trim(),
//       email: body.email.trim(),
//       phone: body.phone.trim(),
//       program: body.program.trim(),
//       submittedAt: new Date().toISOString(),
//     };

//     items.push(entry);
//     await fs.writeFile(dataFile, JSON.stringify(items, null, 2), "utf-8");

//     return NextResponse.json({ success: true, entry }, { status: 201 });
//   } catch (error) {
//     console.error("Failed to save enquiry", error);
//     return NextResponse.json(
//       { error: "Unable to process your enquiry at the moment." },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     await ensureDataFile();
//     const raw = await fs.readFile(dataFile, "utf-8");
//     return NextResponse.json(JSON.parse(raw || "[]"));
//   } catch (error) {
//     console.error("Failed to read enquiries", error);
//     return NextResponse.json({ error: "Unable to fetch enquiries" }, { status: 500 });
//   }
// }

