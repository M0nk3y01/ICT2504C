const { PublicHoliday } = require("../models");

async function syncSingaporePublicHolidays() {
  try {
    const datasetId = "d_8ef23381f9417e4d4254ee8b4dcdb176";
    const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.result?.records) {
      console.log("No holiday records returned from data.gov.sg");
      return;
    }

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const records = data.result.records.filter((record) => {
      const dateValue = record.date || record.Date;
      if (!dateValue) return false;

      const year = new Date(dateValue).getFullYear();
      return year === currentYear || year === nextYear;
    });

    for (const record of records) {
      const holidayDate = record.date || record.Date;
      const name = record.holiday || record.Holiday;

      if (!holidayDate || !name) continue;

      await PublicHoliday.upsert({
        name,
        holidayDate
      });
    }

    console.log(
      `Singapore public holidays synced for ${currentYear} and ${nextYear}`
    );
  } catch (error) {
    console.error("Failed to sync Singapore public holidays:", error.message);
  }
}

module.exports = syncSingaporePublicHolidays;