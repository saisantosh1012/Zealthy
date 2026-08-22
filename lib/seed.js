// Seed data for the mini-EMR / Patient Portal.
// Dates are generated relative to "now" (instead of hard-coded past dates)
// so that a fresh deploy always has believable upcoming appointments and
// refills to show off the "next 7 days" views.

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function iso(date) {
  return date.toISOString();
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

const MEDICATIONS = [
  "Diovan",
  "Lexapro",
  "Metformin",
  "Ozempic",
  "Prozac",
  "Seroquel",
  "Tegretol",
];

const DOSAGES = [
  "1mg",
  "2mg",
  "3mg",
  "5mg",
  "10mg",
  "25mg",
  "50mg",
  "100mg",
  "250mg",
  "500mg",
  "1000mg",
];

function buildSeed() {
  const now = new Date();

  const patients = [
    {
      id: 1,
      name: "Mark Johnson",
      email: "mark@some-email-provider.net",
      password: "Password123!",
      phone: "(555) 010-1122",
      dob: "1985-03-14",
      appointments: [
        {
          id: 1,
          provider: "Dr Kim West",
          datetime: iso(addDays(now, 2)),
          repeat: "weekly",
          repeat_until: null,
        },
        {
          id: 2,
          provider: "Dr Lin James",
          datetime: iso(addDays(now, 12)),
          repeat: "monthly",
          repeat_until: null,
        },
      ],
      prescriptions: [
        {
          id: 1,
          medication: "Lexapro",
          dosage: "5mg",
          quantity: 2,
          refill_on: isoDate(addDays(now, 3)),
          refill_schedule: "monthly",
        },
        {
          id: 2,
          medication: "Ozempic",
          dosage: "1mg",
          quantity: 1,
          refill_on: isoDate(addDays(now, 22)),
          refill_schedule: "monthly",
        },
      ],
    },
    {
      id: 2,
      name: "Lisa Smith",
      email: "lisa@some-email-provider.net",
      password: "Password123!",
      phone: "(555) 010-3344",
      dob: "1990-11-02",
      appointments: [
        {
          id: 3,
          provider: "Dr Sally Field",
          datetime: iso(addDays(now, 5)),
          repeat: "monthly",
          repeat_until: null,
        },
        {
          id: 4,
          provider: "Dr Lin James",
          datetime: iso(addDays(now, 16)),
          repeat: "weekly",
          repeat_until: null,
        },
      ],
      prescriptions: [
        {
          id: 3,
          medication: "Metformin",
          dosage: "500mg",
          quantity: 2,
          refill_on: isoDate(addDays(now, 6)),
          refill_schedule: "monthly",
        },
        {
          id: 4,
          medication: "Diovan",
          dosage: "100mg",
          quantity: 1,
          refill_on: isoDate(addDays(now, 27)),
          refill_schedule: "monthly",
        },
      ],
    },
  ];

  return {
    patients,
    medications: MEDICATIONS,
    dosages: DOSAGES,
    nextIds: {
      patient: 3,
      appointment: 5,
      prescription: 5,
    },
  };
}

module.exports = { buildSeed, MEDICATIONS, DOSAGES };
