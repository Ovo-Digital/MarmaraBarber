export class ShopifyUserError extends Error {
  constructor(
    message: string,
    public readonly field?: string[]
  ) {
    super(message);
    this.name = "ShopifyUserError";
  }
}

export function extractUserErrors(block: Record<string, unknown> | undefined): void {
  if (!block) return;
  const errors =
    (block.userErrors as { field?: string[]; message: string }[] | undefined) ??
    (block.customerUserErrors as { field?: string[]; message: string }[] | undefined) ??
    [];
  if (errors.length > 0) {
    throw new ShopifyUserError(errors.map((e) => e.message).join(", "), errors[0]?.field);
  }
}
