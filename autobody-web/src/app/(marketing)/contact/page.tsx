"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/marketing/reveal";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setName("");
    setEmail("");
    setPhone("");
    setVehicle("");
    setMessage("");
  };

  return (
    <>
      <section className="bg-[#0d1016] py-16 text-white">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#ef3434]">
              Contact
            </p>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
              Get a <span className="text-[#ef3434]">Quote.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/65">
              Send your VIN, photos, or vehicle details and we&apos;ll come back with fitment,
              pricing, and delivery — usually within the hour.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f4f5f9] py-14">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-5 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <Reveal>
            <form onSubmit={submit} className="bg-white p-6 sm:p-8">
              <h2 className="font-display text-2xl uppercase">Send a request</h2>
              <p className="mt-1 text-sm text-[#6b6f7a]">
                Quote-assisted ordering — fitment is confirmed before payment.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="contact-input" />
                </Field>
                <Field label="Phone / WhatsApp">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="contact-input" />
                </Field>
                <Field label="Email" wide>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="contact-input"
                  />
                </Field>
                <Field label="Vehicle (make, model, year)" wide>
                  <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="contact-input" />
                </Field>
                <Field label="What part do you need?" wide>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Include side, condition preference (new/used/OEM), VIN if you have it…"
                    className="contact-input"
                  />
                </Field>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="mt-6 bg-[#ef3434] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#f04444]"
              >
                Send Request
              </motion.button>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-xs text-[#ef3434]"
                >
                  Thanks — we will be in touch shortly.
                </motion.p>
              )}
            </form>
          </Reveal>

          <Reveal variant="slideRight">
            <aside className="space-y-4">
              <div className="bg-[#0d1016] p-6 text-white">
                <h3 className="font-display text-xl uppercase">Workshop</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Pretoria, Gauteng
                  <br />
                  South Africa
                </p>
                <div className="mt-5 grid gap-2 text-sm">
                  <a href="tel:0129437437" className="text-white hover:text-[#ef3434]">
                    Tel: 012 943 7437
                  </a>
                  <a href="https://wa.me/27741945672" className="text-white hover:text-[#ef3434]">
                    WhatsApp: 074 194 5672
                  </a>
                  <a
                    href="mailto:ferreirasautobodyparts@gmail.com"
                    className="text-white hover:text-[#ef3434] break-all"
                  >
                    ferreirasautobodyparts@gmail.com
                  </a>
                </div>
              </div>

              <div className="bg-white p-6">
                <h3 className="font-display text-xl uppercase">Hours</h3>
                <ul className="mt-3 space-y-1 text-sm text-[#4f5360]">
                  <li className="flex justify-between">
                    <span>Mon – Fri</span>
                    <span>08:00 – 17:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span>08:00 – 13:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-[#9ea2ab]">Closed</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#ef3434] p-6 text-white">
                <h3 className="font-display text-xl uppercase">Need it fast?</h3>
                <p className="mt-2 text-sm text-white/85">
                  Same-day Gauteng delivery on stock items. Browse the catalog to check
                  availability.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block bg-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0d1016] hover:bg-[#0d1016] hover:text-white transition"
                >
                  Browse Catalog
                </Link>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <style jsx global>{`
        .contact-input {
          width: 100%;
          height: 2.75rem;
          border: 1px solid #dedede;
          background: white;
          padding: 0 0.75rem;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .contact-input:focus {
          border-color: #ef3434;
        }
        textarea.contact-input {
          height: auto;
          padding: 0.625rem 0.75rem;
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b6f7a]">
        {label}
      </span>
      {children}
    </label>
  );
}
