// React Router generated types for route:
// routes/_authenticated.organizations.$orgId.connections.new.tsx

import type * as T from "react-router/route-module"

import type { Info as Parent0 } from "../../+types/root.js"
import type { Info as Parent1 } from "./_authenticated.js"
import type { Info as Parent2 } from "./_authenticated.organizations.js"
import type { Info as Parent3 } from "./_authenticated.organizations.$orgId.connections.js"

type Module = typeof import("../_authenticated.organizations.$orgId.connections.new.js")

export type Info = {
  parents: [Parent0, Parent1, Parent2, Parent3],
  id: "routes/_authenticated.organizations.$orgId.connections.new"
  file: "routes/_authenticated.organizations.$orgId.connections.new.tsx"
  path: "new"
  params: {"orgId": string} & { [key: string]: string | undefined }
  module: Module
  loaderData: T.CreateLoaderData<Module>
  actionData: T.CreateActionData<Module>
}

export namespace Route {
  export type LinkDescriptors = T.LinkDescriptors
  export type LinksFunction = () => LinkDescriptors

  export type MetaArgs = T.CreateMetaArgs<Info>
  export type MetaDescriptors = T.MetaDescriptors
  export type MetaFunction = (args: MetaArgs) => MetaDescriptors

  export type HeadersArgs = T.HeadersArgs
  export type HeadersFunction = (args: HeadersArgs) => Headers | HeadersInit

  export type LoaderArgs = T.CreateServerLoaderArgs<Info>
  export type ClientLoaderArgs = T.CreateClientLoaderArgs<Info>
  export type ActionArgs = T.CreateServerActionArgs<Info>
  export type ClientActionArgs = T.CreateClientActionArgs<Info>

  export type HydrateFallbackProps = T.CreateHydrateFallbackProps<Info>
  export type ComponentProps = T.CreateComponentProps<Info>
  export type ErrorBoundaryProps = T.CreateErrorBoundaryProps<Info>
}