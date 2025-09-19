import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface AquariumType {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export interface InhabitantType {
  value: string;
  label: string;
  emoji: string;
}

export interface InhabitantLibraryItem {
  name: string;
  species: string;
  type: string;
  habitat: 'freshwater' | 'saltwater' | 'brackish';
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AquariumDataService {
  private readonly baseUrl = 'assets/data';
  
  // Cached observables to avoid multiple HTTP requests
  private aquariumTypes$: Observable<AquariumType[]> | null = null;
  private inhabitantTypes$: Observable<InhabitantType[]> | null = null;
  private commonCapacities$: Observable<number[]> | null = null;
  private inhabitantLibrary$: Observable<InhabitantLibraryItem[]> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Get available aquarium types from JSON file
   */
  getAquariumTypes(): Observable<AquariumType[]> {
    if (!this.aquariumTypes$) {
      this.aquariumTypes$ = this.http.get<AquariumType[]>(`${this.baseUrl}/aquarium-types.json`).pipe(
        shareReplay(1)
      );
    }
    return this.aquariumTypes$;
  }

  /**
   * Get common aquarium capacities from JSON file
   */
  getCommonCapacities(): Observable<number[]> {
    if (!this.commonCapacities$) {
      this.commonCapacities$ = this.http.get<number[]>(`${this.baseUrl}/common-capacities.json`).pipe(
        shareReplay(1)
      );
    }
    return this.commonCapacities$;
  }

  /**
   * Get inhabitant types from JSON file
   */
  getInhabitantTypes(): Observable<InhabitantType[]> {
    if (!this.inhabitantTypes$) {
      this.inhabitantTypes$ = this.http.get<InhabitantType[]>(`${this.baseUrl}/inhabitant-types.json`).pipe(
        shareReplay(1)
      );
    }
    return this.inhabitantTypes$;
  }

  /**
   * Get the full inhabitant library from JSON file
   */
  getInhabitantLibrary(): Observable<InhabitantLibraryItem[]> {
    if (!this.inhabitantLibrary$) {
      this.inhabitantLibrary$ = this.http.get<InhabitantLibraryItem[]>(`${this.baseUrl}/inhabitant-library.json`).pipe(
        shareReplay(1)
      );
    }
    return this.inhabitantLibrary$;
  }

  /**
   * Get inhabitants filtered by type
   */
  getInhabitantsByType(type: string): Observable<InhabitantLibraryItem[]> {
    return this.getInhabitantLibrary().pipe(
      map((inhabitants: InhabitantLibraryItem[]) => 
        inhabitants.filter(item => item.type === type)
      )
    );
  }

  /**
   * Search inhabitants by name, species, or notes
   */
  searchInhabitants(searchTerm: string): Observable<InhabitantLibraryItem[]> {
    const term = searchTerm.toLowerCase();
    return this.getInhabitantLibrary().pipe(
      map((inhabitants: InhabitantLibraryItem[]) =>
        inhabitants.filter(item =>
          item.name.toLowerCase().includes(term) ||
          item.species.toLowerCase().includes(term) ||
          item.notes.toLowerCase().includes(term)
        )
      )
    );
  }

  /**
   * Get inhabitants filtered by habitat
   */
  getInhabitantsByHabitat(habitat: 'freshwater' | 'saltwater' | 'brackish'): Observable<InhabitantLibraryItem[]> {
    return this.getInhabitantLibrary().pipe(
      map((inhabitants: InhabitantLibraryItem[]) => 
        inhabitants.filter(item => item.habitat === habitat)
      )
    );
  }

  /**
   * Get filtered inhabitants with type, habitat, and search filters
   */
  getFilteredInhabitants(searchTerm: string = '', type: string = '', habitat: 'freshwater' | 'saltwater' | 'brackish' | '' = ''): Observable<InhabitantLibraryItem[]> {    return this.getInhabitantLibrary().pipe(
      map((inhabitants: InhabitantLibraryItem[]) => {
        let filtered = [...inhabitants];

        // Filter by type if specified
        if (type) {
          filtered = filtered.filter(item => item.type === type);
        }

        // Filter by habitat if specified
        if (habitat) {
          filtered = filtered.filter(item => item.habitat === habitat);
        }

        // Filter by search term if specified
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.species.toLowerCase().includes(term) ||
            item.notes.toLowerCase().includes(term)
          );
        }

        return filtered;
      })
    );
  }

  /**
   * Find inhabitant type by value
   */
  getInhabitantTypeByValue(value: string): Observable<InhabitantType | undefined> {
    return this.getInhabitantTypes().pipe(
      map((types: InhabitantType[]) => types.find(type => type.value === value))
    );
  }

  /**
   * Find aquarium type by value  
   */
  getAquariumTypeByValue(value: string): Observable<AquariumType | undefined> {
    return this.getAquariumTypes().pipe(
      map((types: AquariumType[]) => types.find(type => type.value === value))
    );
  }
}