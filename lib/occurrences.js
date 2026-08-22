function addInterval(date, unit) {
  const d = new Date(date);
  if (unit === "weekly") {
    d.setDate(d.getDate() + 7);
  } else if (unit === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else {
    return null;
  }
  return d;
}

// Expands a single appointment record into every occurrence that falls
// between `from` and `to` (inclusive), honoring its repeat schedule and
// optional repeat_until end date.
function expandAppointment(appt, from, to) {
  const occurrences = [];
  let current = new Date(appt.datetime);
  const until = appt.repeat_until ? new Date(appt.repeat_until) : null;
  const repeat = appt.repeat && appt.repeat !== "none" ? appt.repeat : null;

  // Safety cap so a bad record can never spin forever.
  let guard = 0;
  while (current <= to && guard < 500) {
    guard += 1;
    if (until && current > until) break;
    if (current >= from) {
      occurrences.push({
        ...appt,
        occurrence_datetime: current.toISOString(),
      });
    }
    if (!repeat) break;
    const next = addInterval(current, repeat);
    if (!next) break;
    current = next;
  }
  return occurrences;
}

// Expands a single prescription into every refill date between `from` and
// `to` (inclusive), honoring its refill schedule.
function expandPrescription(rx, from, to) {
  const occurrences = [];
  let current = new Date(rx.refill_on + "T00:00:00");
  const repeat =
    rx.refill_schedule && rx.refill_schedule !== "none"
      ? rx.refill_schedule
      : null;

  let guard = 0;
  while (current <= to && guard < 500) {
    guard += 1;
    if (current >= from) {
      occurrences.push({
        ...rx,
        occurrence_date: current.toISOString().slice(0, 10),
      });
    }
    if (!repeat) break;
    const next = addInterval(current, repeat);
    if (!next) break;
    current = next;
  }
  return occurrences;
}

function upcomingAppointments(patient, from, to) {
  const all = (patient.appointments || []).flatMap((a) =>
    expandAppointment(a, from, to)
  );
  all.sort(
    (x, y) => new Date(x.occurrence_datetime) - new Date(y.occurrence_datetime)
  );
  return all;
}

function upcomingRefills(patient, from, to) {
  const all = (patient.prescriptions || []).flatMap((rx) =>
    expandPrescription(rx, from, to)
  );
  all.sort(
    (x, y) => new Date(x.occurrence_date) - new Date(y.occurrence_date)
  );
  return all;
}

module.exports = { expandAppointment, expandPrescription, upcomingAppointments, upcomingRefills };
