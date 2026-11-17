/**
 * Expertise areas shown on the panel form. Must match the rows inserted by
 * db/migrations/0002_reference_data.sql; a test checks they agree. To add an
 * area, add a migration and update this list.
 */
export const EXPERTISE_AREAS = [
  { slug: "banking-finance", label: "Banking and finance" },
  { slug: "consumer-retail", label: "Consumer and retail" },
  { slug: "corporate-strategy", label: "Corporate strategy" },
  { slug: "energy", label: "Energy and infrastructure" },
  { slug: "healthcare", label: "Healthcare and life sciences" },
  { slug: "industrials", label: "Industrials and manufacturing" },
  { slug: "mergers-acquisitions", label: "Mergers and acquisitions" },
  { slug: "private-equity", label: "Private equity" },
  { slug: "regulation-policy", label: "Regulation and public policy" },
  { slug: "go-to-market", label: "Sales, marketing and go-to-market" },
  { slug: "supply-chain", label: "Supply chain and operations" },
  { slug: "technology", label: "Technology and software" },
] as const;
