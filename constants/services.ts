import type { Service } from "@/types/calculator";

export const services: Service[] = [
  {
    id: "sdr-team",
    name: "SDR Team as a Service",
    description: "Dedicated SDR support to build and qualify outbound pipeline.",
    category: "outbound",
  },
  {
    id: "ae-team",
    name: "AE Team as a Service",
    description: "Account executive resources to run demos and close revenue opportunities.",
    category: "outbound",
  },
  {
    id: "event-lead-gen",
    name: "Event Lead Generation",
    description: "Event-led prospecting and follow-up programs to create qualified conversations.",
    category: "outbound",
  },
  {
    id: "gtme",
    name: "GTM Engineering",
    description: "Go-to-market systems and workflows to improve execution and conversion.",
    category: "outbound",
  },
  {
    id: "performance-marketing",
    name: "Performance Marketing",
    description: "Paid growth campaigns focused on measurable demand generation.",
    category: "inbound",
  },
  {
    id: "content-marketing",
    name: "Content Marketing",
    description: "Content strategy and production to attract and educate high-intent buyers.",
    category: "inbound",
  },
  {
    id: "marketing-automation",
    name: "Marketing Automation",
    description: "Automated lead nurturing and lifecycle campaigns to scale demand capture.",
    category: "inbound",
  },
  {
    id: "account-based-marketing",
    name: "Account-Based Marketing",
    description: "Targeted account programs aligning sales and marketing on priority segments.",
    category: "inbound",
  },
];
