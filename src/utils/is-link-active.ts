export function isLinkActive(path: string, currentPath: string, depth = 1) {
  currentPath = currentPath
    .split("/")
    .slice(0, depth + 1)
    .join("/")
  const navLinkPath = path
    .split("/")
    .slice(0, depth + 1)
    .join("/")

  return currentPath === navLinkPath
}
