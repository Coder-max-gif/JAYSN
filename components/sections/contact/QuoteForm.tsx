"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gsap } from "@/lib/gsap";
import { EASE, DUR } from "@/lib/motion";
import { enquirySchema, type Enquiry } from "@/lib/enquirySchema";
import { COUNTRY_TO_REGION } from "@/lib/countries";
import { contact, PRODUCT_OPTIONS, SERVICE_OPTIONS, UNIT_OPTIONS, PACKAGING_OPTIONS } from "@/content/contact";
import { useStore } from "@/store/useStore";
import Button from "@/components/ui/Button";
import Fact from "@/components/ui/Fact";
import CountrySelect from "./CountrySelect";
import styles from "./QuoteForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; ref: string } | { kind: "error"; message: string };

const productParam = (v: string | null): Enquiry["product"] | undefined =>
  v === "fertilizer" || v === "cattle-feed" || v === "both" || v === "other" ? v : undefined;
const serviceParam = (v: string | null): Enquiry["service"] | undefined => (v === "import" || v === "export" ? v : undefined);

export function waLink(product?: string, service?: string) {
  const p = PRODUCT_OPTIONS.find((o) => o.value === product)?.label;
  const s = SERVICE_OPTIONS.find((o) => o.value === service)?.label;
  const extra = [s && `Service: ${s}.`, p && `Product: ${p}.`].filter(Boolean).join(" ");
  const text = `${contact.whatsappMessage}${extra ? ` ${extra}` : ""}`;
  return `https://wa.me/${contact.whatsapp.value}?text=${encodeURIComponent(text)}`;
}

function Success({ reference }: { reference: string }) {
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (!path.current || useStore.getState().reducedMotion) return;
    gsap.fromTo(path.current, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: DUR.xlarge, ease: EASE.inOut });
  }, []);
  return (
    <div className={styles.success}>
      <svg viewBox="0 0 120 120" className={styles.loop} aria-hidden="true">
        <path
          ref={path}
          d="M60 12 C 92 12, 108 36, 108 60 C 108 88, 86 108, 60 108 C 32 108, 12 86, 12 60 C 12 34, 34 12, 60 12 Z"
          pathLength={1}
        />
      </svg>
      <p className={styles.successTitle}>Enquiry received.</p>
      <p className={styles.successBody}>
        We will reply within <Fact f={contact.replyTime} /> with a price basis, packing options and a loading date. Keep
        this reference for any follow up.
      </p>
      <p className={styles.ref}>
        Reference <span>{reference}</span>
      </p>
    </div>
  );
}

export default function QuoteForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    formState: { errors },
  } = useForm<Enquiry>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      company: "",
      country: "",
      product: productParam(params.get("product")) ?? "fertilizer",
      service: serviceParam(params.get("service")) ?? "export",
      quantity: "",
      unit: UNIT_OPTIONS[0],
      packaging: "",
      email: "",
      whatsapp: "",
      message: "",
      website: "",
    },
    shouldFocusError: true,
  });

  const service = useWatch({ control, name: "service" });
  const product = useWatch({ control, name: "product" });
  const submitLabel = service === "export" ? "Get Export Quotation" : service === "import" ? "Request Import Quote" : "Send Enquiry";

  useEffect(() => () => useStore.getState().set({ contactRegion: null }), []);

  const onSubmit = async (data: Enquiry) => {
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; reference?: string; error?: string; fields?: Record<string, string[]> };
      if (!res.ok || !json.ok) {
        const firstField = json.fields && (Object.keys(json.fields)[0] as keyof Enquiry | undefined);
        if (firstField) setFocus(firstField);
        setStatus({ kind: "error", message: json.error ?? "The enquiry did not go through." });
        return;
      }
      setStatus({ kind: "done", ref: json.reference ?? "" });
      document.getElementById("quote")?.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch {
      setStatus({ kind: "error", message: "We could not reach the server. Check your connection." });
    }
  };

  if (status.kind === "done") {
    return (
      <div id="quote" aria-live="polite" className={styles.wrap}>
        <Success reference={status.ref} />
      </div>
    );
  }

  const err = (k: keyof Enquiry) => errors[k]?.message;

  return (
    <form id="quote" className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate aria-describedby="form-note">
      <p id="form-note" className={styles.note}>
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden">with an asterisk</span> are required. Give us an email or a WhatsApp number.
      </p>

      <fieldset className={styles.choices}>
        <legend className={styles.label}>Service *</legend>
        <div className={styles.segment}>
          {SERVICE_OPTIONS.map((o) => (
            <label key={o.value} className={styles.seg}>
              <input type="radio" value={o.value} {...register("service")} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.choices}>
        <legend className={styles.label}>Product *</legend>
        <div className={styles.segment}>
          {PRODUCT_OPTIONS.map((o) => (
            <label key={o.value} className={styles.seg}>
              <input type="radio" value={o.value} {...register("product")} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label htmlFor="f-name" className={styles.label}>
            Your name *
          </label>
          <input
            id="f-name"
            className={styles.input}
            autoComplete="name"
            aria-invalid={!!err("name")}
            aria-describedby={err("name") ? "e-name" : undefined}
            {...register("name")}
          />
          {err("name") && (
            <p id="e-name" className={styles.error}>
              {err("name")}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="f-company" className={styles.label}>
            Company name
          </label>
          <input id="f-company" className={styles.input} autoComplete="organization" {...register("company")} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="f-country" className={styles.label}>
          Country
        </label>
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <CountrySelect
              id="f-country"
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={(name, code) => {
                field.onChange(name);
                useStore.getState().set({ contactRegion: code ? (COUNTRY_TO_REGION[code] ?? null) : null });
              }}
            />
          )}
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label htmlFor="f-qty" className={styles.label}>
            Quantity
          </label>
          <input id="f-qty" className={styles.input} inputMode="decimal" {...register("quantity")} />
        </div>
        <div className={styles.field}>
          <label htmlFor="f-unit" className={styles.label}>
            Unit
          </label>
          <select id="f-unit" className={styles.input} {...register("unit")}>
            {UNIT_OPTIONS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="f-pack" className={styles.label}>
          Packaging requirement
        </label>
        <select id="f-pack" className={styles.input} {...register("packaging")}>
          <option value="">Choose packaging</option>
          {PACKAGING_OPTIONS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label htmlFor="f-email" className={styles.label}>
            Email *
          </label>
          <input
            id="f-email"
            type="email"
            className={styles.input}
            autoComplete="email"
            aria-invalid={!!err("email")}
            aria-describedby={err("email") ? "e-email" : undefined}
            {...register("email")}
          />
          {err("email") && (
            <p id="e-email" className={styles.error}>
              {err("email")}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="f-wa" className={styles.label}>
            or WhatsApp number *
          </label>
          <input
            id="f-wa"
            type="tel"
            className={styles.input}
            autoComplete="tel"
            aria-invalid={!!err("whatsapp")}
            aria-describedby={err("whatsapp") ? "e-wa" : undefined}
            {...register("whatsapp")}
          />
          {err("whatsapp") && (
            <p id="e-wa" className={styles.error}>
              {err("whatsapp")}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="f-msg" className={styles.label}>
          Message
        </label>
        <textarea id="f-msg" rows={4} className={`${styles.input} ${styles.textarea}`} {...register("message")} />
      </div>

      {/* Honeypot, hidden from people and assistive tech */}
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending" : submitLabel}
        </Button>
        <Button href={waLink(product, service)} external variant="quiet">
          WhatsApp instead
        </Button>
      </div>

      <div aria-live="assertive" className={styles.live}>
        {Object.keys(errors).length > 0 && <p className={styles.error}>Some fields need a look. The first one is focused.</p>}
        {status.kind === "error" && (
          <div className={styles.fail}>
            <p>{status.message} Your details are still in the form.</p>
            <p>
              You can also write to{" "}
              <a href={`mailto:${contact.email.value}`}>
                <Fact f={contact.email} />
              </a>{" "}
              or message us on{" "}
              <a href={waLink(product, service)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
