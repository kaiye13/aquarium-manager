import { TestBed } from '@angular/core/testing';

import { Aquarium } from './aquarium';

describe('Aquarium', () => {
  let service: Aquarium;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Aquarium);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
