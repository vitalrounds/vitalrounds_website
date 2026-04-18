import { NextResponse } from "next/server";

/**
 * Accepts wait list payload (survey + identity + optional files). Extend later with DB / email.
 */
export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") ?? "";

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const jsonRaw = form.get("json");
      if (typeof jsonRaw !== "string") {
        return NextResponse.json({ error: "Missing json field" }, { status: 400 });
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonRaw) as unknown;
      } catch {
        return NextResponse.json({ error: "Invalid json" }, { status: 400 });
      }

      const pickName = (key: string) =>
        form.get(key) instanceof File ? (form.get(key) as File).name : null;
      const fileNames = {
        cv: pickName("cv"),
        passport: pickName("passport"),
        degreeCertificate: pickName("degreeCertificate"),
        amcPart1: pickName("amcPart1"),
        englishTestReport: pickName("englishTestReport"),
        internshipCertificate: pickName("internshipCertificate"),
        visa: pickName("visa"),
      };

      console.info("[waitlist] multipart submission", {
        keys: parsed && typeof parsed === "object" ? Object.keys(parsed as object) : [],
        files: fileNames,
        at: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true });
    }

    const body = (await req.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.info("[waitlist] json submission", {
      keys: Object.keys(body as object),
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
