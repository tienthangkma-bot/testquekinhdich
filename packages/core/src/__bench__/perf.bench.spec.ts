import { describe, it } from 'vitest';
import { parseToVietnamDateTime, getFullCalendarInfo } from '@kindich/calendar';
import { getHexagramByName, HEXAGRAMS } from '@kindich/domain';
import { orchestrateSixYaoAnalysis } from '../six-yao/six-yao.orchestrator';

describe('Performance Benchmarks', () => {
  it('measures Calendar, Domain, and Core speeds', () => {
    console.log('\n=== KINHDICH PERFORMANCE BENCHMARK RESULTS ===');

    // 1. Calendar parseToVietnamDateTime
    const N_CAL = 10000;
    const t0 = performance.now();
    for (let i = 0; i < N_CAL; i++) {
      parseToVietnamDateTime(new Date(1761899400000 + i * 60000));
    }
    const t1 = performance.now();
    console.log(
      `1. Calendar parseToVietnamDateTime x${N_CAL}: ${(t1 - t0).toFixed(2)}ms (${(((t1 - t0) / N_CAL) * 1000).toFixed(2)} us/op)`
    );

    // 2. Domain Hexagram Lookup Map vs Array.find
    const N_LOOKUP = 100000;
    const t2 = performance.now();
    for (let i = 0; i < N_LOOKUP; i++) {
      getHexagramByName('Càn vi Thiên');
    }
    const t3 = performance.now();
    console.log(
      `2. Domain O(1) Map Lookup x${N_LOOKUP}: ${(t3 - t2).toFixed(2)}ms (${(((t3 - t2) / N_LOOKUP) * 1000000).toFixed(2)} ns/op)`
    );

    const t2_arr = performance.now();
    for (let i = 0; i < N_LOOKUP; i++) {
      HEXAGRAMS.find((h) => h.name === 'Càn vi Thiên');
    }
    const t3_arr = performance.now();
    console.log(
      `   Baseline Array.find x${N_LOOKUP}: ${(t3_arr - t2_arr).toFixed(2)}ms (${(((t3_arr - t2_arr) / N_LOOKUP) * 1000000).toFixed(2)} ns/op) -> Speedup: ${((t3_arr - t2_arr) / (t3 - t2)).toFixed(2)}x`
    );

    // 3. Core Engine: Full Six Yao Orchestration
    const N_ORCH = 2000;
    const t4 = performance.now();
    for (let i = 0; i < N_ORCH; i++) {
      orchestrateSixYaoAnalysis({
        primaryHexagram: 1,
        changingHexagram: 44,
        movingLineIndices: [1],
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Mậu Tuất',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Kỷ Tỵ',
        },
      });
    }
    const t5 = performance.now();
    console.log(
      `3. Core Six Yao Orchestration x${N_ORCH}: ${(t5 - t4).toFixed(2)}ms (${((t5 - t4) / N_ORCH).toFixed(4)} ms/op)`
    );
  });
});
