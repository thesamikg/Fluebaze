import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return <footer className="footer"><div className="container footer-grid"><div><a className="brand footer-brand" href="#top"><span className="brand-mark">F</span><span>{siteConfig.name}</span></a><p>A simple workspace for influencer outreach, deliverables, approvals, payments, and results.</p></div><div className="footer-links"><div><span>Product</span><a href="#product">Product</a><a href="#features">Features</a><a href="#how-it-works">How it works</a></div><div><span>Company</span><a href={siteConfig.links.privacy}>Privacy</a><a href={siteConfig.links.terms}>Terms</a><a href={`mailto:${siteConfig.email}`}>Contact</a></div><div><span>Social</span><a href={siteConfig.links.linkedin}>LinkedIn <ArrowUpRight size={12} /></a><a href={siteConfig.links.x}>X <ArrowUpRight size={12} /></a></div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span><span>Built for thoughtful creator teams.</span></div></footer>;
}
