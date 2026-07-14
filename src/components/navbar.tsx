"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation, siteConfig } from "@/lib/site-config";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar-wrap">
      <nav className="navbar container" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label={`${siteConfig.name} home`}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>{siteConfig.name}</span>
        </a>
        <div className="nav-links">
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </div>
        <a className="button button-dark nav-cta" href="#waitlist">Join waitlist</a>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>
      {open && (
        <div id="mobile-navigation" className="mobile-nav container">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <a className="button button-dark" href="#waitlist" onClick={() => setOpen(false)}>Join waitlist</a>
        </div>
      )}
    </header>
  );
}
