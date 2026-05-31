import type { PublicHoliday } from "./types";

const JOHOR_2026: PublicHoliday[] = [
  { date: "2026-02-01", name: "Hari Thaipusam", state: "Johor", notes: "State PH" },
  { date: "2026-02-17", name: "Tahun Baru Cina", state: "Johor" },
  { date: "2026-02-18", name: "Tahun Baru Cina (Hari Kedua)", state: "Johor" },
  { date: "2026-02-19", name: "Awal Ramadhan", state: "Johor", notes: "State PH" },
  { date: "2026-03-21", name: "Hari Raya Puasa", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-03-22", name: "Hari Raya Puasa (Hari Kedua)", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-03-23", name: "Hari Keputeraan Rasmi DYMM Sultan Johor", state: "Johor", notes: "State PH" },
  { date: "2026-05-01", name: "Hari Pekerja", state: "Johor" },
  { date: "2026-05-27", name: "Hari Raya Qurban", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-05-31", name: "Hari Wesak", state: "Johor" },
  { date: "2026-06-01", name: "Hari Keputeraan Seri Paduka Baginda Yang di-Pertuan Agong", state: "Johor" },
  { date: "2026-06-17", name: "Awal Muharram (Ma'al Hijrah)", state: "Johor" },
  { date: "2026-07-21", name: "Hari Hol Almarhum Sultan Iskandar", state: "Johor", notes: "State PH" },
  { date: "2026-08-25", name: "Hari Keputeraan Nabi Muhammad S.A.W. (Maulidur Rasul)", state: "Johor" },
  { date: "2026-08-31", name: "Hari Kebangsaan", state: "Johor" },
  { date: "2026-09-16", name: "Hari Malaysia", state: "Johor" },
  { date: "2026-11-08", name: "Hari Deepavali", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-12-25", name: "Hari Krismas", state: "Johor" },
];

export function getJohorPublicHolidays(year: number): PublicHoliday[] {
  if (year === 2026) return JOHOR_2026;
  return [];
}

export function findJohorPublicHoliday(date: string): PublicHoliday | undefined {
  const year = Number(date.slice(0, 4));
  return getJohorPublicHolidays(year).find((holiday) => holiday.date === date);
}
