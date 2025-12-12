import AdmissionForm from "../components/AdmissionForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 md:flex-row md:items-center">

        <div className="flex-1">
          <AdmissionForm />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-soft">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary-200">Why Pillai</p>
              <h3 className="mt-2 text-2xl font-semibold">Student-first mentoring</h3>
              <p className="mt-3 text-sm text-slate-200">
                Work closely with faculty mentors, industry advisors, and alumni to build your career
                plan from semester one.
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-primary-200">Placements</p>
              <h3 className="mt-2 text-2xl font-semibold">Strong hiring network</h3>
              <p className="mt-3 text-sm text-slate-200">
                Top recruiters across tech, consulting, and manufacturing with pre-placement training
                and internships.
              </p> 
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-primary-200">Campus Life</p>
              <h3 className="mt-2 text-2xl font-semibold">Labs, clubs, culture</h3>
              <p className="mt-3 text-sm text-slate-200">
                Access modern labs, student chapters, hackathons, and cultural fests that keep you
                inspired.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
