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
      <h2 className="text-2xl font-bold text-foreground">
        Voting FAQ
      </h2>
      <div className="mt-4 overflow-hidden rounded-[24px] border border-white/80 bg-white/85 shadow-[0_20px_45px_-30px_rgba(37,53,118,0.45)] backdrop-blur">
        <Accordion type="single" collapsible className="w-full">
          {safeItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="px-5 py-4 text-base font-medium text-foreground hover:bg-secondary/50 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                  {item.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 pt-0 text-base leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
