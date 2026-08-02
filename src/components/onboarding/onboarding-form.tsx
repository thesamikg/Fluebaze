"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { completeOnboarding } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  workspaceName: z.string().trim().min(2, "Enter your brand or company name.").max(120),
  collaborationVolume: z.enum(["1–5", "6–10", "11–25", "26–40", "40+"]),
  currentWorkflow: z.enum(["Spreadsheet", "WhatsApp", "Instagram DMs", "Email", "Other"]),
});

type Values = z.infer<typeof schema>;

export function OnboardingForm({ defaultName = "" }: { defaultName?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState("");
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultName,
      workspaceName: "",
      collaborationVolume: "11–25",
      currentWorkflow: "Spreadsheet",
    },
  });

  async function nextStep() {
    const valid = await trigger(["fullName", "workspaceName"]);
    if (valid) setStep(2);
  }

  function onSubmit(values: Values) {
    setServerError("");
    startTransition(async () => {
      const result = await completeOnboarding(values);
      if (!result.ok) {
        setServerError(result.message);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-semibold tracking-[-.03em]">
          <span className="grid size-8 place-items-center rounded-lg bg-[#171a17] text-sm font-bold text-[#c7ff4a]">F</span>
          Fluebaze
        </span>
        <span className="text-xs font-medium text-[#7d837a]">Step {step} of 2</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#e4e6df]">
        <div className="h-full rounded-full bg-[#91c42e] transition-all" style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        {step === 1 ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[.13em] text-[#648b1d]">Your workspace</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Let’s build your creator CRM.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f756d]">
              Two quick steps, then we’ll add a sample e-commerce campaign so you can see the workflow immediately.
            </p>
            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              <Field label="Your full name" error={errors.fullName?.message}>
                <Input autoFocus placeholder="Sam Patel" {...register("fullName")} />
              </Field>
              <Field label="E-commerce brand" error={errors.workspaceName?.message}>
                <Input placeholder="Aster & Bloom" {...register("workspaceName")} />
              </Field>
            </div>
            <Button type="button" variant="primary" size="lg" className="mt-8 w-full sm:w-auto" onClick={nextStep}>
              Continue <ArrowRight size={16} />
            </Button>
          </section>
        ) : (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[.13em] text-[#648b1d]">Your creator program</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Help us shape the right starting point.</h1>
            <p className="mt-3 text-sm leading-6 text-[#6f756d]">You can update these details later in Settings.</p>
            <div className="mt-9 grid gap-7">
              <ChoiceGroup
                label="Influencer partnerships per month"
                name="collaborationVolume"
                options={["1–5", "6–10", "11–25", "26–40", "40+"]}
                register={register}
              />
              <ChoiceGroup
                label="Where do you manage influencer campaigns today?"
                name="currentWorkflow"
                options={["Spreadsheet", "WhatsApp", "Instagram DMs", "Email", "Other"]}
                register={register}
              />
            </div>
            {serverError ? <p role="alert" className="mt-6 rounded-lg bg-[#fde8e6] px-3 py-2 text-sm text-[#9b3f36]">{serverError}</p> : null}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={pending}>
                {pending ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />}
                {pending ? "Creating workspace…" : "Create my workspace"}
              </Button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-[#b4473d]">{error}</p> : null}
    </div>
  );
}

function ChoiceGroup({
  label,
  name,
  options,
  register,
}: {
  label: string;
  name: "collaborationVolume" | "currentWorkflow";
  options: readonly string[];
  register: ReturnType<typeof useForm<Values>>["register"];
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-[#333833]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input className="peer sr-only" type="radio" value={option} {...register(name)} />
            <span className="inline-flex min-h-10 items-center rounded-lg border border-[#d9dbd3] bg-white px-4 text-sm text-[#5f655d] transition peer-checked:border-[#7ba228] peer-checked:bg-[#edffc5] peer-checked:text-[#344d08] peer-focus-visible:ring-3 peer-focus-visible:ring-[#c7ff4a]/50">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
