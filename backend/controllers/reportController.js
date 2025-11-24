// backend/reportController.js
import pool from "../db.js";
import PDFDocument from "pdfkit";

/** Utility: read requested format */
function getFormat(req) {
  return (req.query.format || "json").toLowerCase();
}

/** Utility: send CSV */
function sendCsv(res, filename, headerCols, rows, mapRow) {
  const header = headerCols.join(",") + "\n";
  const lines = rows.map(mapRow).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.send(header + lines + "\n");
}

/* ============================================================
   VOLUNTEER REPORT
   GET /api/reports/volunteers?format=json|csv|pdf
============================================================ */
export const getVolunteerReport = async (req, res) => {
  const format = getFormat(req);

  try {
    const [rows] = await pool.query(`
      SELECT
        u.id AS user_id,
        u.email AS user_email,
        u.display_name AS user_display_name,
        u.role AS user_role,
        up.full_name AS volunteer_full_name,
        up.city AS volunteer_city,
        up.state AS volunteer_state,
        up.zipcode AS volunteer_zipcode,
        up.skills AS volunteer_skills,
        h.log_id AS log_id,
        h.event_description AS event_description,
        h.hours AS hours,
        h.status AS status,
        h.volunteer_date AS volunteer_date,
        h.timestamp AS log_timestamp
      FROM users u
      LEFT JOIN UserProfile up ON up.user_id = u.id
      LEFT JOIN VolunteerHistory h ON h.user_id = u.id
      WHERE u.role = 'volunteer'
      ORDER BY u.display_name, h.volunteer_date DESC, h.log_id DESC
    `);

    /* -------- JSON -------- */
    if (format === "json") return res.json({ data: rows });

    /* -------- CSV -------- */
    if (format === "csv") {
      const header = [
        "user_id",
        "user_email",
        "user_display_name",
        "volunteer_full_name",
        "volunteer_city",
        "volunteer_state",
        "volunteer_zipcode",
        "volunteer_skills",
        "log_id",
        "event_description",
        "hours",
        "status",
        "volunteer_date",
        "log_timestamp",
      ];

      return sendCsv(
        res,
        "volunteer_report.csv",
        header,
        rows,
        (r) =>
          [
            r.user_id,
            r.user_email,
            (r.user_display_name || "").replace(/,/g, " "),
            (r.volunteer_full_name || "").replace(/,/g, " "),
            (r.volunteer_city || "").replace(/,/g, " "),
            r.volunteer_state || "",
            r.volunteer_zipcode || "",
            r.volunteer_skills ? JSON.stringify(r.volunteer_skills).replace(/,/g, ";") : "",
            r.log_id || "",
            (r.event_description || "").replace(/,/g, " "),
            r.hours || "",
            r.status || "",
            r.volunteer_date || "",
            r.log_timestamp
              ? new Date(r.log_timestamp).toISOString()
              : "",
          ].join(",")
      );
    }

    /* -------- PDF -------- */
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="volunteer_report.pdf"'
    );

    doc.pipe(res);

    doc.fontSize(18).text("Volunteer Participation Report", { align: "center" });
    doc.moveDown();

    let currentVolunteer = null;

    rows.forEach((row) => {
      const key = row.user_id;
      const volunteerName = row.volunteer_full_name || row.user_display_name || "(Unnamed Volunteer)";

      if (key !== currentVolunteer) {
        currentVolunteer = key;
        doc.moveDown();
        doc.fontSize(14).text(volunteerName);
        doc.fontSize(10).text(`Email: ${row.user_email || "N/A"}`);
        doc.fontSize(10).text(`City: ${row.volunteer_city || "N/A"}, ${row.volunteer_state || "N/A"}`);
        doc.fontSize(10).text(`Zipcode: ${row.volunteer_zipcode || "N/A"}`);
        
        // Parse and display skills
        if (row.volunteer_skills) {
          try {
            const skills = typeof row.volunteer_skills === 'string' 
              ? JSON.parse(row.volunteer_skills) 
              : row.volunteer_skills;
            if (Array.isArray(skills) && skills.length > 0) {
              doc.fontSize(10).text(`Skills: ${skills.join(", ")}`);
            }
          } catch (e) {
            // Skip if skills parsing fails
          }
        }
        
        doc.moveDown(0.3);
        doc.fontSize(11).text("Participation History:");
      }

      if (!row.log_id) {
        if (key !== currentVolunteer - 1) {
          doc.fontSize(10).text("  No participation history recorded yet.");
        }
        return;
      }

      const dateLabel = row.volunteer_date
        ? new Date(row.volunteer_date).toLocaleDateString()
        : "N/A";

      const hoursLabel =
        row.hours != null ? `${row.hours} hour(s)` : "N/A";

      doc
        .fontSize(10)
        .text(
          `- ${dateLabel} | ${row.event_description || "No description"} | Hours: ${hoursLabel} | Status: ${row.status}`
        );
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to generate volunteer report",
      details: err.message,
    });
  }
};

/* ============================================================
   EVENT REPORT
   GET /api/reports/events?format=json|csv|pdf
============================================================ */
export const getEventReport = async (req, res) => {
  const format = getFormat(req);

  try {
    const [rows] = await pool.query(`
      SELECT
        e.id AS event_id,
        e.name AS event_name,
        e.description AS event_description,
        e.date AS event_date,
        e.location AS event_location,
        e.capacity AS event_capacity,
        e.created_by AS created_by_user_id,
        creator.display_name AS created_by_name,
        v.id AS volunteer_id,
        v.name AS volunteer_name,
        v.email AS volunteer_email,
        v.phone AS volunteer_phone,
        h.log_id AS log_id,
        h.hours AS hours,
        h.status AS status,
        h.volunteer_date AS volunteer_date
      FROM events e
      LEFT JOIN users creator ON e.created_by = creator.id
      LEFT JOIN VolunteerHistory h
        ON h.event_description COLLATE utf8mb4_unicode_ci =
           e.name COLLATE utf8mb4_unicode_ci
      LEFT JOIN volunteers v ON v.user_id = h.user_id
      ORDER BY e.date, e.name, volunteer_name, h.volunteer_date
    `);

    /* -------- JSON -------- */
    if (format === "json") return res.json({ data: rows });

    /* -------- CSV -------- */
    if (format === "csv") {
      const header = [
        "event_id",
        "event_name",
        "event_description",
        "event_date",
        "event_location",
        "event_capacity",
        "created_by_user_id",
        "created_by_name",
        "volunteer_id",
        "volunteer_name",
        "volunteer_email",
        "volunteer_phone",
        "log_id",
        "hours",
        "status",
        "volunteer_date",
      ];

      return sendCsv(
        res,
        "event_report.csv",
        header,
        rows,
        (r) =>
          [
            r.event_id,
            (r.event_name || "").replace(/,/g, " "),
            (r.event_description || "").replace(/,/g, " "),
            r.event_date,
            (r.event_location || "").replace(/,/g, " "),
            r.event_capacity,
            r.created_by_user_id,
            (r.created_by_name || "").replace(/,/g, " "),
            r.volunteer_id,
            (r.volunteer_name || "").replace(/,/g, " "),
            r.volunteer_email,
            r.volunteer_phone,
            r.log_id,
            r.hours,
            r.status,
            r.volunteer_date,
          ].join(",")
      );
    }

    /* -------- PDF -------- */
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="event_report.pdf"'
    );

    doc.pipe(res);

    doc.fontSize(18).text("Event & Volunteer Assignment Report", {
      align: "center",
    });
    doc.moveDown();

    let currentEvent = null;

    rows.forEach((row) => {
      if (row.event_id !== currentEvent) {
        currentEvent = row.event_id;
        const dateLabel = row.event_date
          ? new Date(row.event_date).toLocaleDateString()
          : "N/A";

        doc.moveDown();
        doc.fontSize(14).text(`${row.event_name} (${dateLabel})`);
        doc.fontSize(10).text(`Location: ${row.event_location}`);
        doc.fontSize(10).text(`Description: ${row.event_description}`);
        doc.fontSize(10).text(`Created by: ${row.created_by_name}`);
        doc.moveDown(0.3);
        doc.fontSize(11).text("Volunteers:");
      }

      if (!row.volunteer_id) return;

      const hoursLabel =
        row.hours != null ? `${row.hours} hr(s)` : "N/A";

      const dateLabel = row.volunteer_date
        ? new Date(row.volunteer_date).toLocaleDateString()
        : "N/A";

      doc
        .fontSize(10)
        .text(
          `- ${row.volunteer_name} | Email: ${row.volunteer_email} | Phone: ${row.volunteer_phone} | Date: ${dateLabel} | Hours: ${hoursLabel} | Status: ${row.status}`
        );
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to generate event report",
      details: err.message,
    });
  }
};