/**
 * Settlement Service
 * Calculates balances (net amounts owed or to receive) and computes
 * the minimal number of payment transactions using the Greedy Min-Cash Flow algorithm.
 */

function calculateSettlements(expenses, tripFriends = [], tripOwnerName = 'You') {
  // Map of participant name -> net balance (positive = owed money, negative = owes money)
  const balances = {};

  // Ensure all trip participants exist in balances with 0
  if (tripOwnerName) balances[tripOwnerName] = 0;
  tripFriends.forEach((f) => {
    if (f.name) balances[f.name] = 0;
  });

  // Calculate net balances from all expenses
  expenses.forEach((expense) => {
    const payerName = expense.payer?.name || tripOwnerName;
    const totalAmount = Number(expense.amount) || 0;

    if (!balances[payerName]) balances[payerName] = 0;
    balances[payerName] += totalAmount; // Payer is credited the full amount they paid

    if (expense.participants && expense.participants.length > 0) {
      expense.participants.forEach((p) => {
        const participantName = p.name;
        const share = Number(p.shareAmount) || 0;
        if (balances[participantName] === undefined) balances[participantName] = 0;
        balances[participantName] -= share; // Participant is debited their share
      });
    } else {
      // If no participants listed, it was personal for payer or split equally with all trip friends
      balances[payerName] -= totalAmount;
    }
  });

  // Round balances to 2 decimal places to avoid floating point precision issues
  Object.keys(balances).forEach((person) => {
    balances[person] = Math.round(balances[person] * 100) / 100;
  });

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([person, balance]) => {
    if (balance > 0.01) {
      creditors.push({ person, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ person, amount: -balance }); // store as positive debt
    }
  });

  // Sort creditors descending, debtors descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy match to minimize transaction count
  const settlements = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const payment = Math.min(creditor.amount, debtor.amount);
    const roundedPayment = Math.round(payment * 100) / 100;

    if (roundedPayment > 0) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: roundedPayment,
      });
    }

    creditor.amount = Math.round((creditor.amount - payment) * 100) / 100;
    debtor.amount = Math.round((debtor.amount - payment) * 100) / 100;

    if (creditor.amount <= 0.01) cIdx++;
    if (debtor.amount <= 0.01) dIdx++;
  }

  // Summary stats
  const participantBalances = Object.entries(balances).map(([person, netBalance]) => ({
    name: person,
    netBalance,
    status: netBalance > 0.01 ? 'gets_back' : netBalance < -0.01 ? 'owes' : 'settled',
  }));

  return {
    balances: participantBalances,
    suggestedSettlements: settlements,
    totalSplitExpenses: expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
  };
}

module.exports = { calculateSettlements };

