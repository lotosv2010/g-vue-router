import { assign } from "../utils";
import { PathParser, PathParserOptions, tokensToParser } from "./pathParserRanker";
import { RouteRecord } from "./types";

export interface RouteRecordMatcher extends PathParser {
  record: RouteRecord
  parent: RouteRecordMatcher | undefined
  children: RouteRecordMatcher[]
  alias: RouteRecordMatcher[]
}

export function createRouteRecordMatcher(
  record: Readonly<RouteRecord>,
  parent: RouteRecordMatcher | undefined,
  options?: PathParserOptions
): RouteRecordMatcher {
  // TODO tokensToParser
  const parser = tokensToParser(record.path, options)

  const matcher: RouteRecordMatcher = assign(
    parser,
    {
      record,
      parent,
      children: [],
      alias: []
    }
  )

  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf) {
      parent.children.push(matcher)
    }
  }

  return matcher
}