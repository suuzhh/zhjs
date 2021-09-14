export type Fetcher<Data> = (...args: any) => Data | Promise<Data>

export interface InternalConfiguration {
  // TODO:
}

export interface PublicConfiguration<
  Data = any,
  Fn extends Fetcher<Data> = Fetcher<Data>
> {
  fetcher?: Fn
}

export type SWRConfiguration<
  Data = any,
  Fn extends Fetcher<Data> = Fetcher<Data>
> = Partial<PublicConfiguration<Data, Fn>>

export type ValueKey = string | any[] | null
export type Key = ValueKey | (() => ValueKey)