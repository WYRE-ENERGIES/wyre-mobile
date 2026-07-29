import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { GroupedBarChart, MultiLineChart } from '@/components/diesel/charts';
import {
  DieselCard,
  DieselDonut,
  FrequencyToggle,
  LegendRow,
  colorForIndex,
} from '@/components/diesel/shared';
import { WyreColors } from '@/constants/theme';
import {
  formatChartDateLabel,
  formatNaira,
  formatNumber,
  monthLabel,
} from '@/lib/diesel/helpers';
import type {
  ChartFrequency,
  DieselOverviewState,
  FuelUsageSeriesPoint,
  GeneratorFuelSeriesDevice,
} from '@/lib/diesel/types';

type DieselOverviewViewProps = {
  data: DieselOverviewState;
  month: number;
  year: number;
  fuelBreakupFrequency: ChartFrequency;
  fuelUsageFrequency: ChartFrequency;
  onFuelBreakupFrequencyChange: (value: ChartFrequency) => void;
  onFuelUsageFrequencyChange: (value: ChartFrequency) => void;
  loadingSections?: {
    totalEnergy?: boolean;
    generatorStatus?: boolean;
    fuelBreakup?: boolean;
    fuelUsage?: boolean;
    operational?: boolean;
    cost?: boolean;
  };
};

export function DieselOverviewView({
  data,
  month,
  year,
  fuelBreakupFrequency,
  fuelUsageFrequency,
  onFuelBreakupFrequencyChange,
  onFuelUsageFrequencyChange,
  loadingSections,
}: DieselOverviewViewProps) {
  const periodLabel = monthLabel(month, year);

  return (
    <View style={styles.root}>
      <Text style={styles.pageTitle}>Daily Diesel Usage for {periodLabel}</Text>

      <DieselHeaderSection data={data} />

      <DieselCard title="Total Energy Used" loading={loadingSections?.totalEnergy}>
        <TotalEnergySection data={data.totalEnergy} />
      </DieselCard>

      <DieselCard title="Generator Status" loading={loadingSections?.generatorStatus}>
        <GeneratorStatusSection data={data.generatorStatusChart} />
      </DieselCard>

      <DieselCard
        title="Generator Fuel Usage Breakup"
        right={
          <FrequencyToggle
            value={fuelBreakupFrequency}
            onChange={onFuelBreakupFrequencyChange}
          />
        }
        loading={loadingSections?.fuelBreakup}>
        <FuelBreakupSection
          devices={data.generatorFuelSeries}
          frequency={fuelBreakupFrequency}
        />
      </DieselCard>

      <DieselCard
        title="Fuel Usage"
        right={
          <FrequencyToggle value={fuelUsageFrequency} onChange={onFuelUsageFrequencyChange} />
        }
        loading={loadingSections?.fuelUsage}>
        <FuelUsageSection series={data.fuelUsageSeries} frequency={fuelUsageFrequency} />
      </DieselCard>

      <DieselCard title="Operational Efficiency" loading={loadingSections?.operational}>
        <OperationalEfficiencySection data={data.operationalEfficiency} />
      </DieselCard>

      <DieselCard title="Cost Analysis" loading={loadingSections?.cost}>
        <CostAnalysisSection data={data.costAnalysis} />
      </DieselCard>
    </View>
  );
}

function DieselHeaderSection({ data }: { data: DieselOverviewState }) {
  const generators = data.branchStatus?.generators || [];
  const co2 = data.co2?.total_co2_tonnes ?? 0;
  const price = data.dieselPrice;

  return (
    <View style={styles.headerBlock}>
      {generators.map((generator, index) => (
        <View key={`${generator.name}-${index}`} style={styles.genCard}>
          <View style={styles.genIconWrap}>
            <MaterialIcons name="electrical-services" size={22} color={WyreColors.purple} />
          </View>
          <View style={styles.genMeta}>
            <View style={styles.genNameRow}>
              <View
                style={[
                  styles.statusDot,
                  generator.is_currently_on ? styles.statusDotOn : styles.statusDotOff,
                ]}
              />
              <Text style={styles.genName} numberOfLines={1}>
                {generator.name}
              </Text>
            </View>
            {generator.last_usage_time_relative ? (
              <Text style={styles.genLastUsed}>
                Last used{' '}
                <Text style={styles.genLastUsedValue}>{generator.last_usage_time_relative}</Text>
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, styles.metricCardHalf]}>
          <MaterialIcons name="cloud" size={20} color={WyreColors.purple} />
          <Text style={styles.metricLabel}>CO emission</Text>
          <Text style={styles.metricValuePurple}>
            {formatNumber(co2)} <Text style={styles.metricUnit}>tons</Text>
          </Text>
        </View>

        <View style={[styles.metricCard, styles.metricCardHalf]}>
          <MaterialIcons name="local-gas-station" size={20} color={WyreColors.purple} />
          <Text style={styles.metricLabel}>Price / Litre</Text>
          <Text style={styles.metricValuePurple}>
            {formatNaira(price?.diesel_price_per_litre)}
          </Text>
        </View>
      </View>

      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Diesel efficiency</Text>
          <Text style={styles.priceValueGreen}>
            {formatNumber(price?.diesel_efficiency, { maximumFractionDigits: 1 })} kWh/L
          </Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Cost (estimated monthly)</Text>
          <Text style={styles.priceValuePurple}>
            {formatNaira(price?.month_estimated_cost)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function TotalEnergySection({
  data,
}: {
  data: DieselOverviewState['totalEnergy'];
}) {
  if (!data) {
    return <Text style={styles.empty}>No energy data for this period.</Text>;
  }

  const slices = data.generators.map((generator, index) => ({
    label: generator.name,
    value: generator.energy,
    color: colorForIndex(index),
  }));

  return (
    <View style={styles.centeredSection}>
      <DieselDonut
        slices={slices}
        size={168}
        strokeWidth={30}
        centerTop="Total"
        centerBottom={`${formatNumber(data.total_energy, { maximumFractionDigits: 0 })} kWh`}
      />
      <LegendRow
        items={data.generators.map((generator, index) => ({
          label: generator.name,
          color: colorForIndex(index),
          value: `${formatNumber(generator.energy, { maximumFractionDigits: 0 })} kWh`,
        }))}
      />
    </View>
  );
}

function GeneratorStatusSection({
  data,
}: {
  data: DieselOverviewState['generatorStatusChart'];
}) {
  if (!data || data.generators.length === 0) {
    return <Text style={styles.empty}>No generator status data for this period.</Text>;
  }

  const runSlices = data.generators.map((generator, index) => ({
    label: generator.name,
    value: generator.runtime_hours,
    color: colorForIndex(index),
  }));

  const fuelSlices = data.generators.map((generator, index) => ({
    label: generator.name,
    value: generator.fuel_liters,
    color: colorForIndex(index),
  }));

  return (
    <View style={styles.statusSection}>
      <View style={styles.statusChartsRow}>
        <View style={styles.statusChartCol}>
          <DieselDonut
            slices={runSlices}
            size={132}
            strokeWidth={24}
            centerTop="Run"
            centerBottom="Hours"
          />
          <View style={styles.statusLabels}>
            {data.generators.map((generator, index) => (
              <View key={`run-${generator.name}`} style={styles.statusLabelRow}>
                <View style={[styles.legendDot, { backgroundColor: colorForIndex(index) }]} />
                <Text style={styles.statusLabelText}>{generator.runtime_formatted}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.statusTotal}>{data.total_runtime}</Text>
        </View>

        <View style={styles.statusChartCol}>
          <DieselDonut
            slices={fuelSlices}
            size={132}
            strokeWidth={24}
            centerTop="Fuel"
            centerBottom="Used"
          />
          <View style={styles.statusLabels}>
            {data.generators.map((generator, index) => (
              <View key={`fuel-${generator.name}`} style={styles.statusLabelRow}>
                <View style={[styles.legendDot, { backgroundColor: colorForIndex(index) }]} />
                <Text style={styles.statusLabelText}>
                  {formatNumber(generator.fuel_liters)} Litres
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.statusTotal}>
            {formatNumber(data.total_fuel_liters)} Litres
          </Text>
        </View>
      </View>

      <LegendRow
        items={data.generators.map((generator, index) => ({
          label: generator.name,
          color: colorForIndex(index),
        }))}
      />
    </View>
  );
}

function FuelBreakupSection({
  devices,
  frequency,
}: {
  devices: GeneratorFuelSeriesDevice[];
  frequency: ChartFrequency;
}) {
  if (!devices.length) {
    return <Text style={styles.empty}>No data available</Text>;
  }

  const dateSet = new Set<string>();
  devices.forEach((device) => {
    device.series.forEach((point) => dateSet.add(point.date));
  });

  const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  const labels = dates.map((date) => formatChartDateLabel(date, frequency));

  const series = devices.map((device, index) => ({
    name: device.name,
    color: colorForIndex((index * 1 + 2) % 4),
    values: dates.map((date) => {
      const point = device.series.find((entry) => entry.date === date);
      return point?.kwh ?? 0;
    }),
  }));

  return <MultiLineChart labels={labels} series={series} yAxisLabel="Energy (kWh)" />;
}

function FuelUsageSection({
  series,
  frequency,
}: {
  series: FuelUsageSeriesPoint[];
  frequency: ChartFrequency;
}) {
  if (!series.length) {
    return <Text style={styles.empty}>No data available</Text>;
  }

  const groups = series.map((point) => ({
    label: formatChartDateLabel(point.date, frequency),
    reported: point.fuel_liters,
    predicted: point.predicted_liters,
  }));

  return <GroupedBarChart groups={groups} />;
}

function OperationalEfficiencySection({
  data,
}: {
  data: DieselOverviewState['operationalEfficiency'];
}) {
  if (!data) {
    return <Text style={styles.empty}>No efficiency data for this period.</Text>;
  }

  return (
    <View style={styles.efficiencySection}>
      <View style={styles.efficiencyRow}>
        <Text style={styles.efficiencyLabel}>Fuel efficiency</Text>
        <Text style={styles.efficiencyValueRed}>
          {formatNumber(data.fuel_efficiency.value)} kWh/L
        </Text>
      </View>

      <View style={styles.efficiencyRow}>
        <Text style={styles.efficiencyLabel}>Specific fuel consumption</Text>
        <Text style={styles.efficiencyValueRed}>
          {formatNumber(data.fuel_consumption.value / 1000)} L/kWh
        </Text>
      </View>

      <View style={styles.powerDemandBlock}>
        <Text style={styles.efficiencyLabel}>Power demand</Text>
        <View style={styles.powerDemandRow}>
          <View style={styles.powerDemandItem}>
            <Text style={styles.powerDemandKey}>MAX</Text>
            <Text style={styles.powerDemandValue}>
              {formatNumber(data.power_demand_kva.max.value)} kVA
            </Text>
          </View>
          <View style={styles.powerDemandItem}>
            <Text style={styles.powerDemandKey}>AVG</Text>
            <Text style={styles.powerDemandValue}>
              {formatNumber(data.power_demand_kva.avg.value)} kVA
            </Text>
          </View>
          <View style={styles.powerDemandItem}>
            <Text style={styles.powerDemandKey}>MIN</Text>
            <Text style={styles.powerDemandValue}>
              {formatNumber(data.power_demand_kva.min.value)} kVA
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <Text style={styles.efficiencyLabel}>Generator efficiency score</Text>
        <Text style={styles.scoreValue}>{formatNumber(data.generator_efficiency_score.value)}%</Text>
      </View>
    </View>
  );
}

function CostAnalysisSection({
  data,
}: {
  data: DieselOverviewState['costAnalysis'];
}) {
  if (!data) {
    return <Text style={styles.empty}>No cost data for this period.</Text>;
  }

  const rows = [
    { label: 'Total cost', value: formatNaira(data.total_cost.value) },
    { label: 'Diesel cost per kWh', value: formatNaira(data.blended_cost.value) },
    { label: 'Annual cost', value: formatNaira(data.annual_cost_forecast.value) },
  ];

  return (
    <View style={styles.costCard}>
      {rows.map((row, index) => (
        <View key={row.label}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{row.label}</Text>
            <Text style={styles.costValue}>{row.value}</Text>
          </View>
          {index < rows.length - 1 ? <View style={styles.costDivider} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerBlock: {
    gap: 10,
  },
  genCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECECF3',
  },
  genIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F5F0FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genMeta: {
    flex: 1,
    gap: 4,
  },
  genNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOn: {
    backgroundColor: '#52AC0B',
  },
  statusDotOff: {
    backgroundColor: '#D1D5DB',
  },
  genName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  genLastUsed: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  genLastUsedValue: {
    color: '#DC2626',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECECF3',
    gap: 6,
  },
  metricCardHalf: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 13,
    color: WyreColors.textSecondary,
    fontWeight: '600',
  },
  metricValuePurple: {
    fontSize: 18,
    fontWeight: '700',
    color: WyreColors.purple,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECECF3',
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceLabel: {
    flex: 1,
    fontSize: 13,
    color: WyreColors.textSecondary,
    fontWeight: '600',
  },
  priceValueGreen: {
    fontSize: 15,
    fontWeight: '700',
    color: '#52AC0B',
  },
  priceValuePurple: {
    fontSize: 15,
    fontWeight: '700',
    color: WyreColors.purple,
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#ECECF3',
  },
  centeredSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 16,
  },
  statusSection: {
    gap: 16,
  },
  statusChartsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statusLabels: {
    width: '100%',
    gap: 6,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabelText: {
    flex: 1,
    fontSize: 11,
    color: WyreColors.textPrimary,
    fontWeight: '500',
  },
  statusTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    textAlign: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  efficiencySection: {
    gap: 14,
  },
  efficiencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  efficiencyLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  efficiencyValueRed: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  powerDemandBlock: {
    gap: 10,
    paddingTop: 4,
  },
  powerDemandRow: {
    flexDirection: 'row',
    gap: 8,
  },
  powerDemandItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  powerDemandKey: {
    fontSize: 11,
    fontWeight: '700',
    color: WyreColors.textSecondary,
  },
  powerDemandValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#52AC0B',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#52AC0B',
  },
  costCard: {
    backgroundColor: '#F5F0FA',
    borderRadius: 14,
    padding: 14,
    gap: 0,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  costLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '700',
    color: WyreColors.purple,
  },
  costDivider: {
    height: 1,
    backgroundColor: 'rgba(92, 18, 167, 0.12)',
  },
  empty: {
    fontSize: 13,
    color: WyreColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
