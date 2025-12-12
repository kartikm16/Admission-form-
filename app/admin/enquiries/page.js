// /app/admin/enquiries/page.js
import React from "react";
import admin from "firebase-admin";

export const revalidate = 0; // always fetch latest

function initFirebaseRawJson() {
  if (admin.apps.length) return admin;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT env var. Paste your raw service-account JSON into this env var."
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    console.error(
      "Failed to parse FIREBASE_SERVICE_ACCOUNT (first 300 chars):",
      String(raw).slice(0, 300)
    );
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Make sure you pasted the exact service account JSON file contents (beginning with '{')."
    );
  }

  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    throw new Error(
      "Missing FIREBASE_DATABASE_URL env var (e.g. https://<project>-default-rtdb.firebaseio.com/)"
    );
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
  console.error("Firebase init error:", err && err.message ? err.message : err);
  // leave adminInstance undefined — handlers will render a helpful message
}

const db = adminInstance ? adminInstance.database() : null;
const PATH = "enquiries";

/* ---------- Helper: read enquiries from Realtime DB ---------- */
async function readEnquiriesRealtime() {
  if (!db) return [];

  try {
    const snap = await db.ref(PATH).orderByChild("submittedAt").limitToLast(2000).get();
    if (!snap.exists()) return [];
    const val = snap.val(); // object keyed by id
    const items = Object.keys(val).map((k) => val[k]);
    // sort descending by submittedAt
    items.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : a.submittedAt > b.submittedAt ? -1 : 0));
    return items;
  } catch (err) {
    console.error("Failed to read enquiries from Realtime DB:", err && err.stack ? err.stack : err);
    return [];
  }
}

/* ---------- Page component (server) ---------- */
export default async function AdminEnquiriesPage() {
  const allowed = process.env.ADMIN_VIEW_ENABLED === "true";

  // If admin view disabled — render the message immediately
  if (!allowed) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
          <h1 className="text-xl font-semibold">Admin view disabled</h1>
          <p className="mt-2 text-sm">
            This page is for local/admin use only. To enable it, set the environment variable{" "}
            <code className="mx-1 rounded bg-amber-100 px-1 py-0.5 text-xs">ADMIN_VIEW_ENABLED=true</code>{" "}
            and restart the dev server. Data is read from your Firebase Realtime Database.
          </p>
        </div>
      </main>
    );
  }

  // If firebase not initialized, show helpful error to admin
  if (!adminInstance || !db) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-900">
          <h1 className="text-xl font-semibold">Firebase not configured</h1>
          <p className="mt-2 text-sm">
            Server could not initialize Firebase Admin SDK. Make sure environment variables{" "}
            <code className="mx-1 rounded bg-rose-100 px-1 py-0.5 text-xs">FIREBASE_SERVICE_ACCOUNT</code> (raw JSON)
            and <code className="mx-1 rounded bg-rose-100 px-1 py-0.5 text-xs">FIREBASE_DATABASE_URL</code> are set.
          </p>
        </div>
      </main>
    );
  }

  // Read enquiries from Realtime DB
  const enquiries = await readEnquiriesRealtime();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-primary-700">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Admission Enquiries</h1>
        <p className="text-sm text-slate-600">For internal review only. Do not expose publicly.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                    No enquiries yet.
                  </td>
                </tr>
              ) : (
                enquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-700">{item.email}</td>
                    <td className="px-4 py-3 text-slate-700">{item.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{item.program}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
///////////TO READ LOCAL DATA///////////////

// import { promises as fs } from "fs";
// import path from "path";

// export const revalidate = 0; // always fetch latest file contents

// const dataFile = path.join(process.cwd(), "data", "enquiries.json");

// async function readEnquiries() {
//   try {
//     const raw = await fs.readFile(dataFile, "utf-8");
//     return JSON.parse(raw || "[]");
//   } catch {
//     return [];
//   }
// }

// export default async function AdminEnquiriesPage() {
//   const allowed = process.env.ADMIN_VIEW_ENABLED === 'true';
//   const enquiries = allowed ? await readEnquiries() : [];

//   if (!allowed) {
//     return (
//       <main className="mx-auto max-w-4xl px-6 py-12">
//         <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
//           <h1 className="text-xl font-semibold">Admin view disabled</h1>
//           <p className="mt-2 text-sm">
//             This page is for local/admin use only. To enable it, set the environment variable
//             <code className="mx-1 rounded bg-amber-100 px-1 py-0.5 text-xs">ADMIN_VIEW_ENABLED=true</code>
//             and restart the dev server. Data is read from <code>data/enquiries.json</code>.
//           </p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="mx-auto max-w-5xl px-6 py-12 space-y-6">
//       <div>
//         <p className="text-sm uppercase tracking-wide text-primary-700">Admin</p>
//         <h1 className="text-3xl font-bold text-slate-900">Admission Enquiries</h1>
//         <p className="text-sm text-slate-600">For internal review only. Do not expose publicly.</p>
//       </div>

//       <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
//         <div className="overflow-auto">
//           <table className="min-w-full divide-y divide-slate-200 text-sm">
//             <thead className="bg-slate-50 text-left text-slate-700">
//               <tr>
//                 <th className="px-4 py-3">Name</th>
//                 <th className="px-4 py-3">Email</th>
//                 <th className="px-4 py-3">Phone</th>
//                 <th className="px-4 py-3">Program</th>
//                 <th className="px-4 py-3">Submitted</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {enquiries.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
//                     No enquiries yet.
//                   </td>
//                 </tr>
//               ) : (
//                 enquiries
//                   .slice()
//                   .reverse()
//                   .map((item) => (
//                     <tr key={item.id} className="hover:bg-slate-50">
//                       <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
//                       <td className="px-4 py-3 text-slate-700">{item.email}</td>
//                       <td className="px-4 py-3 text-slate-700">{item.phone}</td>
//                       <td className="px-4 py-3 text-slate-700">{item.program}</td>
//                       <td className="px-4 py-3 text-slate-500">
//                         {new Date(item.submittedAt).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </main>
//   );
// }

