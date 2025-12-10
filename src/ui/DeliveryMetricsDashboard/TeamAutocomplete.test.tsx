import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import MockTeams, { createTeam } from '__mocks__/Teams'
import MockTeamViews, { createTeamView } from '__mocks__/TeamViews'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import {
  TeamAutocompleteFeatureTeamViews,
  groupTeamWithTeamViews,
  TeamAutocomplete,
} from './TeamAutocomplete'

const [team, anotherTeam] = MockTeams.result
const [teamView] = MockTeamViews.result

describe('groupTeamWithTeamViews', () => {
  const sampleTeams = [
    createTeam({ id: 1, name: 'Foo' }),
    createTeam({ id: 2, name: 'Bar' }),
  ]
  const sampleTeamViews = [
    createTeamView({ id: 1, name: 'Foo', viewOwnerId: 1 }),
    createTeamView({ id: 2, name: 'Bar', viewOwnerId: 2 }),
    // should ignore this team views since it is not
    // going to group with the teams
    createTeamView({ id: 3, name: 'Biz', viewOwnerId: 3 }),
  ]
  it('should have a group of team followed by team views in a list', () => {
    const expected = [
      sampleTeams[0],
      sampleTeamViews[0],
      sampleTeams[1],
      sampleTeamViews[1],
    ]
    expect(groupTeamWithTeamViews(sampleTeams, sampleTeamViews)).toEqual(
      expected,
    )
  })
})

describe('TeamAutocomplete', () => {
  const onTeamChange = jest.fn()
  const onTeamViewChange = jest.fn()

  const setup = () => {
    RenderWithWrapper(
      <TeamAutocomplete
        options={MockTeams.result}
        value={team}
        onTeamChange={onTeamChange}
        onTeamViewChange={onTeamViewChange}
      />,
    )
  }

  beforeEach(() => {
    setup()
  })

  afterEach(() => {
    onTeamChange.mockReset()
    onTeamViewChange.mockReset()
  })

  it('should give call to changing team when user selects a team', async () => {
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select a Team' }),
      `${anotherTeam.name}{arrowdown}{enter}`,
    )

    expect(onTeamChange).toHaveBeenCalledTimes(1)
    expect(onTeamChange).toHaveBeenCalledWith(anotherTeam)
  })
})

describe('TeamAutocompleteFeatureTeamViews', () => {
  const onTeamChange = jest.fn()
  const onTeamViewChange = jest.fn()

  afterEach(() => {
    onTeamChange.mockReset()
    onTeamViewChange.mockReset()
  })

  it('should call onTeamChange callback if the changed value is a team', async () => {
    RenderWithWrapper(
      <TeamAutocompleteFeatureTeamViews
        options={groupTeamWithTeamViews(MockTeams.result, MockTeamViews.result)}
        value={team}
        onTeamChange={onTeamChange}
        onTeamViewChange={onTeamViewChange}
      />,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select a Team or a Team View' }),
      `${anotherTeam.name}{arrowdown}{enter}`,
    )

    expect(onTeamChange).toHaveBeenCalledTimes(1)
    expect(onTeamChange).toHaveBeenCalledWith(anotherTeam)
  })

  it('should call the onTeamViewChange if the changed value is a team view', async () => {
    const sampleTeamView = createTeamView({ id: 2, name: 'foo-bar' })

    RenderWithWrapper(
      <TeamAutocompleteFeatureTeamViews
        options={groupTeamWithTeamViews(MockTeams.result, [
          ...MockTeamViews.result,
          sampleTeamView,
        ])}
        value={teamView}
        onTeamChange={onTeamChange}
        onTeamViewChange={onTeamViewChange}
      />,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select a Team or a Team View' }),
      `${sampleTeamView.name}{arrowdown}{enter}`,
    )

    expect(onTeamViewChange).toHaveBeenCalledTimes(1)
    expect(onTeamViewChange).toHaveBeenCalledWith(sampleTeamView)
  })
})
