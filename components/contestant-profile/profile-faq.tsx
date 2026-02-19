"use client";

import type { FAQItem } from "@/types/event";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProfileFAQProps {
  items: FAQItem[];
}

export function ProfileFAQ({ items }: ProfileFAQProps) {
  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-20">
      <h2 className="text-xl font-bold text-foreground md:text-2xl">
        Voting FAQ
      </h2>
      <div className="mt-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {safeItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="px-5 py-4 text-sm font-medium text-foreground hover:bg-secondary/50 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                  {item.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 pt-0 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
