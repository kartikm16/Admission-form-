"use client";

import { useState } from "react";

const DEFAULT_PROGRAMS = [
  "B.Tech — Computer Engineering",
  "B.Tech — Electronics",
  "B.Tech — Mechanical",
  "B.Tech — Information Technology",
  "MBA",
  "MCA",
  "MMS",
];



const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateFields(values) {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  }
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (values.phone.trim().length != 10) {
    errors.phone = "Invalid phone number.";
  }
  if (!values.program.trim()) {
    errors.program = "Please select or type a program.";
  }
  return errors;
}

export default function AdmissionForm({
  title = "Admission Enquiry",
  description = "Share your interest and our admissions team will call you back.",
  // onSuccess,
  compact = false,
}) {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });


  function handleChange(e) {
    const feild = e.target.name;
    const value = e.target.value;
    setFormValues((prev) => ({
      ...prev,
      [feild]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    const validation = validateFields(formValues);
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setStatus({ type: "success", message: "Thank you! We will reach out soon." });
      setFormValues({
        name: "",
        email: "",
        phone: "",
        program: "",
      });
      setErrors({});
      // onSuccess?.();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full space-y-5 ${!compact && "glass-panel p-8 rounded-3xl"}`}
    >
      {!compact && (
        <div className="space-y-2 mb-6">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">
            Pillai College of Engineering
          </p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col space-y-1.5 col-span-2 md:col-span-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide ml-1" htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formValues.name}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Rohan Sharma"
            required
          />
          {errors.name && (
            <span id="name-error" className="text-xs text-red-600 ml-1">
              {errors.name}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-1.5 col-span-2 md:col-span-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide ml-1" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            className="input-field"
            placeholder="you@example.com"
            required
          />
          {errors.email && (
            <span id="email-error" className="text-xs text-red-600 ml-1">
              {errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-1.5 col-span-2 md:col-span-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide ml-1" htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formValues.phone}
            onChange={handleChange}
            className="input-field"
            placeholder="98765 43210"
            required
          />
          {errors.phone && (
            <span id="phone-error" className="text-xs text-red-600 ml-1">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-1.5 col-span-2 md:col-span-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide ml-1" htmlFor="program">
            Program <span className="text-red-500">*</span>
          </label>
          <input
            id="program"
            name="program"
            list="program-options"
            value={formValues.program}
            onChange={handleChange}
            className="input-field hidden md:block"
            placeholder="Select Program"
          />

          {/* Select fallback: show on mobile only */}
          <select
            id="program-select"
            name="program"
            value={formValues.program}
            onChange={handleChange}
            className="input-field block md:hidden"
          >
            <option value="">Choose a program</option>
            {DEFAULT_PROGRAMS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <datalist id="program-options">
            {DEFAULT_PROGRAMS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>

          {errors.program && (
            <span id="program-error" className="text-xs text-red-600 ml-1">
              {errors.program}
            </span>
          )}
        </div>
      </div>

      {status.message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
            }`}
          role={status.type === "error" ? "alert" : "status"}
        >
          <span>{status.type === "success" ? "✅" : "⚠️"}</span>
          {status.message}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400 hidden sm:block">
          Your details are secure.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit Enquiry"}
        </button>
      </div>
    </form>
  );
}

