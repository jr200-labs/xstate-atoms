import { Atom, atom, Getter, Setter, WritableAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { duckdbActorAtom, duckdbHandleAtom } from './atoms'
import { duckdbRunQuery, QueryDbParams } from '@jr200/xstate-duckdb'
import { AtomFamily } from 'jotai/vanilla/utils/atomFamily'

export const duckdbExecuteAtom = atom(
  null,
  (
    get,
    set,
    query: {
      params: QueryDbParams
      dataAtom: WritableAtom<any, [any], unknown>
    }
  ) => {
    const actor = get(duckdbActorAtom)
    if (!actor || !query.params.sql || !query.dataAtom) {
      return null
    }

    const description = `query-${query.params.description ?? 'unnamed'}`

    try {
      actor.send({
        type: 'QUERY.EXECUTE',
        queryParams: {
          ...query.params,
          description: description,
          callback: data => {
            set(query.dataAtom, data ?? [])
          },
        },
      })
    } catch (error) {
      console.error('Error sending query to DuckDB actor:', error)
      return null
    }
  }
)

// const duckdbReadOnlyParamsAtom = atom<QueryDbParams | null>(null)
// export const duckdbReadOnlyAtom = atom(
//   async get => {
//     const db = get(duckdbHandleAtom)
//     const params = get(duckdbReadOnlyParamsAtom)
//     if (!params || !db) {
//       return null
//     }

//     try {
//       const connection = await db.connect()
//       const result = await duckdbRunQuery({ ...params, connection })
//       return result
//     } catch (error) {
//       console.error('Error running query:', error)
//       return null
//     }
//   },
//   (_, set, params: QueryDbParams) => {
//     set(duckdbReadOnlyParamsAtom, params)
//   }
// )

const hydrateTemplateParams = (templateParams: Record<string, any> | null, get: Getter) => {
  if (templateParams === undefined || templateParams === null) return null

  try {
    const entries = Object.entries(templateParams).map(([key, value]) => {
      // Handle falsy values
      if (value === undefined || value === null) {
        return null
      }

      // Handle atom values
      if (isAtom(value)) {
        const atomValue = get(value)
        if (!atomValue) {
          return null
        }
        return [key, atomValue]
      }

      // Return regular values as-is
      return [key, value]
    })

    // Check if any entries failed (returned null)
    if (entries.some(entry => entry === null)) {
      return null
    }

    return Object.fromEntries(entries as [string, any][])
  } catch (error) {
    console.error('Error hydrating template params:', error)
    return null
  }
}

const isAtom = (value: any): value is Atom<any> => {
  return typeof value === 'object' && value !== null && 'read' in value
}

export type DuckdbQueryFamilyParams = {
  queryId: string
  initialParams: QueryDbParams
  templateParams?: Record<string, Atom<any> | string | number | boolean>
}

export const duckdbQueryFamily: AtomFamily<
  DuckdbQueryFamilyParams,
  WritableAtom<Promise<any>, [newParams: QueryDbParams], void>
> = atomFamily((params: DuckdbQueryFamilyParams) => {
  // Internal atom to store query parameters for this specific query
  const queryParamsAtom = atom<QueryDbParams | null>(params.initialParams ?? null)
  const templateParamsAtom = atom<Record<string, any> | null>(params.templateParams ?? null)

  return atom(
    async (get: Getter) => {
      const db = get(duckdbHandleAtom)
      const queryParams = get(queryParamsAtom)
      if (!queryParams || !db) {
        return null
      }
      const templateParams = get(templateParamsAtom)

      // always hydrate template params
      // this is to trigger any atoms that are indirectly dependencies of the query
      const hydratedParams = hydrateTemplateParams(templateParams, get)

      let hydratedSql = params.initialParams.sql
      if (typeof hydratedSql === 'function') {
        const sqlTemplate = hydratedSql as any
        if (hydratedParams === null || hydratedParams === undefined) {
          return null
        }

        hydratedSql = sqlTemplate(hydratedParams)
      }

      const description = params.initialParams?.description ?? params.queryId

      try {
        const connection = await db.connect()
        console.log('** running duckdb read-only query', description)
        const result = await duckdbRunQuery({ ...queryParams, connection, description, sql: hydratedSql })
        return result
      } catch (error) {
        console.error(`Error running query ${params.queryId}:`, error)
        return null
      }
    },
    (_, set: Setter, newParams: QueryDbParams) => {
      set(queryParamsAtom, newParams)
    }
  )
})
