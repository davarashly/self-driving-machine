export const save = <T>(obj: T, key: string) => {
  localStorage.setItem(
    key,
    typeof obj === "object" ? JSON.stringify(obj) : String(obj)
  )
}

export const remove = (key: string) => {
  localStorage.removeItem(key)
}

export const load = <T = any>(key: string): T => {
  let val = localStorage.getItem(key) || ""

  if (!isNaN(parseFloat(val))) {
    return parseFloat(val) as T
  } else if (["true", "false"].includes(val)) {
    return (val === "true") as T
  } else {
    try {
      val = JSON.parse(val)

      return val as T
    } catch (e) {
      return val as T
    }
  }
}
