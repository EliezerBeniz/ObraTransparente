import { ExpenseWithAttachments, Profile } from './types';

export interface Advance {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  description?: string | null;
}

export interface SocioBalance {
  id: string;
  name: string;
  paid: number;         // Direct payments via expense_participants + advances
  expected: number;     // Fair share
  net: number;          // paid - expected. Positive = should receive, Negative = should pay
  advancesTotal: number;
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
  totalFromFund: number;    // Expenses paid by the common fund
  totalDeposited: number;   // Total advances deposited
}

/**
 * Calculates the financial balance between partners.
 * Assuming equal split for all registered socios.
 * 
 * IMPORTANT: It is recommended to filter expenses by status (e.g. 'Pago') 
 * before passing them to this function if you intend to calculate a 
 * settled financial balance.
 * 
 * Three sources of "who paid":
 * 1. expense_participants — direct partner payments on individual expenses
 * 2. advances — deposits to the common fund (attributed to the depositing partner)
 *    These cover expenses marked as paid_from_fund
 *
 * The total project cost is split equally, and each partner's share of fund
 * deposits plus direct payments counts as their total contribution.
 */
export function calculateProjectBalance(
  expenses: ExpenseWithAttachments[],
  socios: Profile[],
  advances: Advance[] = []
): ProjectBalance {
  const totalProject = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalFromFund = expenses
    .filter((e: any) => e.paid_from_fund)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDeposited = advances.reduce((sum, a) => sum + Number(a.amount), 0);

  const socioCount = socios.length;
  const avgPerSocio = socioCount > 0 ? totalProject / socioCount : 0;

  // 1. Calculate direct payments per socio (from expense_participants)
  const directPaidMap: Record<string, number> = {};
  socios.forEach(s => { directPaidMap[s.id] = 0; });

  expenses.forEach(exp => {
    if (exp.expense_participants) {
      exp.expense_participants.forEach(p => {
        if (directPaidMap[p.user_id] !== undefined) {
          directPaidMap[p.user_id] += Number(p.amount_paid);
        }
      });
    }
  });

  // 2. Calculate advance contributions per socio
  const advancesMap: Record<string, number> = {};
  socios.forEach(s => { advancesMap[s.id] = 0; });

  advances.forEach(adv => {
    if (advancesMap[adv.user_id] !== undefined) {
      advancesMap[adv.user_id] += Number(adv.amount);
    }
  });

  // 3. Build socio balances — total paid = direct + advances
  const socioBalances: SocioBalance[] = socios.map(s => {
    const direct = directPaidMap[s.id] || 0;
    const advancesTotal = advancesMap[s.id] || 0;
    const paid = direct + advancesTotal;
    return {
      id: s.id,
      name: s.full_name || 'Sócio',
      paid,
      advancesTotal,
      expected: avgPerSocio,
      net: paid - avgPerSocio,
    };
  });

  // 4. Generate settlement instructions
  const instructions: SettlementInstruction[] = [];

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
    instructions,
    totalFromFund: Number(totalFromFund.toFixed(2)),
    totalDeposited: Number(totalDeposited.toFixed(2)),
  };
}
