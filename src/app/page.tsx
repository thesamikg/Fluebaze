import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AudienceSection, ComparisonSection, EarlyAccessSection, FAQSection, FeaturesSection, FinalCTA, HeroSection, ProblemSection, ProductPreviewSection, WaitlistSection, WorkflowSection } from "@/components/landing-sections";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  const structuredData = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: siteConfig.name, applicationCategory: "BusinessApplication", operatingSystem: "Web", description: siteConfig.description, url: siteConfig.url };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><Navbar /><main><HeroSection /><ProblemSection /><WorkflowSection /><FeaturesSection /><ProductPreviewSection /><AudienceSection /><ComparisonSection /><EarlyAccessSection /><WaitlistSection /><FAQSection /><FinalCTA /></main><Footer /></>;
}
