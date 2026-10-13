const rules = new Intl.PluralRules("en-US");

/**
 * Whole-string plurals through the locale's plural rules, so a count never gets bolted onto a
 * fragment. `count(3, { one: "# job", other: "# jobs" })` → "3 jobs".
 */
export function count(n: number, forms: { one: string; other: string }): string {
  const form = rules.select(n) === "one" ? forms.one : forms.other;
  return form.replace("#", n.toLocaleString("en-US"));
}
