import { TestBed } from '@angular/core/testing';

import { Descarga } from './descarga';

describe('Descarga', () => {
  let service: Descarga;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Descarga);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
