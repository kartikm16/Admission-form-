"use client";

import { useState } from "react";
import AdmissionForm from "./AdmissionForm";

export default function AdmissionWidget() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const close = () => setOpen(false);

  const handleSuccess = () => {
    setToast("Enquiry submitted! We will contact you shortly.");
    close();
    setTimeout(() => setToast(""), 4500);
  };

  return (
    <>
      <button
      
        onClick={() => setOpen(true)}
        className="fixed z-40 left-1/2 bottom-2 -translate-x-1/2 w-[90%] h-12 md:left-10 md:bottom-0 md:-translate-y-1/2 md:h-12 md:w-[12rem] md:top-1/2 md:-rotate-90 rounded-full bg-primary-600 px-2 py-1 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        Admission Enquiry
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center md:justify-start md:pl-24">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" onClick={close} />
          <div
          
            className="relative mx-4 w-full max-w-xl rounded-2xl glass-panel animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-xs uppercase font-semibold text-primary-600 tracking-wide">
                  Admissions Desk
                </p>
                <h3 className="text-lg font-semibold text-slate-900">Quick Enquiry</h3>
              </div>
              <button
                onClick={close}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <AdmissionForm compact={true} onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

