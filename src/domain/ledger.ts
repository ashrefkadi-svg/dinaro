/** Pure, integer-minor-unit financial core. No data persistence or bank API. */
export type TransactionType = "income" | "expense";
export type Posting = Readonly<{ accountId: string; amountMinor: bigint }>;
export type LedgerEntry = Readonly<{ id: string; currency: "DZD"; postings: readonly Posting[] }>;

export function parseDzdMinor(raw: string): bigint {
  const match = /^(0|[1-9][0-9]{0,12})(?:[.,]([0-9]{1,2}))?$/.exec(raw.trim());
  if (!match) throw new RangeError("Enter a valid amount with up to two decimals");
  const amount = BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2,"0") || "0");
  if (amount <= 0n) throw new RangeError("Amount must be positive");
  return amount;
}
export function formatDzdMinor(value: bigint, locale = "fr-DZ"): string {
  const negative=value<0n?"-":"";
  const amount=value<0n?-value:value;
  const units=new Intl.NumberFormat(locale,{maximumFractionDigits:0}).format(amount/100n);
  const minor=amount%100n;
  return negative+units+(minor?","+String(minor).padStart(2,"0"):"")+" دج";
}
function checkPositive(value: bigint) {
  if (typeof value !== "bigint" || value <= 0n) throw new RangeError("Amount must be a positive bigint");
}
function checkId(value: string) {
  if (typeof value !== "string" || !value.trim()) throw new RangeError("Empty account or transaction ID");
}
export function validateEntry(entry: LedgerEntry): void {
  checkId(entry.id);
  if (entry.currency!=="DZD" || entry.postings.length<2) throw new RangeError("Invalid entry");
  let sum=0n;
  const accounts=new Set<string>();
  for(const posting of entry.postings){
    checkId(posting.accountId);
    if(typeof posting.amountMinor!=="bigint" || posting.amountMinor===0n) throw new RangeError("Invalid posting amount");
    if(accounts.has(posting.accountId)) throw new RangeError("Duplicate account posting");
    accounts.add(posting.accountId);
    sum+=posting.amountMinor;
  }
  if(sum!==0n) throw new RangeError("Unbalanced entry");
}
function makeEntry(id: string, postings: readonly Posting[]): LedgerEntry {
  const entry: LedgerEntry={id,currency:"DZD",postings};
  validateEntry(entry);
  return entry;
}
export function buildOpeningEntry(id: string, accountId: string, amountMinor: bigint): LedgerEntry {
  checkPositive(amountMinor);
  return makeEntry(id,[{accountId,amountMinor},{accountId:"system:opening",amountMinor:-amountMinor}]);
}
export function buildTransactionEntry(args:{id:string;accountId:string;type:TransactionType;amountMinor:bigint}):LedgerEntry{
  checkPositive(args.amountMinor);
  if(args.type!=="income"&&args.type!=="expense")throw new RangeError("Invalid type");
  const sign=args.type==="income"?1n:-1n;
  return makeEntry(args.id,[
    {accountId:args.accountId,amountMinor:sign*args.amountMinor},
    {accountId:args.type==="income"?"category:income":"category:expense",amountMinor:-sign*args.amountMinor}
  ]);
}
export function buildTransferEntry(id:string,from:string,to:string,amountMinor:bigint):LedgerEntry{
  checkPositive(amountMinor);
  if(from===to)throw new RangeError("Cannot transfer to same account");
  return makeEntry(id,[{accountId:from,amountMinor:-amountMinor},{accountId:to,amountMinor}]);
}
export function ledgerBalance(entries: readonly LedgerEntry[],accountId:string):bigint{
  checkId(accountId);
  const seen=new Set<string>();
  let total=0n;
  for(const entry of entries){
    validateEntry(entry);
    if(seen.has(entry.id))throw new RangeError("Duplicate event ID");
    seen.add(entry.id);
    for(const posting of entry.postings)if(posting.accountId===accountId)total+=posting.amountMinor;
  }
  return total;
}
