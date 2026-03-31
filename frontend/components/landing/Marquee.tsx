import { Marquee } from "@/components/ui/marquee"
import Image from "next/image"

const companies = [
  {
    name: "Midnight",
    url: "/midnight.png",
    className: "scale-110",
  },
  {
    name: "RiseIn",
    url: "/risein.png",
    className: "scale-95",
  },
  {
    name: "Github",
    url: "/github.png",
    className: "scale-90",
  },
  {
    name: "Vercel",
    url: "/vercel.png",
    className: "scale-75",
  },
]

export function Logos() {
  return (
    <section
      id="logos"
      className="relative w-full py-12 overflow-hidden bg-[radial-gradient(120%_130%_at_60%_0%,#5f2a7c_0%,#251236_45%,#10091a_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.14),transparent_35%)]" />

      <Marquee className="max-w-full [--duration:12s]">
        {companies.map((company, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center mx-16 h-24 w-60"
          >
            <Image
              width={240}
              height={100}
              src={company.url}
              alt={company.name}
              className={`object-contain h-full w-full [filter:brightness(0)_invert(1)] opacity-90 transition-all duration-300 hover:scale-105 hover:opacity-100 ${company.className}`}
            />
          </div>
        ))}
      </Marquee>
    </section>
  )
}