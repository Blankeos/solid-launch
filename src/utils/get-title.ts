const TITLE_TEMPLATE = "%s | Solid Launch"

export default function getTitle(title: string = "Home") {
  return TITLE_TEMPLATE.replace("%s", title)
}
