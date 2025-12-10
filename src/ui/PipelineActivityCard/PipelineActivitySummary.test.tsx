import { render, screen } from '@testing-library/react'
import PipelineActivitySummary from './PipelineActivitySummary'

describe('PipelineActivitySummary', () => {
  describe('Build Status Summary', () => {
    it('should show green build status in case of all passing builds', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(screen.getByLabelText('Green Build Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Build Status')).toHaveTextContent(
        'Build Status: All passing',
      )
    })

    it('should show a yellow build status in case of builds that passed with warnings', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={2}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(screen.getByLabelText('Yellow Build Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Build Status')).toHaveTextContent(
        'Build Status: 2 Warning',
      )
    })

    it('should show a red build status in case of failing builds', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={2}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(screen.getByLabelText('Red Build Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Build Status')).toHaveTextContent(
        'Build Status: 2 Failing',
      )
    })

    it('should show a red build status in case of failing and passed with warning builds, and with message indicating so', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={2}
          amountOfPassedWithWarningsBuilds={1}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(screen.getByLabelText('Red Build Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Build Status')).toHaveTextContent(
        'Build Status: 2 Failing, 1 Warning',
      )
    })
  })

  describe('Stale Branches Summary', () => {
    it('should render with yellow stale branches label if there are stale branches', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={2}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(
        screen.getByLabelText('Yellow Stale Branches Status'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Stale Branches Status')).toHaveTextContent(
        'Stale Branches: 2',
      )
    })

    it('should render with green stale branches label if there are no stale branches', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(
        screen.getByLabelText('Green Stale Branches Status'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Stale Branches Status')).toHaveTextContent(
        'Stale Branches: 0',
      )
    })
  })

  describe('Stale Code Reviews Summary', () => {
    it('should render with yellow stale code reviews label if there are stale code reviews', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={2}
          amountOfStalePipelines={0}
        />,
      )

      expect(
        screen.getByLabelText('Yellow Stale Code Reviews Status'),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('Stale Code Reviews Status'),
      ).toHaveTextContent('Stale Code Reviews: 2')
    })

    it('should render with green stale code reviews label if there are no stale code reviews', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(
        screen.getByLabelText('Green Stale Code Reviews Status'),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('Stale Code Reviews Status'),
      ).toHaveTextContent('Stale Code Reviews: 0')
    })
  })

  describe('Stale Pipelines Summary', () => {
    it('should render with yellow stale pipelines label if there are stale pipelines', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={2}
        />,
      )

      expect(
        screen.getByLabelText('Yellow Stale Pipelines Status'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Stale Pipelines Status')).toHaveTextContent(
        'Stale Pipelines: 2',
      )
    })

    it('should render with green stale pipelines label if there are no stale pipelines', () => {
      render(
        <PipelineActivitySummary
          amountOfFailedBuilds={0}
          amountOfPassedWithWarningsBuilds={0}
          amountOfStaleBranches={0}
          amountOfStaleCodeReviews={0}
          amountOfStalePipelines={0}
        />,
      )

      expect(
        screen.getByLabelText('Green Stale Pipelines Status'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Stale Pipelines Status')).toHaveTextContent(
        'Stale Pipelines: 0',
      )
    })
  })
})
