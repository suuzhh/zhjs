export type Fetcher<Data> = (...args: any) => Data | Promise<Data>

export interface InternalConfiguration {
  // TODO:
}

export interface PublicConfiguration<
  Data = any,
> {
  fallbackData?: Data
  fetcher?: Fetcher<Data>
}

export type SWRConfiguration<
  Data = any,
> = Partial<PublicConfiguration<Data>>

export type ValueKey = string | any[] | null
export type Key = ValueKey | (() => ValueKey)