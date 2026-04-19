import { WasteType } from '../pages/waste-type-page/WasteType';
import { SkipSize } from '../pages/skip-size-page/SkipSize';
import { PlasterboardOption } from '../pages/waste-type-page/PlasterboardOption';

interface PriceExpectation {
  hire: string;
  heavySurcharge?: string;
  plasterboardSurcharge?: string;
  total: string;
}

interface BookingScenario {
  postcode: string;
  address: string;
  addressSummary: string;
  wasteType: WasteType;
  wasteTypeSummaryText: string;
  plasterboardOption?: PlasterboardOption;
  skipSize: SkipSize;
  skipSizeSummaryText: string;
  skipSizeDisplayPrice: string;
  price: PriceExpectation;
  selectedClass: RegExp;
  selectedPlasterboardClass?: RegExp;
}

export const generalWasteScenario: BookingScenario = {
  postcode: 'SW1A 1AA',
  address: 'Northumberland Avenue',
  addressSummary: 'Northumberland Avenue, London',
  wasteType: WasteType.General,
  wasteTypeSummaryText: 'general',
  skipSize: SkipSize.TwoYard,
  skipSizeSummaryText: '2-yard',
  skipSizeDisplayPrice: '£80',
  price: { hire: '£80', total: '£80' },
  selectedClass: /border-indigo-500/,
};

export const heavyWasteScenario: BookingScenario = {
  postcode: 'SW1A 1AA',
  address: '10 Downing Street',
  addressSummary: '10 Downing Street, London',
  wasteType: WasteType.Heavy,
  wasteTypeSummaryText: 'heavy',
  skipSize: SkipSize.SixYard,
  skipSizeSummaryText: '6-yard',
  skipSizeDisplayPrice: '£160',
  price: { hire: '£160', heavySurcharge: '£20', total: '£180' },
  selectedClass: /border-indigo-500/,
};

export const plasterboardScenario: BookingScenario = {
  postcode: 'SW1A 1AA',
  address: '70 Whitehall',
  addressSummary: '70 Whitehall, London',
  wasteType: WasteType.Plasterboard,
  wasteTypeSummaryText: 'Plasterboard',
  plasterboardOption: PlasterboardOption.Mixed,
  skipSize: SkipSize.FourYard,
  skipSizeSummaryText: '4-yard',
  skipSizeDisplayPrice: '£120',
  price: { hire: '£120', plasterboardSurcharge: '£40', total: '£160' },
  selectedClass: /border-indigo-500/,
  selectedPlasterboardClass: /border-amber-500/,
};
