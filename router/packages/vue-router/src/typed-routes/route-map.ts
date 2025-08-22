import { TypesConfig } from "../config";
import { RouteParamsGeneric, RouteParamsRawGeneric } from "../types";

export type RouteMap = TypesConfig extends Record<'RouteNameMap', infer RouteNameMap>
  ? RouteNameMap
  : RouteMapGeneric

export interface RouteRecordInfo <
  Name extends string | symbol = string,
  Path extends string = string,
  ParamsRaw extends RouteParamsRawGeneric = RouteParamsRawGeneric,
  Params extends RouteParamsGeneric = RouteParamsGeneric,
  ChildNames extends string | symbol = string,
> {
  path: Path
  name: Name
  paramsRaw: ParamsRaw
  params: Params
  childrenNames: ChildNames
}
export type RouteRecordInfoGeneric = RouteRecordInfo<
  string | symbol,
  string,
  RouteParamsRawGeneric,
  RouteParamsGeneric,
  string | symbol
>

export type RouteMapGeneric = Record<string | symbol, RouteRecordInfoGeneric>