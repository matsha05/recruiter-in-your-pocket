export interface OfferData {
  id: string;
  styleIndex: number;
  companyName: string;
  baseSalary: number;
  bonusPercent: number;
  stockTotal: number;
  vestingSchedule: number[];
  signingBonus: number;
  relocationBonus: number;
  stockGrowth: number;
  isCurrentJob: boolean;
}

export interface YearBreakdown {
  base: number;
  stock: number;
  bonus: number;
  signing: number;
  relocation: number;
  total: number;
}

export interface FourYearComponents {
  guaranteedBase: number;
  targetBonus: number;
  modeledEquity: number;
  oneTimeCash: number;
}

export const DEFAULT_VESTING = [25, 25, 25, 25] as const;

export function createEmptyOffer(id: string, isCurrentJob = false, styleIndex = 0): OfferData {
  return {
    id,
    styleIndex,
    companyName: "",
    baseSalary: 0,
    bonusPercent: 0,
    stockTotal: 0,
    vestingSchedule: [...DEFAULT_VESTING],
    signingBonus: 0,
    relocationBonus: 0,
    stockGrowth: 0,
    isCurrentJob,
  };
}

export function isVestingScheduleValid(schedule: number[]): boolean {
  return schedule.length === 4
    && schedule.every((value) => Number.isFinite(value) && value >= 0 && value <= 100)
    && schedule.reduce((sum, value) => sum + value, 0) === 100;
}

export function offerHasValidVesting(offer: OfferData): boolean {
  return offer.stockTotal <= 0 || isVestingScheduleValid(offer.vestingSchedule);
}

export function isComparableOffer(offer: OfferData): boolean {
  return offer.baseSalary > 0 && offerHasValidVesting(offer);
}

export function getYearBreakdown(offer: OfferData, year: number): YearBreakdown {
  const yearIndex = Math.max(0, Math.min(3, Math.trunc(year) - 1));
  const base = offer.baseSalary;
  const bonus = offer.baseSalary * (offer.bonusPercent / 100);
  const stockPercent = offer.vestingSchedule[yearIndex] ?? 0;
  const growthMultiplier = Math.pow(1 + offer.stockGrowth / 100, yearIndex);
  const stock = offer.stockTotal * (stockPercent / 100) * growthMultiplier;
  const signing = yearIndex === 0 ? offer.signingBonus : 0;
  const relocation = yearIndex === 0 ? offer.relocationBonus : 0;

  return {
    base,
    stock,
    bonus,
    signing,
    relocation,
    total: base + stock + bonus + signing + relocation,
  };
}

export function getFourYearComponents(offer: OfferData): FourYearComponents {
  const years = [1, 2, 3, 4].map((year) => getYearBreakdown(offer, year));
  return {
    guaranteedBase: years.reduce((sum, value) => sum + value.base, 0),
    targetBonus: years.reduce((sum, value) => sum + value.bonus, 0),
    modeledEquity: years.reduce((sum, value) => sum + value.stock, 0),
    oneTimeCash: offer.signingBonus + offer.relocationBonus,
  };
}

export function getFourYearTotal(offer: OfferData): number {
  const components = getFourYearComponents(offer);
  return components.guaranteedBase
    + components.targetBonus
    + components.modeledEquity
    + components.oneTimeCash;
}

export function formatCurrency(value: number): string {
  if (value === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return formatCurrency(value);
}
