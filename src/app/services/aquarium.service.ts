import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Aquarium, Parameter, Inhabitant } from '../models/aquarium.model';

@Injectable({
  providedIn: 'root'
})
export class AquariumService {
  private aquariumsSubject = new BehaviorSubject<Aquarium[]>([]);
  public aquariums$ = this.aquariumsSubject.asObservable();

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleAquariums: Aquarium[] = [
      {
        id: '1',
        name: 'Community Tank',
        capacity: 200,
        type: 'freshwater',
        dateCreated: new Date('2024-01-15'),
        parameters: [
          {
            id: 'ph1',
            name: 'pH',
            currentValue: 7.2,
            targetMin: 6.8,
            targetMax: 7.4,
            unit: '',
            lastUpdated: new Date()
          },
          {
            id: 'temp1',
            name: 'Temperature',
            currentValue: 24.5,
            targetMin: 24,
            targetMax: 26,
            unit: '°C',
            lastUpdated: new Date()
          },
          {
            id: 'ammonia1',
            name: 'Ammonia',
            currentValue: 0.1,
            targetMin: 0,
            targetMax: 0.25,
            unit: 'ppm',
            lastUpdated: new Date()
          }
        ],
        inhabitants: [
          {
            id: 'fish1',
            name: 'Neon Tetras',
            species: 'Paracheirodon innesi',
            type: 'fish',
            quantity: 10,
            dateAdded: new Date('2024-02-01'),
            notes: 'Very active and healthy'
          }
        ],
        notes: 'Main display tank in living room'
      }
    ];
    
    this.aquariumsSubject.next(sampleAquariums);
  }

  getAquariums(): Observable<Aquarium[]> {
    return this.aquariums$;
  }

  getAquarium(id: string): Observable<Aquarium | undefined> {
    return this.aquariums$.pipe(
      map(aquariums => aquariums.find(a => a.id === id))
    );
  }

  addAquarium(aquarium: Omit<Aquarium, 'id'>): void {
    console.log('AquariumService.addAquarium called with:', aquarium);
    
    const newAquarium: Aquarium = {
      ...aquarium,
      id: this.generateId()
    };
    
    console.log('Generated new aquarium with ID:', newAquarium);
    
    const currentAquariums = this.aquariumsSubject.value;
    console.log('Current aquariums before adding:', currentAquariums);
    
    const updatedAquariums = [...currentAquariums, newAquarium];
    this.aquariumsSubject.next(updatedAquariums);
    
    console.log('Updated aquariums after adding:', updatedAquariums);
    console.log('BehaviorSubject value after update:', this.aquariumsSubject.value);
  }

  updateAquarium(id: string, updates: Partial<Aquarium>): void {
    const currentAquariums = this.aquariumsSubject.value;
    const updatedAquariums = currentAquariums.map(aquarium =>
      aquarium.id === id ? { ...aquarium, ...updates } : aquarium
    );
    this.aquariumsSubject.next(updatedAquariums);
  }

  deleteAquarium(id: string): void {
    const currentAquariums = this.aquariumsSubject.value;
    const filteredAquariums = currentAquariums.filter(aquarium => aquarium.id !== id);
    this.aquariumsSubject.next(filteredAquariums);
  }

  updateParameter(aquariumId: string, parameterId: string, updates: Partial<Parameter>): void {
    const currentAquariums = this.aquariumsSubject.value;
    const updatedAquariums = currentAquariums.map(aquarium => {
      if (aquarium.id === aquariumId) {
        const updatedParameters = aquarium.parameters.map(param =>
          param.id === parameterId ? { ...param, ...updates, lastUpdated: new Date() } : param
        );
        return { ...aquarium, parameters: updatedParameters };
      }
      return aquarium;
    });
    this.aquariumsSubject.next(updatedAquariums);
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'item-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
  }

  addInhabitant(aquariumId: string, inhabitant: Omit<Inhabitant, 'id'>): void {
    const newInhabitant: Inhabitant = {
      ...inhabitant,
      id: this.generateId()
    };

    const currentAquariums = this.aquariumsSubject.value;
    const updatedAquariums = currentAquariums.map(aquarium => {
      if (aquarium.id === aquariumId) {
        return { ...aquarium, inhabitants: [...aquarium.inhabitants, newInhabitant] };
      }
      return aquarium;
    });
    this.aquariumsSubject.next(updatedAquariums);
  }
}