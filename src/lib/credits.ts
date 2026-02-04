export const CREDIT_COSTS = {
  PROMPT_GENERATION: 1,
  STYLE_TRANSFER: 2,
} as const;

export type CreditCostType = keyof typeof CREDIT_COSTS;

export function getCreditCost(generationType: "prompt" | "style-reference"): number {
  return generationType === "prompt" 
    ? CREDIT_COSTS.PROMPT_GENERATION 
    : CREDIT_COSTS.STYLE_TRANSFER;
}
