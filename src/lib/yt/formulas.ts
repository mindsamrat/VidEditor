// The 21 hook formulas, read straight from the vendored yt-script skill so the
// console and the Claude Code skills can never drift apart.
import data from "../../../.claude/skills/yt-script/hooks.json";

export type Formula = {
  id: string;
  name: string;
  shape: string;
  example: string;
  fails_when: string;
  match: string[];
};

export const FORMULAS: Formula[] = data.hooks;
export const HOOK_RULES: string[] = data.rules;

const COMPILED = FORMULAS.map((f) => ({ f, res: f.match.map((p) => new RegExp(p, "i")) }));

export function formulaHits(text: string) {
  return COMPILED.map(({ f, res }) => ({ f, n: res.filter((r) => r.test(text)).length }));
}
