// ============================================================
//  STARTING VALUES for the website.
//
//  Almost everything here can ALSO be changed from the admin page
//  (/admin). What you type in admin wins over what is written here.
//  So this file is just "what the site shows before anything is saved".
//
//  The few things that are NOT in admin (menu links, the 3 steps,
//  the 3 "how we work" points, the contact-form drop-down) are at
//  the bottom of this file. Edit them here.
// ============================================================

import type { Item, Settings } from "./types";

// ---------- Starting company details & text ----------
export const defaultSettings: Settings = {
  name: "J.K. Construction and Suppliers Pvt. Ltd.",
  shortName: "J.K. Construction",
  slogan: "Don't just build… Create!",
  registrationNumber: "287380",
  panNumber: "",
  established: "",
  address: "Janakpurdham-13, Dhanusha, Nepal",
  phone: "+977 9854033206",
  whatsapp: "",
  email1: "jkcons2078@gmail.com",
  email2: "jkconstruction2022@yahoo.com",
  hours: "",
  url: "https://www.jkconstruction.com.np",

  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",

  heroLabel: "Janakpurdham · Dhanusha · Nepal",
  heroTitleTop: "Don't just build…",
  heroTitleAccent: "Create!",
  heroText:
    "Planning to build, renovate or buy materials? We do the construction and we supply the building materials too, so you only need one phone number. Tell us what you have in mind and we'll take it from there.",
  heroImage: "",

  stat1Number: "", stat1Label: "",
  stat2Number: "", stat2Label: "",
  stat3Number: "", stat3Label: "",
  stat4Number: "", stat4Label: "",

  aboutIntro:
    "J.K. Construction and Suppliers Pvt. Ltd. is a registered company in Janakpurdham-13, Dhanusha. We build, and we supply building materials, so you can work with one local team for both.",
  aboutSecond:
    "Our slogan says it best: don't just build, create. A new building, a renovation or a truckload of materials, we want you to be happy with how it turns out.",
  aboutImage: "",
  mission:
    "To give people dependable building work and materials, and to be honest and clear with them from the first phone call to the day we hand over.",
  vision: "To be the company people around here recommend when they want something built well.",

  directorName: "",
  directorRole: "",
  directorMessage: "",
  directorImage: "",

  metaDescription:
    "J.K. Construction and Suppliers Pvt. Ltd. – construction works and building supplies in Janakpurdham, Dhanusha, Nepal. Call us or request a quote.",
};

// ---------- Starting lists (until you save your own in admin) ----------
export const defaultLists: Record<string, Item[]> = {
  services: [
    {
      id: "svc-construction", published: true, icon: "building", title: "Construction Works",
      text: "Houses, shops and other buildings, from the first plan to the final finishing.",
      more: "Tell us about your plot, what you want to build and when you would like to start. We will talk through the work with you and explain each step before anything is agreed.",
    },
    {
      id: "svc-supplies", published: true, icon: "truck", title: "Construction Supplies",
      text: "Building materials for your site. Tell us what you need and we will confirm the price.",
      more: "Tell us what you need, how much, and where it should go. We will check what is available, give you the price, and arrange the supply.",
    },
    {
      id: "svc-renovation", published: true, icon: "home", title: "Renovation & Improvement",
      text: "Repairs and improvements to an existing house or building.",
      more: "Tell us what needs fixing or changing, and send a few photos if you can. We will look at it with you and suggest what to do.",
    },
    {
      id: "svc-coordination", published: true, icon: "clipboard", title: "Project Coordination",
      text: "Help with planning the work, the materials and the schedule.",
      more: "Already have drawings or a plan, but need someone to organise the work? Tell us where you are and we will help keep everything on schedule.",
    },
  ],
  faqs: [
    {
      id: "faq-quote", published: true, question: "How do I get a quotation?",
      answer: "Call us, message us on WhatsApp, or fill in the form on this page. Tell us where the work is, what you need and when. We will get back to you with what happens next, such as a site visit or a price.",
    },
    {
      id: "faq-supplies", published: true, question: "What should I tell you when I ask about materials?",
      answer: "Which materials, how much of each, where they should go and when you need them. Stock and prices change, so we confirm them for each order.",
    },
    {
      id: "faq-visit", published: true, question: "Can I come to your office?",
      answer: "Yes, please do. Our address is on this page. It is best to call first, so we know you are coming and someone is there to meet you.",
    },
  ],
};

// ---------- Links made from the details (so each number is written only once) ----------
export function phoneLink(s: Settings) {
  return "tel:" + s.phone.replace(/[^+\d]/g, "");
}
export function whatsappLink(s: Settings) {
  return "https://wa.me/" + (s.whatsapp || s.phone).replace(/\D/g, "");
}
export function mapLink(s: Settings) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.address);
}
export function mapEmbed(s: Settings) {
  return "https://www.google.com/maps?q=" + encodeURIComponent(s.address) + "&output=embed";
}
export function emails(s: Settings) {
  return [s.email1, s.email2].filter(Boolean);
}
export function socialLinks(s: Settings) {
  return [
    { name: "Facebook", icon: "facebook", href: s.facebook },
    { name: "Instagram", icon: "instagram", href: s.instagram },
    { name: "TikTok", icon: "tiktok", href: s.tiktok },
    { name: "YouTube", icon: "youtube", href: s.youtube },
  ].filter((link) => link.href);
}
export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ============================================================
//  NOT in admin - edit here
// ============================================================

// Options in the contact form's drop-down list
export const enquiryTypes = [
  "Construction works",
  "Construction supplies",
  "Renovation or improvement",
  "Job application",
  "Other / not sure yet",
];

// Home page: the 3 steps
export const steps = [
  { title: "Tell us what you need", text: "Call us, message us or fill in the form. Tell us what you want to do, where, and anything else you already know." },
  { title: "We talk it through", text: "We go over the work, the quantities and the timing with you, and answer your questions." },
  { title: "You get a clear next step", text: "We tell you what happens next, whether that is a site visit, a price or a plan." },
];

// Home page: short points next to "about us"
export const highlights = [
  "Construction and building materials from one company",
  "A local team in Janakpurdham you can call or visit",
  "We explain things clearly and keep you updated",
];

// About page: "How we work"
export const values = [
  { title: "We listen first", text: "We start by understanding what you need, where it is, and what you want at the end." },
  { title: "We agree the details", text: "The work and the materials are talked through properly before anything starts." },
  { title: "We stay in touch", text: "You can reach us easily, and we tell you what is happening and what comes next." },
];
