import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  toMajorUnits,
  splitEqually,
  splitByPercentages,
  calculateNetBalances,
  generateSettlementSuggestions
} from '../src/utils/moneyMath.js';

describe('Money Math & Financial Splits', () => {
  it('converts between major and minor units accurately', () => {
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits(0.05)).toBe(5);
    expect(toMajorUnits(1999)).toBe(19.99);
    expect(toMajorUnits(5)).toBe(0.05);
  });

  it('splits amounts equally and distributes remainder cents deterministically', () => {
    // $10.00 (1000 cents) between 3 people -> 334, 333, 333 cents
    const shares3 = splitEqually(1000, 3);
    expect(shares3).toEqual([334, 333, 333]);
    expect(shares3.reduce((a, b) => a + b, 0)).toBe(1000);

    // $100.00 (10000 cents) between 4 people -> 2500 each
    const shares4 = splitEqually(10000, 4);
    expect(shares4).toEqual([2500, 2500, 2500, 2500]);
    expect(shares4.reduce((a, b) => a + b, 0)).toBe(10000);
  });

  it('splits amounts by percentages accurately', () => {
    // $100.00 with 60% and 40%
    const shares = splitByPercentages(10000, [60, 40]);
    expect(shares).toEqual([6000, 4000]);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(10000);

    // $10.00 with 33%, 33%, 34%
    const sharesOdd = splitByPercentages(1000, [33, 33, 34]);
    expect(sharesOdd.reduce((a, b) => a + b, 0)).toBe(1000);
  });

  it('calculates net balances and generates optimal settlement suggestions', () => {
    const userA = 'user-alice';
    const userB = 'user-bob';
    const userC = 'user-charlie';

    // Alice paid $90 for Alice, Bob, Charlie ($30 each)
    const expenses = [
      {
        payer: userA,
        shares: [
          { user: userA, amountMinor: 3000 },
          { user: userB, amountMinor: 3000 },
          { user: userC, amountMinor: 3000 }
        ]
      }
    ];

    const balances = calculateNetBalances(expenses, [], [userA, userB, userC]);

    expect(balances.get(userA)).toBe(6000); // Alice paid 90, consumed 30 -> should receive +60
    expect(balances.get(userB)).toBe(-3000); // Bob consumed 30 -> owes -30
    expect(balances.get(userC)).toBe(-3000); // Charlie consumed 30 -> owes -30

    // Generate settlement recommendations (Minimizing Cash Flow)
    const settlements = generateSettlementSuggestions(balances);

    expect(settlements.length).toBe(2);
    // Bob pays Alice $30, Charlie pays Alice $30
    const payers = settlements.map((s) => s.payer).sort();
    expect(payers).toEqual([userB, userC].sort());
    expect(settlements.every((s) => s.receiver === userA)).toBe(true);
    expect(settlements.every((s) => s.amount === 30)).toBe(true);
  });
});

