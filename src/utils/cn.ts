import type { ClassValue } from "clsx"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

/** Utility for merging class names + managing tailwind class conflicts. */
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))
