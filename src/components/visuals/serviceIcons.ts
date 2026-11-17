import {
  Binoculars,
  ChartLineUp,
  FileText,
  Gavel,
  Handshake,
  Scales,
  Stethoscope,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

/** One Phosphor icon per service, used on cards, menus and service pages. */
export const serviceIcons: Record<string, Icon> = {
  "decision-confidence-records": FileText,
  "expert-judgment-panels": UsersThree,
  "in-person-meetings": Handshake,
  "expert-witness": Gavel,
  "healthcare-professional-recruitment": Stethoscope,
  "opposing-case-review": Scales,
  "assumption-monitoring": Binoculars,
  "outcome-tracking": ChartLineUp,
};
