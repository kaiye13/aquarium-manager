export interface Parameter {
  id: string;
  name: string;
  currentValue: number;
  targetMin: number;
  targetMax: number;
  unit: string;
  lastUpdated: Date;
}

export interface Inhabitant {
  id: string;
  name: string;
  species: string;
  type: 'fish' | 'invertebrate' | 'plant' | 'coral';
  quantity: number;
  dateAdded: Date;
  notes?: string;
}

export interface Aquarium {
  id: string;
  name: string;
  capacity: number; // in liters/gallons
  type: 'freshwater' | 'saltwater' | 'brackish';
  dateCreated: Date;
  parameters: Parameter[];
  inhabitants: Inhabitant[];
  notes?: string;
}