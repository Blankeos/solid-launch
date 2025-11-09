import dayjs from "dayjs"

export function formatDate(date: string | Date | undefined) {
  if (!date) return "-"
  return dayjs(date).format("MMMM DD, YYYY")
}
