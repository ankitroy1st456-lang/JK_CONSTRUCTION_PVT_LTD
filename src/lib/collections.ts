// ============================================================
//  THE LIST OF EVERYTHING THE ADMIN CAN MANAGE
//
//  Each section (Projects, News, Documents ...) is described here by
//  its fields. The admin forms AND the safety checks are built from
//  this list, so to ADD A FIELD to a section you only add one line here
//  (then show it on the public page).
//
//  Field types:
//    text      one line of text         textarea  several lines
//    select    pick from "options"      date      a calendar date
//    image     one photo                images    several photos
//    file      a document (PDF, Word, Excel)
//    url       a web link starting with https://
// ============================================================

export type FieldType = "text" | "textarea" | "select" | "date" | "image" | "images" | "file" | "url";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for "select"
  help?: string; // small grey hint under the field
  wide?: boolean; // takes the full width of the form
};

export type Collection = {
  key: string; // name used in the data file
  label: string; // tab name in admin
  singular: string; // "project", "document" ...
  titleKey: string; // which field is shown as the item's name in the list
  help: string; // sentence shown at the top of the tab
  sortable?: boolean; // show up/down arrows (order matters)
  fields: Field[];
};

// What the public site shows is only items with "Published" ticked.

export const collections: Collection[] = [
  {
    key: "projects",
    label: "Projects",
    singular: "project",
    titleKey: "title",
    help: "Your finished and ongoing work. Add a cover photo and more photos for the gallery.",
    fields: [
      { key: "title", label: "Project name", type: "text" },
      { key: "category", label: "Type", type: "select", options: ["Residential", "Commercial", "Renovation", "Infrastructure", "Other"] },
      { key: "status", label: "Status", type: "select", options: ["Completed", "Ongoing"] },
      { key: "location", label: "Location", type: "text" },
      { key: "year", label: "Year", type: "text", help: "e.g. 2024" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "image", label: "Cover photo", type: "image", wide: true },
      { key: "images", label: "More photos (gallery)", type: "images", wide: true },
    ],
  },
  {
    key: "products",
    label: "Supplies",
    singular: "supply item",
    titleKey: "title",
    help: "Building materials you sell. Leave the price empty to show “Price on request”.",
    fields: [
      { key: "title", label: "Item name", type: "text" },
      { key: "category", label: "Category", type: "text", help: "e.g. Cement, Steel, Bricks, Sand" },
      { key: "unit", label: "Unit", type: "text", help: "e.g. per bag, per kg, per truck" },
      { key: "price", label: "Price", type: "text", help: "e.g. Rs. 1,250. Leave empty for “Price on request”" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "image", label: "Photo", type: "image", wide: true },
    ],
  },
  {
    key: "services",
    label: "Services",
    singular: "service",
    titleKey: "title",
    sortable: true,
    help: "The services shown on the home page and the Services page. Use the arrows to change the order.",
    fields: [
      { key: "title", label: "Service name", type: "text" },
      { key: "icon", label: "Icon", type: "select", options: ["building", "truck", "home", "clipboard", "ruler", "users"] },
      { key: "text", label: "Short line (home page)", type: "textarea", wide: true },
      { key: "more", label: "Full description (Services page)", type: "textarea", wide: true },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    titleKey: "name",
    help: "What clients say about you. Only add real feedback, with the client's permission.",
    fields: [
      { key: "name", label: "Client name", type: "text" },
      { key: "role", label: "Role / place", type: "text", help: "e.g. House owner, Janakpur" },
      { key: "quote", label: "Their words", type: "textarea", wide: true },
      { key: "image", label: "Photo (optional)", type: "image" },
    ],
  },
  {
    key: "team",
    label: "Team",
    singular: "team member",
    titleKey: "name",
    sortable: true,
    help: "Directors, engineers and key staff shown on the About page.",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "position", label: "Position", type: "text" },
      { key: "bio", label: "Short bio", type: "textarea", wide: true },
      { key: "image", label: "Photo", type: "image" },
    ],
  },
  {
    key: "equipment",
    label: "Equipment",
    singular: "equipment item",
    titleKey: "title",
    help: "Machines and vehicles you own (mixers, excavators, trucks...). Shown on the About page.",
    fields: [
      { key: "title", label: "Name", type: "text" },
      { key: "quantity", label: "How many", type: "text" },
      { key: "description", label: "Details", type: "textarea", wide: true },
      { key: "image", label: "Photo", type: "image" },
    ],
  },
  {
    key: "partners",
    label: "Clients & Partners",
    singular: "client / partner",
    titleKey: "name",
    help: "Logos of clients, suppliers or partners you work with (shown on the home page).",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "image", label: "Logo", type: "image" },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    singular: "document",
    titleKey: "title",
    help: "Certificates, company profile, brochures, price lists, blueprints. Visitors can open or download them on the Downloads page.",
    fields: [
      { key: "title", label: "Document name", type: "text" },
      { key: "category", label: "Type", type: "select", options: ["Certificate", "Company profile", "Brochure", "Price list", "Blueprint", "Other"] },
      { key: "description", label: "Short note", type: "text", wide: true },
      { key: "file", label: "File (PDF, Word, Excel or DWG/DXF drawing, up to 20 MB)", type: "file", wide: true },
    ],
  },
  {
    key: "news",
    label: "News",
    singular: "news post",
    titleKey: "title",
    help: "Updates about your work, new projects or announcements.",
    fields: [
      { key: "title", label: "Headline", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "summary", label: "Short summary", type: "textarea", wide: true },
      { key: "body", label: "Full story", type: "textarea", wide: true },
      { key: "image", label: "Photo", type: "image", wide: true },
    ],
  },
  {
    key: "faqs",
    label: "FAQs",
    singular: "question",
    titleKey: "question",
    sortable: true,
    help: "Common questions and answers, shown on the Contact page.",
    fields: [
      { key: "question", label: "Question", type: "text", wide: true },
      { key: "answer", label: "Answer", type: "textarea", wide: true },
    ],
  },
  {
    key: "jobs",
    label: "Careers",
    singular: "job",
    titleKey: "title",
    help: "Open positions. The Careers page appears in the menu only when at least one job is published.",
    fields: [
      { key: "title", label: "Job title", type: "text" },
      { key: "jobType", label: "Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"] },
      { key: "location", label: "Location", type: "text" },
      { key: "deadline", label: "Apply by", type: "date" },
      { key: "description", label: "Details", type: "textarea", wide: true },
    ],
  },
];

// ---------- Settings: company details, home banner, about text ... ----------
// One form, split into boxes. Values are all plain text.
export type SettingsGroup = { title: string; help?: string; fields: Field[] };

export const settingsGroups: SettingsGroup[] = [
  {
    title: "Company details",
    fields: [
      { key: "name", label: "Full company name", type: "text" },
      { key: "shortName", label: "Short name", type: "text" },
      { key: "slogan", label: "Slogan", type: "text" },
      { key: "registrationNumber", label: "Registration number", type: "text" },
      { key: "panNumber", label: "PAN / VAT number", type: "text" },
      { key: "established", label: "Year established", type: "text", help: "e.g. 2019" },
      { key: "address", label: "Address", type: "text", wide: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "whatsapp", label: "WhatsApp number", type: "text", help: "Leave empty to use the phone number" },
      { key: "email1", label: "Email", type: "text" },
      { key: "email2", label: "Second email (optional)", type: "text" },
      { key: "hours", label: "Working hours", type: "text", help: "e.g. Sun–Fri, 9:00 AM – 6:00 PM" },
      { key: "url", label: "Website address", type: "url", help: "e.g. https://www.jkconstruction.com.np" },
    ],
  },
  {
    title: "Social media",
    help: "Paste the full link (starting with https://). Empty ones are not shown.",
    fields: [
      { key: "facebook", label: "Facebook", type: "url" },
      { key: "instagram", label: "Instagram", type: "url" },
      { key: "tiktok", label: "TikTok", type: "url" },
      { key: "youtube", label: "YouTube", type: "url" },
    ],
  },
  {
    title: "Home page banner",
    fields: [
      { key: "heroLabel", label: "Small label", type: "text" },
      { key: "heroTitleTop", label: "Headline (white)", type: "text" },
      { key: "heroTitleAccent", label: "Headline (red)", type: "text" },
      { key: "heroText", label: "Text under the headline", type: "textarea", wide: true },
      { key: "heroImage", label: "Banner photo (optional)", type: "image", wide: true, help: "A real photo of your work replaces the drawing. Wide photos work best." },
    ],
  },
  {
    title: "Numbers on the home page",
    help: "Only enter numbers that are true, for example “120+” and “Projects completed”. Empty boxes are hidden.",
    fields: [
      { key: "stat1Number", label: "Number 1", type: "text" },
      { key: "stat1Label", label: "Label 1", type: "text" },
      { key: "stat2Number", label: "Number 2", type: "text" },
      { key: "stat2Label", label: "Label 2", type: "text" },
      { key: "stat3Number", label: "Number 3", type: "text" },
      { key: "stat3Label", label: "Label 3", type: "text" },
      { key: "stat4Number", label: "Number 4", type: "text" },
      { key: "stat4Label", label: "Label 4", type: "text" },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "aboutIntro", label: "First paragraph", type: "textarea", wide: true },
      { key: "aboutSecond", label: "Second paragraph", type: "textarea", wide: true },
      { key: "aboutImage", label: "Photo (optional)", type: "image", wide: true, help: "Office, site or team photo. If empty, the logo is shown." },
      { key: "mission", label: "Our mission", type: "textarea", wide: true },
      { key: "vision", label: "Our vision", type: "textarea", wide: true },
    ],
  },
  {
    title: "Message from the director / owner",
    help: "Shown on the About page when the message is filled in.",
    fields: [
      { key: "directorName", label: "Name", type: "text" },
      { key: "directorRole", label: "Position", type: "text" },
      { key: "directorMessage", label: "Message", type: "textarea", wide: true },
      { key: "directorImage", label: "Photo", type: "image" },
    ],
  },
  {
    title: "Google & sharing",
    fields: [
      { key: "metaDescription", label: "Short description for Google", type: "textarea", wide: true, help: "One or two sentences. Shown under your name in search results." },
    ],
  },
];

export const allSettingsFields: Field[] = settingsGroups.flatMap((group) => group.fields);
