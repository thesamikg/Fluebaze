"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "@/lib/site-config";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const expanded = open === index;
        return (
          <div className="faq-item" key={faq.question}>
            <h3>
              <button type="button" aria-expanded={expanded} aria-controls={`faq-panel-${index}`} onClick={() => setOpen(expanded ? null : index)}>
                {faq.question}<Plus aria-hidden="true" className={expanded ? "rotated" : ""} size={20} />
              </button>
            </h3>
            <div id={`faq-panel-${index}`} className="faq-panel" hidden={!expanded}><p>{faq.answer}</p></div>
          </div>
        );
      })}
    </div>
  );
}
