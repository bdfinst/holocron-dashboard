import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { roundValue } from 'utils/DashboardWidgetWrapper'
import globalConfig from 'globalConfig'

const { METRICS_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

type EffortCostsChartDataPoint = {
  amountSpentOnFeatures: number
  amountSpentOnDefects: number
  amountSpentOnUnplanned: number
  amountSpentOnMaintenance: number
}

export type EffortCostsAggregateTableProps = {
  data: EffortCostsChartDataPoint[]
}

const percentOfTotal = (value: number, overallTotal: number) => {
  const pct = roundValue((value / overallTotal) * 100)
  return !Number.isNaN(pct) ? `${pct}%` : ''
}

const EffortCostsAggregateTable = ({
  data,
}: EffortCostsAggregateTableProps) => {
  const costs = data.reduce(
    (result, dataPoint) => ({
      features: result.features + dataPoint.amountSpentOnFeatures,
      defects: result.defects + dataPoint.amountSpentOnDefects,
      maintenance: result.maintenance + dataPoint.amountSpentOnMaintenance,
      unplanned: result.unplanned + dataPoint.amountSpentOnUnplanned,
    }),
    {
      features: 0,
      defects: 0,
      maintenance: 0,
      unplanned: 0,
    },
  )
  const totalCost =
    costs.defects + costs.features + costs.maintenance + costs.unplanned

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5"> Cost Totals for Reporting Period</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="right">Feature</TableCell>
                <TableCell align="right">Defect</TableCell>
                <TableCell align="right">Maintenance</TableCell>
                <TableCell align="right">Unplanned</TableCell>
                <TableCell align="right">Total Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {Object.entries(costs).map(([costMetricName, costValue]) => (
                  <TableCell
                    key={`cost-${costMetricName}`}
                    aria-label={`Amount spent on ${costMetricName}`}
                    align="right"
                  >
                    {FTE_RATE_UNIT} {costValue}
                  </TableCell>
                ))}
                <TableCell align="right" aria-label="Amount total">
                  {FTE_RATE_UNIT} {totalCost}
                </TableCell>
              </TableRow>
              <TableRow>
                {Object.entries(costs).map(([costMetricName, costValue]) => (
                  <TableCell
                    key={`percent-${costMetricName}`}
                    aria-label={`Percent amount spent on ${costMetricName}`}
                    align="right"
                  >
                    {percentOfTotal(costValue, totalCost)}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default EffortCostsAggregateTable
