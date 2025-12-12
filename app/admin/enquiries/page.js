import { promises as fs } from "fs";
import path from "path";

export const revalidate = 0; // always fetch latest file contents

const dataFile = path.join(process.cwd(), "data", "enquiries.json");

async function readEnquiries() {
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export default async function AdminEnquiriesPage() {
  const allowed = process.env.ADMIN_VIEW_ENABLED === 'true';
  const enquiries = allowed ? await readEnquiries() : [];

  if (!allowed) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
          <h1 className="text-xl font-semibold">Admin view disabled</h1>
          <p className="mt-2 text-sm">
            This page is for local/admin use only. To enable it, set the environment variable
            <code className="mx-1 rounded bg-amber-100 px-1 py-0.5 text-xs">ADMIN_VIEW_ENABLED=true</code>
            and restart the dev server. Data is read from <code>data/enquiries.json</code>.
          </p>
        </div>
      </main>
    );
  }

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
                enquiries
                  .slice()
                  .reverse()
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-700">{item.email}</td>
                      <td className="px-4 py-3 text-slate-700">{item.phone}</td>
                      <td className="px-4 py-3 text-slate-700">{item.program}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(item.submittedAt).toLocaleString()}
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

