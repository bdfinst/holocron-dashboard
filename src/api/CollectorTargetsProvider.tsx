import React, { useMemo, ReactNode, createContext, useContext } from 'react'
import { useCollectorTargets } from './hooks'
import { CollectorTarget } from './api'

/**
 * Interface defining the shape of the CollectorTargetsContext.
 * Ensures type safety and consistency across consuming components.
 */
interface CollectorTargetsContextProps {
  ticketBoards: CollectorTarget[]
  repositories: CollectorTarget[]
  pipelines: CollectorTarget[]
  projects: CollectorTarget[]
  isLoading: boolean
  error: Error | null
}

/**
 * Creates a React Context for CollectorTargets.
 * The default value is set to undefined to ensure an error is thrown if accessed outside the provider.
 */
const CollectorTargetsContext = createContext<
  CollectorTargetsContextProps | undefined
>(undefined)

/**
 * Functional component to provide the CollectorTargetsContext.
 * This component now directly uses the useCollectorTargets hook without the withAPIData HOC.
 *
 * @param {ReactNode} children - The child components that will consume the context
 * @returns {JSX.Element} The provider component wrapping its children
 */
const CollectorTargetsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Destructure the data, loading state, and error state from the custom hook
  const { data, isLoading, hasErrored } = useCollectorTargets()

  /**
   * Constructs the context value to be provided to consuming components.
   * Utilizes useMemo to optimize performance by memoizing the context value.
   */
  const contextValue = useMemo<CollectorTargetsContextProps>(
    () => ({
      ticketBoards: data?.ticketBoards ?? [],
      repositories: data?.repositories ?? [],
      pipelines: data?.pipelines ?? [],
      projects: data?.projects ?? [],
      isLoading,
      error: hasErrored ? new Error('Failed to load collector targets') : null,
    }),
    [data, isLoading, hasErrored],
  )

  /**
   * Provides the CollectorTargetsContext to its child components.
   */
  return (
    <CollectorTargetsContext.Provider value={contextValue}>
      {children}
    </CollectorTargetsContext.Provider>
  )
}

export default CollectorTargetsProvider

/**
 * Custom hook to consume the CollectorTargetsContext.
 *
 * @returns {CollectorTargetsContextProps} The context value containing collector targets data
 * @throws Will throw an error if used outside of a CollectorTargetsProvider
 */
export const useCollectorTargetsContext = (): CollectorTargetsContextProps => {
  const context = useContext(CollectorTargetsContext)
  // If context is undefined, it means the hook is being used outside the provider
  if (!context) {
    throw new Error(
      'useCollectorTargetsContext must be used within a CollectorTargetsProvider',
    )
  }
  return context
}
