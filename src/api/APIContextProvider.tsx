import { useMemo } from 'react'
import withAPIData from './HigherOrderComponents'
import {
  FeatureFlags,
  Organization,
  Team,
  TeamView,
  User,
  ValueStream,
  Collector,
} from './api'
import { APIContext, useRequiredAPIData } from './hooks'

export type APIContextProviderProps = {
  currentUser: User
  allUsers: User[]
  teamList: Team[]
  valueStreamList: ValueStream[]
  organizationList: Organization[]
  featureFlags: FeatureFlags
  teamViews?: TeamView[]
  collectors: Collector[]
  children: React.ReactNode
}

const withRequiredAPIData = withAPIData({
  useAPIData: useRequiredAPIData,
})

const APIContextProvider = withRequiredAPIData(
  ({
    currentUser,
    allUsers,
    teamList,
    valueStreamList,
    organizationList,
    featureFlags,
    teamViews,
    collectors,
    children,
  }: Omit<APIContextProviderProps, 'children'> & {
    children: React.ReactNode
  }) => {
    const contextValue = useMemo(
      () => ({
        currentUser,
        allUsers,
        teamList,
        valueStreamList,
        organizationList,
        featureFlags,
        teamViews,
        collectors,
      }),
      [
        currentUser,
        allUsers,
        organizationList,
        valueStreamList,
        teamList,
        featureFlags,
        teamViews,
        collectors,
      ],
    )

    return (
      <APIContext.Provider value={contextValue}>{children}</APIContext.Provider>
    )
  },
)

export default APIContextProvider
