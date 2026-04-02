import { ExpenseWithAttachments, Profile } from './types';

export interface SocioBalance {
  id: string;
  name: string;
  paid: number;
  expected: number;
  net: number; // paid - expected. Positive means user should receive, negative means user should pay.
}

export interface SettlementInstruction {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface ProjectBalance {
  totalProject: number;
  avgPerSocio: number;
  socioBalances: SocioBalance[];
  instructions: SettlementInstruction[];
}

/**
 * Calculates the financial balance between partners.
 * Assuming equal split for all registered socios.
 */
export function calculateProjectBalance(
  expenses: ExpenseWithAttachments[],
  socios: Profile[]
): ProjectBalance {
  const totalProject = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const socioCount = socios.length;
  const avgPerSocio = socioCount > 0 ? totalProject / socioCount : 0;

  // 1. Calculate how much each socio actually paid
  const paidMap: Record<string, number> = {};
  socios.forEach(s => { paidMap[s.id] = 0; });

  expenses.forEach(exp => {
    if (exp.expense_participants) {
      exp.expense_participants.forEach(p => {
        if (paidMap[p.user_id] !== undefined) {
          paidMap[p.user_id] += Number(p.amount_paid);
        }
      });
    }
  });

  // 2. Create socio balances
  const socioBalances: SocioBalance[] = socios.map(s => {
    const paid = paidMap[s.id] || 0;
    return {
      id: s.id,
      name: s.full_name || 'Sócio',
      paid,
      expected: avgPerSocio,
      net: paid - avgPerSocio, // Positive = credit, Negative = debt
    };
  });

  // 3. Generate settlement instructions (Who pays whom)
  const instructions: SettlementInstruction[] = [];
  
  // Clone balances for destructive calculation
  const debtors = socioBalances
    .filter(b => b.net < -0.01)
    .map(b => ({ ...b, net: Math.abs(b.net) }))
    .sort((a, b) => b.net - a.net);
    
  const creditors = socioBalances
    .filter(b => b.net > 0.01)
    .map(b => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    
    const amount = Math.min(debtor.net, creditor.net);
    
    if (amount > 0.01) {
      instructions.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: Number(amount.toFixed(2))
      });
    }

    debtor.net -= amount;
    creditor.net -= amount;

    if (debtor.net <= 0.01) dIdx++;
    if (creditor.net <= 0.01) cIdx++;
  }

  return {
    totalProject: Number(totalProject.toFixed(2)),
    avgPerSocio: Number(avgPerSocio.toFixed(2)),
    socioBalances,
    instructions
  };
}
