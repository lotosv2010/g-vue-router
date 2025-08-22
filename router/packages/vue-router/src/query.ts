export type LocationQueryValue = string | number

export type LocationQueryValueRaw = LocationQueryValue | number | undefined

export type LocationQuery = Record<string, LocationQueryValue | LocationQueryValue[]>

export type LocationQueryRaw = Record<
  string | number, 
  LocationQueryValueRaw | LocationQueryValueRaw[]
>

export function parseQuery(search: string): LocationQuery {
  const query: LocationQuery = {}
  return query
}

export  function stringifyQuery(query: LocationQueryRaw): string {
  const search = ''
  return search
}