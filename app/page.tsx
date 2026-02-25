"use client";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  IconListDetails,
  IconArrowRight,
  IconBriefcase,
  IconAdjustments,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: <IconListDetails size={28} stroke={1.5} />,
    title: "Unified Employee & Candidate Records",
    description:
      "Keep all your staff and candidate data in one searchable, organized workspace. Quick create, edit, and filter to make HR fast and simple.",
  },
  {
    icon: <IconBriefcase size={28} stroke={1.5} />,
    title: "Program & Client Management",
    description:
      "Monitor recruitment drives and business programs while linking every employee or candidate to your active clients. Instantly see progress and assignments.",
  },
  {
    icon: <IconAdjustments size={28} stroke={1.5} />,
    title: "Advanced Table Actions",
    description:
      "Instantly search, filter, edit, and export your staff, candidates, programs, or clients—all with one click from any page.",
  },
];

const faqs = [
  {
    q: "How do I add new staff or candidates?",
    a: "Go to the Staff or Candidates page and click the 'Add' button. Fill in the details and submit. You can also use 'Quick Create' from the sidebar/toolbar.",
  },
  {
    q: "How do I manage different clients?",
    a: "Navigate to the Clients section to add, update, or browse all clients and link them to programs.",
  },
  {
    q: "How is data exported?",
    a: "Click the Export button on any data table (staff, candidates, programs, clients) for an instant CSV export.",
  },
  {
    q: "Can I see the growth or performance of my team or programs?",
    a: "Yes! DriveMS provides clear analytics and growth charts so you can easily monitor trends, progress, and performance across staff, candidates, and programs over time.",
  },
];

export default function ProductFeatureFAQMono() {
  const [featureIdx, setFeatureIdx] = React.useState(0);
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-background text-foreground  flex flex-col items-center  px-4 py-14">
      <div className="  flex flex-col items-center">
        <div className="text-4xl md:text-5xl max-w-[770px] text-center  font-extrabold leading-relaxed mb-3">
          Empower Your Manpower Solutions and HR Operations
        </div>
        <div className="text-base md:text-lg text-muted-foreground leading-relaxed  mb-6 text-left">
          Manage employees and candidates in one platform. Track progress,
          streamline hiring, and visualize growth in real time.
        </div>
        {/* Action Buttons */}
        <div className="flex items-center justify-center mt-4 space-x-10">
          <Button
            className="px-7 py-6 rounded-lg font-semibold shadow transition"
            onClick={() => router.push("/dashboard")}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 border-border text-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition"
            onClick={() => router.push("/login")}
          >
            Sign Up
          </Button>
        </div>
      </div>

      {/* Feature Stepper */}
      <section className="max-w-5xl w-full flex flex-col mb-10">
        <div className="text-2xl font-extrabold mb-5">FEATURES</div>
        <div className="flex gap-4  ">
          {features.map((f, i) => (
            <div
              key={i}
              className={`
                flex-1 rounded-xl p-5 border border-border cursor-pointer transition text-left hover:bg-accent/50 transform duration-500
                ${
                  featureIdx === i
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-background text-foreground"
                }
              `}
              style={{ minWidth: "200px" }}
              onClick={() => setFeatureIdx(i)}
            >
              <div className="mb-2">{f.icon}</div>
              <div className="font-bold text-lg uppercase mb-1">{f.title}</div>
              <div
                className={`text-sm ${
                  featureIdx === i
                    ? "text-primary-foreground/90"
                    : "text-muted-foreground"
                }`}
              >
                {f.description}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2  text-lg tracking-wider text-muted-foreground">
          <span>
            {String(featureIdx + 1).padStart(2, "0")}/
            {String(features.length).padStart(2, "0")}
          </span>
          <IconArrowRight size={18} />
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full max-w-4xl items-center">
        <div className="text-2xl font-extrabold mb-5">FAQ</div>
        <Accordion type="single" collapsible className="flex flex-col max-w-xl">
          {faqs.map((faq, idx) => (
            <AccordionItem
              value={`faq-${idx}`}
              key={idx}
              className="border-b-2"
            >
              <AccordionTrigger className="text-base font-bold ">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm  text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
