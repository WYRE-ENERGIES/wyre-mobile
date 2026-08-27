import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { DonutChart } from '@/components/reports/donut-chart';
import { HorizontalBarChart } from '@/components/reports/horizontal-bar-chart';
import {
  ReportKvGrid,
  ReportSectionCard,
  ReportTable,
} from '@/components/reports/report-section';
import { formatKwh, withSourcePercents } from '@/lib/report/helpers';
import type { MonthlyReportModel } from '@/lib/report/types';
import { WyreColors } from '@/constants/theme';

type MonthlyReportViewProps = {
  report: MonthlyReportModel;
};

/**
 * Actual Report — full dashboard MonthlyReport content for mobile.
 */
export function MonthlyReportView({ report }: MonthlyReportViewProps) {
  const sources = withSourcePercents(report.sources);
  const topContributors = [...report.sources]
    .sort((a, b) => b.valueKwh - a.valueKwh)
    .slice(0, 7);
  const solarPct =
    report.totalEnergyKwh === 0
      ? 0
      : (report.solarHourKwh / report.totalEnergyKwh) * 100;

  return (
    <View style={styles.report}>
      <View style={styles.heading}>
        <Image
          source={require('@/assets/report/wyre-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>
          Monthly Energy Report for{' '}
          <Text style={styles.capitalize}>{report.branchName}</Text>
        </Text>
        <Text style={styles.period}>
          <Text style={styles.capitalize}>{report.monthLabel}</Text>, {report.year}
        </Text>
        <Text style={styles.powered}>powered by Wyre</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Energy Consumed:</Text>
        <View style={styles.totalValueRow}>
          <Image
            source={require('@/assets/report/tilder.png')}
            style={styles.tilde}
            contentFit="contain"
          />
          <Text style={styles.totalValue}>{formatKwh(report.totalEnergyKwh)}</Text>
          <Text style={styles.totalUnit}>kWh</Text>
        </View>
      </View>

      <ReportSectionCard
        title="Energy Consumed per Source"
        info="This is the distribution of your energy consumption across your power sources. Highlighting the source that was mostly used.">
        <View style={styles.sourceBody}>
          <DonutChart
            size={196}
            strokeWidth={40}
            slices={sources.map((item) => ({
              label: item.label,
              value: item.valueKwh,
              color: item.color,
            }))}
          />
          <View style={styles.legend}>
            {sources.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  <Text style={styles.legendStrong}>{item.label}</Text>
                  {': '}
                  {formatKwh(item.valueKwh)} kWh{' '}
                  <Text style={styles.legendMuted}>({item.percent.toFixed(1)}%)</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ReportSectionCard>

      <ReportSectionCard
        title="Top 7 energy contributors"
        info="Chart highlighting the top seven loads with the most energy consumption. This card is designed for bespoke account users."
        right={
          <Text style={styles.contributorsTotal}>
            {formatKwh(report.totalEnergyKwh)}
            <Text style={styles.contributorsUnit}> kWh</Text>
          </Text>
        }>
        <HorizontalBarChart
          items={topContributors.map((item) => ({
            label: item.label,
            value: item.valueKwh,
            color: item.color,
          }))}
        />
      </ReportSectionCard>

      <Text style={styles.groupTitle}>Consumption Metrics</Text>

      <ReportSectionCard
        title="Utility consumption"
        icon="powerplug.fill"
        info="The chart compares your utility consumption with the service provider to ensure that you are not overcharged.">
        {report.utilityRows.length === 0 ? (
          <Text style={styles.empty}>No utility rows for this period.</Text>
        ) : (
          report.utilityRows.map((row) => (
            <View key={row.key} style={styles.metricBlock}>
              <Text style={styles.metricMonth}>{row.month || 'Utility'}</Text>
              <ReportKvGrid
                items={[
                  { label: 'Energy (kWh)', value: row.energy },
                  { label: 'Time of use', value: row.timeOfUse },
                  { label: 'Expected bill', value: row.bill },
                  { label: 'Accuracy (%)', value: row.accuracy },
                  { label: 'Actual cost', value: row.actualCost },
                  { label: 'Usage accuracy', value: row.usageAccuracy },
                ]}
              />
            </View>
          ))
        )}
      </ReportSectionCard>

      <ReportSectionCard
        title="Diesel consumption"
        icon="fuelpump.fill"
        info="The chart outlines monthly diesel usage and costs. You can optimize through reduced loads, limited use during off-hours, and regular maintenance.">
        {report.dieselRows.length === 0 ? (
          <Text style={styles.empty}>No diesel rows for this period.</Text>
        ) : (
          report.dieselRows.map((row) => (
            <View key={row.key} style={styles.metricBlock}>
              <Text style={styles.metricMonth}>
                {row.month || 'Diesel'} · {row.name}
              </Text>
              <ReportKvGrid
                items={[
                  { label: 'Energy (kWh)', value: row.energy },
                  { label: 'Diesel usage (L)', value: row.dieselUsage },
                  { label: 'Time of use', value: row.timeOfUse },
                  { label: 'Actual cost', value: row.actualCost },
                  { label: 'Optimal cost', value: row.optimalCost },
                  { label: 'Accuracy (%)', value: row.accuracy },
                ]}
              />
            </View>
          ))
        )}
      </ReportSectionCard>

      <ReportSectionCard
        title="Solar Hours consumption"
        icon="sun.max.fill"
        info="This card shows the energy consumed during sunshine hours. The value is the potential savings if you deploy the solar solution.">
        <ReportKvGrid
          items={[
            {
              label: 'Energy during solar hours',
              value: `${formatKwh(report.solarHourKwh)}${report.solarHourUnit}`,
            },
            {
              label: 'Solar percentage',
              value: `${solarPct.toFixed(1)}%`,
            },
          ]}
        />
      </ReportSectionCard>

      <Text style={styles.groupTitle}>Operational Performance</Text>

      <ReportSectionCard
        title="Power Demand"
        info="This chart shows the power demand during operational hours, non-operational hours, and weekends. This information, along with other factors, can be used to determine generator sizing.">
        <View style={styles.demandList}>
          {report.powerDemand.map((period) => (
            <View key={period.label} style={styles.demandCard}>
              <View style={styles.demandHeader}>
                <View style={[styles.demandDot, { backgroundColor: period.color }]} />
                <Text style={styles.demandTitle}>{period.label}</Text>
              </View>
              <ReportKvGrid
                items={[
                  { label: 'Max', value: `${period.peak} ${period.unit}` },
                  { label: 'Average', value: `${period.average} ${period.unit}` },
                  { label: 'Min', value: `${period.minimum} ${period.unit}` },
                  { label: 'Total energy', value: `${period.totalEnergy} kWh` },
                ]}
              />
            </View>
          ))}
        </View>
      </ReportSectionCard>

      <ReportSectionCard
        title="Energy Usage Breakdown"
        icon="chart.pie.fill"
        info="The information in the card helps you plan for an alternative source of energy especially during weekends to cut cost.">
        <ReportTable
          headers={['Period', 'Energy (kWh)', '%']}
          rows={report.usageBreakdown.map((row) => [
            row.name,
            row.value,
            `${row.percentage}%`,
          ])}
        />
      </ReportSectionCard>

      <ReportSectionCard
        title="Deviation Energy and Cost"
        icon="chart.line.downtrend.xyaxis"
        info="The chart captures the time, energy and cost wasted by running the generator outside operating hours.">
        <ReportTable
          headers={['Month', 'Energy', 'Hours', 'Diesel', 'Cost']}
          rows={report.deviationRows.map((row) => [
            row.month,
            row.value,
            row.deviationTimeOfUse,
            row.dieselConsumption,
            row.deviationCost,
          ])}
        />
      </ReportSectionCard>

      <Text style={styles.groupTitle}>Generator Size Efficiency Accuracy</Text>

      <View style={styles.efficiencyRow}>
        <View style={styles.efficiencyCard}>
          <Text style={styles.efficiencyLabel}>{report.currentEfficiency.label}</Text>
          <Text style={styles.efficiencyValue}>
            {report.currentEfficiency.value}
            {report.currentEfficiency.unit}
          </Text>
          {report.currentEfficiency.delta ? (
            <Text style={styles.efficiencyDelta}>{report.currentEfficiency.delta}</Text>
          ) : null}
        </View>
        <View style={styles.efficiencyCard}>
          <Text style={styles.efficiencyLabel}>{report.bestEfficiency.label}</Text>
          <Text style={styles.efficiencyValue}>
            {report.bestEfficiency.value}
            {report.bestEfficiency.unit}
          </Text>
          {report.bestEfficiency.achievedDate ? (
            <Text style={styles.efficiencyMeta}>
              Achieved: {report.bestEfficiency.achievedDate}
            </Text>
          ) : null}
        </View>
      </View>

      <ReportSectionCard
        title="Fuel Efficiency Accuracy Comparison"
        icon="gauge.with.dots.needle.33percent"
        right={<Text style={styles.badge}>Accuracy: {report.fuelAccuracy}</Text>}>
        <ReportKvGrid
          items={[
            { label: 'Recommended', value: report.fuelRecommended },
            { label: 'Achieved', value: report.fuelAchieved },
          ]}
        />
      </ReportSectionCard>

      <ReportSectionCard
        title="Band Categorization"
        icon="powerplug.fill"
        right={<Text style={styles.badge}>Band {report.bandLabel}</Text>}>
        <ReportTable
          headers={['Band', 'Total hours', 'Expected']}
          rows={report.bandRows.map((row) => [
            row.band,
            row.totalHours,
            row.expectedHours,
          ])}
        />
      </ReportSectionCard>

      <ReportSectionCard title="Data Entry Score" icon="checkmark.square.fill">
        <View style={styles.dataEntry}>
          <Text style={styles.dataEntryScore}>
            {report.dataEntryScore}
            {report.dataEntryUnit}
          </Text>
          <Text style={styles.dataEntrySubtitle}>
            Progress based on completeness of system inputs
          </Text>
        </View>
      </ReportSectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  report: {
    backgroundColor: '#F4F7FA',
    borderRadius: 18,
    padding: 14,
    gap: 14,
  },
  heading: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logo: {
    width: 88,
    height: 34,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F2F2F',
    textAlign: 'center',
    lineHeight: 28,
  },
  period: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F2F2F',
    textAlign: 'center',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  powered: {
    marginTop: 2,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F',
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  tilde: {
    width: 28,
    height: 20,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2F2F2F',
    letterSpacing: -0.5,
  },
  totalUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 6,
  },
  sourceBody: {
    alignItems: 'center',
    gap: 18,
  },
  legend: {
    width: '100%',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendSwatch: {
    width: 22,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  legendStrong: {
    fontWeight: '700',
  },
  legendMuted: {
    color: '#888888',
  },
  contributorsTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  contributorsUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  metricBlock: {
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EAF0',
  },
  metricMonth: {
    fontSize: 13,
    fontWeight: '700',
    color: WyreColors.purple,
  },
  empty: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  demandList: {
    gap: 12,
  },
  demandCard: {
    gap: 8,
  },
  demandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  demandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  efficiencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  efficiencyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  efficiencyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.textSecondary,
  },
  efficiencyValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  efficiencyDelta: {
    fontSize: 13,
    fontWeight: '600',
    color: WyreColors.success,
  },
  efficiencyMeta: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(92, 18, 167, 0.1)',
    color: WyreColors.purple,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  dataEntry: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  dataEntryScore: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
  },
  dataEntrySubtitle: {
    fontSize: 13,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
});
