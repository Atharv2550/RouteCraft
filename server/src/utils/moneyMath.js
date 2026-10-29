/**
 * Utility functions for precise financial calculations in RouteCraft.
 * Money amounts are handled as integer minor units (cents) internally to avoid floating-point errors.
 */

export function toMinorUnits(amount) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return Math.round(amount * 100);
}

export function toMajorUnits(minorUnits) {
  return parseFloat((minorUnits / 100).toFixed(2));
}

/**
 * Split an amount in minor units equally among N participants.
 * Distributes remainder cents one-by-one to the first remainder participants.
 * Guarantees sum(shares) === totalMinorUnits exactly.
 */
export function splitEqually(totalMinorUnits, participantCount) {
  if (participantCount <= 0) return [];
  const baseShare = Math.floor(totalMinorUnits / participantCount);
  const remainder = totalMinorUnits % participantCount;

  const shares = [];
  for (let i = 0; i < participantCount; i++) {
    shares.push(i < remainder ? baseShare + 1 : baseShare);
  }
  return shares;
}

/**
 * Split an amount by percentages.
 * Percentages array must sum to 100.
 * Guarantees sum(shares) === totalMinorUnits exactly.
 */
export function splitByPercentages(totalMinorUnits, percentages) {
  const shares = percentages.map(p => Math.floor((totalMinorUnits * p) / 100));
  const sumShares = shares.reduce((a, b) => a + b, 0);
  let remainder = totalMinorUnits - sumShares;

  for (let i = 0; i < shares.length && remainder > 0; i++) {
    shares[i] += 1;
    remainder -= 1;
  }
  return shares;
}

/**
 * Compute net balances for members across a list of expenses and settlements.
 * expenses: Array<{ payer: string, shares: Array<{ user: string, amountMinor: number }> }>
 * settlements: Array<{ payer: string, receiver: string, amountMinor: number, status: 'RECORDED' | 'COMPLETED' }>
 *
 * Returns Map<userId, netBalanceMinor>
 * Positive netBalance = member should receive money (+).
 * Negative netBalance = member owes money (-).
 */
export function calculateNetBalances(expenses, settlements = [], members = []) {
  const balances = new Map();

  // Initialize all known members to 0
  members.forEach(m => {
    const id = m._id ? m._id.toString() : m.toString();
    balances.set(id, 0);
  });

  // Factor in expenses
  for (const exp of expenses) {
    const payerId = exp.payer._id ? exp.payer._id.toString() : exp.payer.toString();
    const totalMinor = exp.shares.reduce((sum, s) => sum + s.amountMinor, 0);

    balances.set(payerId, (balances.get(payerId) || 0) + totalMinor);

    for (const share of exp.shares) {
      const uId = share.user._id ? share.user._id.toString() : share.user.toString();
      balances.set(uId, (balances.get(uId) || 0) - share.amountMinor);
    }
  }

  // Factor in recorded / completed settlements (transfers between payer and receiver)
  for (const st of settlements) {
    if (st.status === 'RECORDED' || st.status === 'COMPLETED') {
      const payerId = st.payer._id ? st.payer._id.toString() : st.payer.toString();
      const receiverId = st.receiver._id ? st.receiver._id.toString() : st.receiver.toString();
      // Payer paid money, so payer's debt is reduced (+ balance)
      balances.set(payerId, (balances.get(payerId) || 0) + st.amountMinor);
      // Receiver got money, so receiver's credit is reduced (- balance)
      balances.set(receiverId, (balances.get(receiverId) || 0) - st.amountMinor);
    }
  }

  return balances;
}

/**
 * Greedy algorithm to generate optimal settlement transfers that minimize number of transactions.
 * Input: Map<userId, netBalanceMinor>
 * Returns: Array<{ payer: string, receiver: string, amountMinor: number, amount: number }>
 */
export function generateSettlementSuggestions(balancesMap) {
  const debtors = []; // owes money (balance < 0)
  const creditors = []; // should receive money (balance > 0)

  for (const [userId, balance] of balancesMap.entries()) {
    if (balance < -1) {
      debtors.push({ userId, amount: -balance });
    } else if (balance > 1) {
      creditors.push({ userId, amount: balance });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0) {
      settlements.push({
        payer: debtor.userId,
        receiver: creditor.userId,
        amountMinor: transferAmount,
        amount: toMajorUnits(transferAmount)
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount <= 1) dIdx++;
    if (creditor.amount <= 1) cIdx++;
  }

  return settlements;
}
