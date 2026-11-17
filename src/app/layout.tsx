import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Wix_Madefor_Display } from "next/font/google";
import { site } from "@/content/site";
import { COLOR_BENDS, THEME } from "@/theme";
import { ColorBendsBackdrop } from "@/components/visuals/ColorBendsBackdrop";
import { Preloader } from "@/components/layout/Preloader";
import { StarParticles } from "@/components/visuals/StarParticles";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import { ModeToggle } from "@/components/layout/ModeToggle";
import "./globals.css";

/* The reference template's typeface. It has no italic; like the reference, italics are synthesized. */
const sans = Wix_Madefor_Display({
  variable: "--font-wix",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0c",
  colorScheme: "dark",
  viewportFit: "cover", // lets the fixed light / dark button sit inside the phone's safe area
};

/**
 * Runs before first paint (like Webflow's `w-mod-js` script):
 *  - adds `js-motion` unless reduced motion is on, so hidden start states never flash;
 *    a 4s failsafe removes it if the motion runtime never starts, so content can't stay hidden;
 *  - adds `no-preloader` on repeat visits in the same session, or under reduced motion.
 * The operator desk (/operators) is a working tool: no preloader and no scroll motion there.
 */
const bootScript = `(function(){try{var d=document.documentElement;try{var m=localStorage.getItem('phronem-mode');if(m==='light'||m==='dark'){d.dataset.mode=m}}catch(e){}var op=location.pathname.indexOf('/operators')===0;if(op){d.classList.add('no-preloader');return}var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r){d.classList.add('js-motion');setTimeout(function(){if(!d.classList.contains('motion-ready')){d.classList.remove('js-motion')}},4000)}var seen=false;try{seen=sessionStorage.getItem('phronem-preloaded')==='1';sessionStorage.setItem('phronem-preloaded','1')}catch(e){}if(r||seen){d.classList.add('no-preloader')}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={THEME} data-mode="dark" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="grain">
        <a
          href="#main"
          data-native-anchor
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-button focus:px-4 focus:py-2 focus:text-ink"
          style={{ zIndex: "var(--z-skip)" }}
        >
          Skip to content
        </a>
        <Preloader />
        {COLOR_BENDS && <ColorBendsBackdrop />}
        <StarParticles />
        {children}
        <ModeToggle />
        <MotionRuntime />
      </body>
    </html>
  );
}
