import type { Metadata } from "next";
import { contactPage } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Phronem",
  description: contactPage.lede,
};

/**
 * Contact, reached from the nav's Contact Us button. After IDR's contact page: three tabs
 * (Clients / Experts / Learn more) over one form asking for name, email, phone and the enquiry.
 * Submissions go to /api/contact.
 */
export default function ContactPage() {
  return (
    <>
      <PageHero title={contactPage.title} lede={contactPage.lede} />
      <section aria-label="Contact form" className="pb-24 md:pb-32">
        <Container>
          <div data-view="rise">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
