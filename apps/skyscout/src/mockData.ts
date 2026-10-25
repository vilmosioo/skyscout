import type {
  ConeSearchResult,
  RubinObjectResponse,
  RubinTransientCandidate,
  SherlockResponse,
} from '@skyscout/lasair-client';

export interface EnrichedCandidate extends RubinTransientCandidate {
  peakMag?: number;
  peakBand?: string;
  discoveryDate?: string;
  epochCount?: number;
  maxSnr?: number;
  description?: string;
}

export const MOCK_QUERY_CANDIDATES: EnrichedCandidate[] = [
  {
    diaObjectId: '170019695992242795',
    ra: 53.12541,
    decl: -28.10023,
    classification: 'NT',
    peakMag: 17.8,
    peakBand: 'r',
    epochCount: 6,
    maxSnr: 61.1,
    discoveryDate: '1 day ago',
    description: 'Tidal disruption event (TDE) flare in star-forming galaxy core',
  },
  {
    diaObjectId: '170657504701711053',
    ra: 52.82384,
    decl: -29.69162,
    classification: 'SN',
    peakMag: 18.25,
    peakBand: 'g',
    epochCount: 8,
    maxSnr: 48.2,
    discoveryDate: '2 hours ago',
    description: 'Fast-rising Type Ia thermonuclear supernova candidate',
  },
  {
    diaObjectId: '170019696008495213',
    ra: 52.91024,
    decl: -29.40118,
    classification: 'CV',
    peakMag: 19.12,
    peakBand: 'u',
    epochCount: 4,
    maxSnr: 28.4,
    discoveryDate: '3 days ago',
    description: 'Cataclysmic dwarf nova accretion disk outburst',
  },
  {
    diaObjectId: '170019696014787102',
    ra: 53.44192,
    decl: -27.89201,
    classification: 'AGN',
    peakMag: 18.95,
    peakBand: 'i',
    epochCount: 14,
    maxSnr: 34.1,
    discoveryDate: '5 days ago',
    description: 'Active galactic nucleus optical stochastic accretion flaring',
  },
  {
    diaObjectId: '170019696022891404',
    ra: 52.65103,
    decl: -29.11475,
    classification: 'SN',
    peakMag: 19.4,
    peakBand: 'r',
    epochCount: 5,
    maxSnr: 22.9,
    discoveryDate: '1 week ago',
    description: 'Type II core-collapse supernova with plateau signature',
  },
];

export const MOCK_OBJECT_RESPONSE: RubinObjectResponse = {
  diaObjectId: '170019695992242795',
  diaObject: {
    ra: 53.12541,
    decl: -28.10023,
    firstDiaSourceMjdTai: 60450.15,
    lastDiaSourceMjdTai: 60468.3,
  },
  diaSourcesList: [
    {
      diaSourceId: '220019695992242801',
      midpointMjdTai: 60450.15,
      band: 'g',
      psfFlux: 2450.5,
      psfFluxErr: 120.2,
      snr: 20.4,
    },
    {
      diaSourceId: '220019695992242802',
      midpointMjdTai: 60452.21,
      band: 'r',
      psfFlux: 5820.0,
      psfFluxErr: 180.5,
      snr: 32.2,
    },
    {
      diaSourceId: '220019695992242803',
      midpointMjdTai: 60455.18,
      band: 'i',
      psfFlux: 12400.8,
      psfFluxErr: 250.0,
      snr: 49.6,
    },
    {
      diaSourceId: '220019695992242804',
      midpointMjdTai: 60458.12,
      band: 'r',
      psfFlux: 18950.2,
      psfFluxErr: 310.4,
      snr: 61.1,
    },
    {
      diaSourceId: '220019695992242805',
      midpointMjdTai: 60462.25,
      band: 'z',
      psfFlux: 15120.0,
      psfFluxErr: 340.0,
      snr: 44.5,
    },
    {
      diaSourceId: '220019695992242806',
      midpointMjdTai: 60468.3,
      band: 'g',
      psfFlux: 6200.4,
      psfFluxErr: 195.0,
      snr: 31.8,
    },
  ],
};

export const MOCK_CONE_RESULT: ConeSearchResult = {
  count: 3,
  nearest: {
    object: '170019695992242795',
    separation: 1.42,
  },
  objects: [
    { object: '170019695992242795', separation: 1.42 },
    { object: '170019696008495213', separation: 4.85 },
    { object: '170657504701711053', separation: 8.19 },
  ],
};

export const MOCK_SHERLOCK_RESPONSE: SherlockResponse = {
  classifications: {
    '170019695992242795': ['SN', 'Supernova associated with star-forming host galaxy'],
  },
  crossmatches: [
    {
      transient_object_id: '170019695992242795',
      association_type: 'SN',
      catalogue_table_name: 'NED',
      catalogue_object_id: 'WISEA J033230.10-280600.8',
      catalogue_object_type: 'Galaxy',
      raDeg: 53.1258,
      decDeg: -28.1005,
      separationArcsec: 1.42,
      physical_separation_kpc: 4.8,
      z: 0.0845,
    },
    {
      transient_object_id: '170019695992242795',
      association_type: 'SN',
      catalogue_table_name: 'Pan-STARRS1',
      catalogue_object_id: 'PSO J053.1254-28.1002',
      catalogue_object_type: 'Galaxy',
      raDeg: 53.1255,
      decDeg: -28.1003,
      separationArcsec: 1.45,
      z: 0.084,
    },
  ],
};
