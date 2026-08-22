const COOKIE_NAME = "emr_patient_id";

function sessionCookie(patientId) {
  return {
    name: COOKIE_NAME,
    value: String(patientId),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  };
}

function clearedCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}

module.exports = { COOKIE_NAME, sessionCookie, clearedCookie };
