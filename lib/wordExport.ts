import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "@/types/resume";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HR = () =>
  new Paragraph({
    border: {
      bottom: {
        color: "000000",
        style: BorderStyle.SINGLE,
        size: 6,
        space: 1,
      },
    },
    spacing: { after: 80 },
  });

const sectionHeading = (text: string) =>
  new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 20,
        font: "Calibri",
      }),
    ],
    border: {
      bottom: {
        color: "444444",
        style: BorderStyle.SINGLE,
        size: 4,
        space: 1,
      },
    },
    spacing: { before: 200, after: 100 },
  });

const bullet = (text: string, size = 18) =>
  new Paragraph({
    children: [new TextRun({ text: `\u2022 ${text}`, size, font: "Calibri" })],
    spacing: { after: 40 },
    indent: { left: 360 },
  });

const body = (text: string, size = 18) =>
  new Paragraph({
    children: [new TextRun({ text, size, font: "Calibri" })],
    spacing: { after: 60 },
  });

const splitBullets = (text: string): string[] => {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((l) => l.trim().replace(/^[-\u2022*]\s*/, ""))
    .filter((l) => l.length > 0);
};

// ─── Main export function ────────────────────────────────────────────────────

export async function downloadAsWord(data: ResumeData): Promise<void> {
  const {
    personalInfo,
    targetRole,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
  } = data;

  const children: Paragraph[] = [];

  // ── Header ──────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personalInfo.fullName || "Your Name",
          bold: true,
          size: 36,
          font: "Calibri",
        }),
      ],
      spacing: { after: 60 },
    })
  );

  if (targetRole) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: targetRole,
            bold: true,
            size: 22,
            font: "Calibri",
            color: "444444",
          }),
        ],
        spacing: { after: 60 },
      })
    );
  }

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: contactParts.join("  \u2022  "),
            size: 18,
            font: "Calibri",
            color: "555555",
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  children.push(HR());

  // ── Professional Summary ──────────────────────────────────────────────────
  if (summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(body(summary));
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  if (skills && skills.length > 0) {
    children.push(sectionHeading("Technical Skills"));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Core Competencies: ",
            bold: true,
            size: 18,
            font: "Calibri",
          }),
          new TextRun({ text: skills.join(", "), size: 18, font: "Calibri" }),
        ],
        spacing: { after: 60 },
      })
    );
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (experience && experience.length > 0) {
    children.push(sectionHeading("Professional Experience"));
    for (const exp of experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title || "",
              bold: true,
              size: 20,
              font: "Calibri",
            }),
            exp.company
              ? new TextRun({
                  text: `  \u2014  ${exp.company}`,
                  size: 18,
                  font: "Calibri",
                  color: "333333",
                })
              : new TextRun(""),
          ],
          spacing: { after: 40 },
        })
      );
      if (exp.duration) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.duration,
                size: 17,
                italics: true,
                font: "Calibri",
                color: "666666",
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }
      for (const line of splitBullets(exp.description)) {
        children.push(bullet(line));
      }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (education && education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const edu of education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || "",
              bold: true,
              size: 19,
              font: "Calibri",
            }),
            edu.institution
              ? new TextRun({
                  text: `  \u2014  ${edu.institution}`,
                  size: 18,
                  font: "Calibri",
                })
              : new TextRun(""),
            edu.year
              ? new TextRun({
                  text: `  (${edu.year})`,
                  size: 17,
                  italics: true,
                  font: "Calibri",
                  color: "666666",
                })
              : new TextRun(""),
          ],
          spacing: { after: 80 },
        })
      );
    }
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (projects && projects.length > 0) {
    children.push(sectionHeading("Projects"));
    for (const proj of projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.title || "",
              bold: true,
              size: 19,
              font: "Calibri",
            }),
            proj.technologies
              ? new TextRun({
                  text: `  |  ${proj.technologies}`,
                  size: 17,
                  italics: true,
                  font: "Calibri",
                  color: "555555",
                })
              : new TextRun(""),
          ],
          spacing: { after: 40 },
        })
      );
      for (const line of splitBullets(proj.description)) {
        children.push(bullet(line));
      }
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (certifications && certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const cert of certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `\u2022 ${cert.name}`,
              size: 18,
              font: "Calibri",
            }),
            cert.issuer
              ? new TextRun({
                  text: `  \u2014  ${cert.issuer}`,
                  size: 17,
                  italics: true,
                  font: "Calibri",
                  color: "666666",
                })
              : new TextRun(""),
          ],
          spacing: { after: 50 },
          indent: { left: 360 },
        })
      );
    }
  }

  // ── Achievements ──────────────────────────────────────────────────────────
  if (achievements && achievements.length > 0) {
    children.push(sectionHeading("Achievements"));
    for (const ach of achievements) {
      children.push(bullet(ach.description));
    }
  }

  // ── Build & Download Document ─────────────────────────────────────────────
  const doc = new Document({
    creator: "ResumeGen",
    title: `${personalInfo.fullName || "Resume"} \u2013 Resume`,
    description: "Generated by ResumeGen",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 900,
              bottom: 720,
              left: 900,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(personalInfo.fullName || "Resume").replace(/\s+/g, "_")}_Resume.docx`;
  saveAs(blob, filename);
}
