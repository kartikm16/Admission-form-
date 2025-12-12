import AdmissionForm from "../components/AdmissionForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-accent-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-hero-pattern opacity-50"></div>
        <div className="absolute top-0 right-0 -z-10 translate-x-1/2 translate-y-[-10%] opacity-30 blur-3xl">
          <div className="aspect-square w-[700px] rounded-full bg-gradient-to-tr from-primary-400 to-accent-400"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            {/* Hero Content */}
            <div className="max-w-2xl text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
                Admissions Open for 2025-26
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                Shape Your Future at <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                  Pillai College
                </span>
              </h1>
              <p className="text-lg leading-8 text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Join a premier engineering institute known for innovation, excellence, and a vibrant campus culture. Start your journey today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 hover:text-primary-600 transition-colors py-3">
                  Explore Campus <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            {/* Form Section */}
            <div className="relative animate-fade-in delay-100">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-20 blur-xl"></div>
              <AdmissionForm />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 -z-0 translate-x-[-10%] translate-y-[-10%] opacity-20 blur-3xl">
          <div className="aspect-square w-[600px] rounded-full bg-primary-600"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-accent-500">Why Choose Us</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineering the Next Generation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Student-first Mentoring",
                desc: "Work closely with faculty mentors, industry advisors, and alumni to build your career plan from semester one.",
                icon: "🎓"
              },
              {
                title: "Strong Hiring Network",
                desc: "Top recruiters across tech, consulting, and manufacturing with pre-placement training and internships.",
                icon: "💼"
              },
              {
                title: "Vibrant Campus Life",
                desc: "Access modern labs, student chapters, hackathons, and cultural fests that keep you inspired.",
                icon: "🚀"
              }
            ].map((feature, idx) => (
              <div key={idx} className="glass-card-dark p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
