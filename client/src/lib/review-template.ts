/** Fills the review-request message from Settings. A missing project reads as "your project". */
export function fillReviewTemplate(template: string, values: { client: string; project?: string; studio: string }): string {
  return template
    .replaceAll("{client}", values.client)
    .replaceAll("{project}", values.project || "your project")
    .replaceAll("{studio}", values.studio);
}

export const TEMPLATE_PLACEHOLDERS = ["{client}", "{project}", "{studio}"] as const;
