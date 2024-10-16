export type Action = "copyLink" | "delete" | "rename" | "download";

export type FileAction = {
  text: string;
  value: Action;
  icon: string;
};

export type FileActions = FileAction[];
