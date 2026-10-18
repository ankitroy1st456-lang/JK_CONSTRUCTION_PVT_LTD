// The shapes of the data saved by the admin page.

// One entry in any list (a project, a document, a news post ...).
// The fields depend on the section - see collections.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item = { id: string; published: boolean; [field: string]: any };

// Company details and page text (every value is plain text)
export type Settings = Record<string, string>;

export type AppData = {
  settings: Settings;
  lists: Record<string, Item[]>; // lists.projects, lists.news ...
  version?: number; // goes up by 1 on every save (see saveData in store.ts)
};

export type EnquiryStatus = "new" | "in-progress" | "closed";

export type Enquiry = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  message: string;
  status: EnquiryStatus;
};
