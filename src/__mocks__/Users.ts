import { User } from "api"

export const basicUser: User = {
  id: 1,
  isAdmin: false,
  isOrgLeadership: false,
  username: 'basic'
}

export const adminUser: User = {
  id: 2,
  isAdmin: true,
  isOrgLeadership: false,
  username: 'admin'
}

export const leadershipUser: User = {
  id: 3,
  isAdmin: false,
  isOrgLeadership: true,
  username: 'leader'
}

export const adminAndLeaderUser: User = {
  id: 4,
  isAdmin: true,
  isOrgLeadership: true,
  username: 'adminAndLeader'
}

export const organizationAdmin: User = {
  id: 5,
  isAdmin: false,
  isOrgLeadership: false,
  username: 'organizationAdmin'
}

export const valueStreamAdmin: User = {
  id: 6,
  isAdmin: false,
  isOrgLeadership: false,
  username: 'valueStreamAdmin'
}

export const teamAdmin: User = {
  id: 7,
  isAdmin: false,
  isOrgLeadership: false,
  username: 'teamAdmin'
}

export const leadershipAndOrgAdminUser: User = {
  id: 8,
  isAdmin: false,
  isOrgLeadership: true,
  username: 'leadershipAndOrgAdminUser'
}

export const leadershipAndVSAdminUser: User = {
  id: 9,
  isAdmin: false,
  isOrgLeadership: true,
  username: 'leadershipAndVSAdminUser'
}

export const leadershipAndTeamAdminUser: User = {
  id: 10,
  isAdmin: false,
  isOrgLeadership: true,
  username: 'leadershipAndTeamAdminUser'
}

export const allMockUsers: {result: User[]} = {result: [basicUser,
    adminUser,
    leadershipUser,
    adminAndLeaderUser,
    organizationAdmin,
    valueStreamAdmin,
    teamAdmin,
    leadershipAndOrgAdminUser,
    leadershipAndVSAdminUser,
    leadershipAndTeamAdminUser,
    ]}

export const currentUserAdminAllUsers = {
  currentUser: adminUser,
  allUsers: allMockUsers.result,
}

export const currentUserLeadershipAllUsers = {
  currentUser: leadershipUser,
  allUsers: allMockUsers.result,
}

export const currentUserBasicAllUsers = {
  currentUser: basicUser,
  allUsers: allMockUsers.result,
}
