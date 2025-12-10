import { Typography } from '@mui/material'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardWidgetWrapper, {
  ChartTooltipWrapper,
  LabelAndValueChartTooltip,
  NotEnoughDataWrapper,
} from '.'

jest.mock('utils/Help', () => ({
  __esModule: true,
  default: () => <div data-testid="help-content" />,
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
}))

describe('NotEnoughDataWrapper', () => {
  it('should show not enough data message if there is not enough data', () => {
    render(
      <NotEnoughDataWrapper notEnoughData>
        <div data-testid="foo-bar" />
      </NotEnoughDataWrapper>,
    )
    expect(screen.queryByTestId('foo-bar')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Not Enough Data Message')).toBeInTheDocument()
  })

  it('should show custom message if custom message is set for not enough data case', () => {
    render(
      <NotEnoughDataWrapper notEnoughData notEnoughDataMessage="Foo Bar">
        <div data-testid="foo-bar" />
      </NotEnoughDataWrapper>,
    )
    expect(screen.queryByTestId('foo-bar')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Not Enough Data Message')).toHaveTextContent(
      'Foo Bar',
    )
  })

  it('otherwise should show the children', () => {
    render(
      <NotEnoughDataWrapper notEnoughData={false}>
        <div data-testid="foo-bar" />
      </NotEnoughDataWrapper>,
    )
    expect(screen.getByTestId('foo-bar')).toBeInTheDocument()
  })
})

describe('DashboardWidgetWrapper', () => {
  describe('UI', () => {
    it('should show help content icon', () => {
      render(
        <DashboardWidgetWrapper
          title="foo-bar"
          notEnoughData={false}
          helpContent="help content"
        >
          Some content
        </DashboardWidgetWrapper>,
      )

      expect(screen.getByTestId('help-content')).toBeInTheDocument()
    })

    it('should show title', () => {
      render(
        <DashboardWidgetWrapper
          title="foo-bar"
          notEnoughData={false}
          helpContent="help content"
        >
          Some content
        </DashboardWidgetWrapper>,
      )

      expect(screen.getByLabelText('Dashboard Widget Title')).toHaveTextContent(
        'foo-bar',
      )
    })

    it('should show the details button if additional information is set', () => {
      render(
        <DashboardWidgetWrapper
          title="foo-bar"
          notEnoughData={false}
          helpContent="help content"
          AdditionalInformation={<div data-testid="additional-info" />}
        >
          Some content
        </DashboardWidgetWrapper>,
      )

      expect(screen.getByLabelText('Show foo-bar Details')).toBeInTheDocument()
    })

    it('should show the footer if footer is set', () => {
      render(
        <DashboardWidgetWrapper
          title="foo-bar"
          notEnoughData={false}
          Footer={<Typography aria-label="Footer">Foo Bar</Typography>}
          helpContent="help content"
        >
          Some content
        </DashboardWidgetWrapper>,
      )

      expect(screen.getByLabelText('Footer')).toHaveTextContent('Foo Bar')
    })
  })

  describe('Interaction', () => {
    it('should show additional information if user clicks the details button', async () => {
      render(
        <DashboardWidgetWrapper
          title="foo-bar"
          helpContent="foo bar"
          notEnoughData={false}
          Footer="some content"
          AdditionalInformation={
            <div data-testid="additional-info"> Foo Bar</div>
          }
        >
          Some Content
        </DashboardWidgetWrapper>,
      )
      await userEvent.click(screen.getByLabelText('Show foo-bar Details'))
      expect(screen.getByTestId('additional-info')).toHaveTextContent('Foo Bar')
    })
  })
})

describe('ChartTooltipWrapper', () => {
  it('should should not render with label if show label is false', () => {
    render(
      <ChartTooltipWrapper
        active
        payload={[{ name: 'foo', value: 24 }]}
        label="title"
        showLabel={false}
      >
        {() => <div data-testid="foo-bar" />}
      </ChartTooltipWrapper>,
    )
    expect(screen.queryByText('title')).not.toBeInTheDocument()
    expect(screen.getByTestId('foo-bar')).toBeInTheDocument()
  })

  it('should render with tooltip if tooltip is active', () => {
    render(
      <ChartTooltipWrapper
        active
        payload={[{ name: 'foo', value: 24 }]}
        label="title"
      >
        {() => <div data-testid="foo-bar" />}
      </ChartTooltipWrapper>,
    )
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByTestId('foo-bar')).toBeInTheDocument()
  })

  it('should otherwise not render anything', () => {
    render(
      <ChartTooltipWrapper
        active={false}
        payload={[{ name: 'foo', value: 24 }]}
        label="title"
      >
        {() => <div data-testid="foo-bar" />}
      </ChartTooltipWrapper>,
    )
    expect(screen.queryByText('title')).not.toBeInTheDocument()
    expect(screen.queryByTestId('foo-bar')).not.toBeInTheDocument()
  })
})

describe('LabelAndValueChartTooltip', () => {
  it('should render with the given provided label and value for the tooltip', () => {
    render(
      <LabelAndValueChartTooltip
        active
        payload={[
          {
            color: 'red',
            name: 'foo',
            value: 4,
          },
        ]}
      />,
    )
    expect(screen.getByLabelText('foo')).toHaveTextContent('foo:')
    expect(screen.getByLabelText('foo Value:')).toHaveTextContent('4')
  })

  it('should render with unit if unit was provided from recharts props', () => {
    render(
      <LabelAndValueChartTooltip
        active
        payload={[
          {
            color: 'red',
            name: 'foo',
            value: 4,
            unit: 'bar',
          },
        ]}
      />,
    )
    expect(screen.getByLabelText('foo')).toHaveTextContent('foo:')
    expect(screen.getByLabelText('foo Value:')).toHaveTextContent('4 bar')
  })
})
