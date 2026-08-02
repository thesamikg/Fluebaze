"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/actions";

const initialState: WaitlistState = { status: "idle", message: "" };

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button className="button button-primary form-submit" type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="spin" size={18} /> Joining…
        </>
      ) : (
        <>
          Join the e-commerce pilot <ArrowRight aria-hidden="true" size={18} />
        </>
      )}
    </button>
  );
}

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const referralRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (referralRef.current) {
      referralRef.current.value = new URLSearchParams(window.location.search).get("ref") ?? "";
    }
  }, []);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];
  const isPositive = state.status === "success" || state.status === "duplicate";

  return (
    <form ref={formRef} action={action} className="waitlist-form" noValidate={false}>
      <input ref={referralRef} type="hidden" name="referral_source" defaultValue="" />

      <div className="field-grid">
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" autoComplete="name" minLength={2} maxLength={100} required placeholder="Alex Morgan" aria-describedby={fieldError("full_name") ? "full_name-error" : undefined} />
          {fieldError("full_name") && <span id="full_name-error" className="field-error">{fieldError("full_name")}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="alex@company.com" aria-describedby={fieldError("email") ? "email-error" : undefined} />
          {fieldError("email") && <span id="email-error" className="field-error">{fieldError("email")}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="company_name">Company or brand name</label>
        <input id="company_name" name="company_name" autoComplete="organization" minLength={2} maxLength={120} required placeholder="Your company" aria-describedby={fieldError("company_name") ? "company_name-error" : undefined} />
        {fieldError("company_name") && <span id="company_name-error" className="field-error">{fieldError("company_name")}</span>}
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="business_type">E-commerce category</label>
          <select id="business_type" name="business_type" required defaultValue="">
            <option value="" disabled>Select one</option>
            <option>Beauty &amp; wellness brand</option>
            <option>Fashion &amp; lifestyle brand</option>
            <option>Food &amp; beverage brand</option>
            <option>Consumer goods brand</option>
            <option>Other ecommerce brand</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="monthly_collaborations">Collaborations per month</label>
          <select id="monthly_collaborations" name="monthly_collaborations" required defaultValue="">
            <option value="" disabled>Select a range</option>
            <option>1–10</option>
            <option>11–25</option>
            <option>26–50</option>
            <option>51–100</option>
            <option>More than 100</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="biggest_challenge">Where does your creator workflow break today? <span>Optional</span></label>
        <textarea id="biggest_challenge" name="biggest_challenge" maxLength={1000} rows={4} placeholder="Product seeding, follow-ups, content approvals, promo codes, reporting…" />
      </div>

      <SubmitButton pending={pending} />

      {state.message && (
        <div className={`form-message ${isPositive ? "is-success" : "is-error"}`} role={isPositive ? "status" : "alert"} aria-live="polite">
          {isPositive && <CheckCircle2 aria-hidden="true" size={18} />}
          <span>{state.message}</span>
        </div>
      )}
      <p className="privacy-note">No spam. We will only contact you about the e-commerce pilot and important product updates.</p>
    </form>
  );
}
