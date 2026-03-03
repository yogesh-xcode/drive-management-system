"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PageSection } from "@/components/layout/PageHeader";
import PageSkeleton from "@/components/Skeleton/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IconSearch } from "@/lib/icons";
import { userService } from "@/lib/repositories";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How do I quickly find a candidate, client, or drive record?",
    answer:
      "Use the page search box to filter the current table, or use header global search (Ctrl + K) to jump directly to matching records across modules.",
  },
  {
    id: "faq-2",
    question: "How can I add a new candidate, staff member, client, or drive?",
    answer:
      "Open the relevant module and click the Add button in the toolbar. Fill in required fields in the side panel and submit to create a new record.",
  },
  {
    id: "faq-3",
    question: "Can I upload data in bulk from CSV?",
    answer:
      "Yes. Use the Upload button on supported pages. Keep column names aligned with the form schema to avoid rejected rows during import.",
  },
  {
    id: "faq-4",
    question: "How do filtering and sorting work in tables?",
    answer:
      "Use Search for quick text matching, Filters for field-specific criteria, and click table headers to sort. Use clear controls to reset quickly.",
  },
  {
    id: "faq-5",
    question: "How do I export or print data for review?",
    answer:
      "Use Export to download records and Print for a formatted page view where available. Apply filters first if you only want a subset of data.",
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const user = await userService.get();
      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [router]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <PageSection className="gap-5">
          <Card className="border-primary/15 bg-gradient-to-b from-primary/5 to-background">
            <CardContent className="px-4 py-8 md:px-8">
              <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Need Assistance?
                </h2>
                <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
                  Search help topics, explore FAQs, and get quick guidance for daily
                  operations in Drivems Suite.
                </p>
                <div className="mt-2 flex w-full max-w-xl gap-2">
                  <div className="relative flex-1">
                    <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask a question..."
                      className="h-10 bg-background pl-9"
                    />
                  </div>
                  <Button type="button" className="h-10 px-5">
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 p-0 md:grid-cols-[320px_1fr]">
              <div className="border-b p-6 md:border-r md:border-b-0">
                <h3 className="text-2xl font-semibold">FAQs</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  Everything you need to know about features, data handling, and
                  module workflows.
                </p>
                <p className="text-muted-foreground mt-8 text-sm">
                  Need direct help?{" "}
                  <a
                    href="mailto:support@drivems.co.in"
                    className="text-primary underline underline-offset-2"
                  >
                    support@drivems.co.in
                  </a>
                </p>
              </div>

              <div className="p-4 md:p-6">
                {filteredFaqs.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-sm">
                    No matching FAQ found. Try a different search term.
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-base">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </div>
    </div>
  );
}
