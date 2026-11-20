import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Droplets,
  Info,
  Milk,
  Minus,
  Package,
  Plus,
  ReceiptText,
  RotateCcw,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';

type Frequency = 'less' | 'standard' | 'more';
type PantryItem = {
  id: string;
  name: string;
  baseDays: number;
  frequency: Frequency;
};
type Household = { preset: string; adults: number; kids: number };
type OrderLine = { id: string; name: string; quantity: number };
type SimulatedOrder = { id: number; placedAt: Date; lines: OrderLine[] };

// baseDays = demo estimate for the reference household (2 adults, 2 kids under 10).
const initialItems: PantryItem[] = [
  { id: 'kids-body-wash', name: 'Kids Body Wash', baseDays: 14, frequency: 'standard' },
  { id: 'dishwasher-pods', name: 'Dishwasher Pods', baseDays: 21, frequency: 'standard' },
  { id: 'whole-milk', name: 'Whole Milk', baseDays: 4, frequency: 'standard' },
  { id: 'hand-soap-refill', name: 'Hand Soap Refill', baseDays: 30, frequency: 'standard' },
];

const OTHER = 'Other household';
const householdPresets: Household[] = [
  { preset: '2 Adults, 2 Kids under 10', adults: 2, kids: 2 },
  { preset: '1 Adult, 1 Kid', adults: 1, kids: 1 },
  { preset: '2 Adults', adults: 2, kids: 0 },
  { preset: OTHER, adults: 0, kids: 0 },
];
const householdOptions = householdPresets.map((option) => option.preset);

// Simple, visible rule (not AI): how much of each item a household uses per day,
// relative to the reference household of 2 adults + 2 kids.
const usageRule: Record<string, (adults: number, kids: number) => number> = {
  'kids-body-wash': (_adults, kids) => kids,
  'whole-milk': (adults, kids) => adults + 1.5 * kids,
  'dishwasher-pods': (adults, kids) => 1 + 0.5 * (adults + kids),
  'hand-soap-refill': (adults, kids) => adults + kids,
};
const frequencyFactor: Record<Frequency, number> = { less: 1.25, standard: 1, more: 0.75 };
const MAX_DAYS = 90;
const PLENTY_LEFT_DAYS = 30;

/** Returns estimated days until an item runs out, or null when the item doesn't apply to this household. */
function estimateDays(item: PantryItem, household: Household): number | null {
  const rule = usageRule[item.id];
  const usage = rule(household.adults, household.kids);
  if (usage <= 0) return null;
  const reference = rule(2, 2);
  const days = item.baseDays * (reference / usage) * frequencyFactor[item.frequency];
  return Math.min(MAX_DAYS, Math.max(1, Math.round(days)));
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function householdLabel(household: Household) {
  if (household.preset !== OTHER) return household.preset;
  return household.kids > 0 ? `${plural(household.adults, 'Adult')}, ${plural(household.kids, 'Kid')}` : plural(household.adults, 'Adult');
}

function householdBasis(household: Household) {
  return `${plural(household.adults, 'adult')}, ${plural(household.kids, 'kid')}`;
}

const frequencyLabel: Record<Frequency, string> = { less: 'less frequent use', standard: 'standard use', more: 'more frequent use' };
const frequencies: { value: Frequency; label: string }[] = [
  { value: 'less', label: 'Less Frequent' },
  { value: 'standard', label: 'Standard' },
  { value: 'more', label: 'More Frequent' },
];

function dateIn(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function Brand() {
  return (
    <div className="brand" data-testid="brand-smart-pantry">
      <span className="brand-mark"><Package size={20} strokeWidth={1.8} aria-hidden="true" /></span>
      <span className="brand-name">SmartPantry</span>
    </div>
  );
}

function ItemIcon({ id }: { id: string }) {
  const icon = id === 'whole-milk'
    ? <Milk size={23} strokeWidth={1.7} />
    : id === 'dishwasher-pods'
      ? <Package size={23} strokeWidth={1.7} />
      : <Droplets size={23} strokeWidth={1.7} />;
  return (
    <span className="item-symbol" aria-hidden="true">
      {icon}
    </span>
  );
}

function CountStepper({ label, value, min, max, onChange, testId }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; testId: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12px]">
      <span className="font-semibold">{label}</span>
      <div className="stepper" role="group" aria-label={`Number of ${label.toLowerCase()}`}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`} data-testid={`button-${testId}-decrease`}><Minus size={16} aria-hidden="true" /></button>
        <output aria-live="polite" data-testid={`text-${testId}`}>{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`} data-testid={`button-${testId}-increase`}><Plus size={16} aria-hidden="true" /></button>
      </div>
    </div>
  );
}

function HouseholdPicker({ household, onChange }: { household: Household; onChange: (household: Household) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose household size">
        {householdOptions.map((option) => (
          <button
            key={option}
            type="button"
            data-testid={`button-household-${option.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            aria-pressed={household.preset === option}
            onClick={() => {
              const preset = householdPresets.find((entry) => entry.preset === option)!;
              onChange(option === OTHER && household.preset === OTHER ? household : { ...preset });
            }}
            className={`min-h-11 rounded-full border px-4 text-[12px] font-semibold transition-colors ${household.preset === option ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]'}`}
          >{option}</button>
        ))}
      </div>
      {household.preset === OTHER && (
        <div className="panel mt-3 max-w-[450px] px-4 py-2" data-testid="panel-other-household">
          <p className="pt-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Who lives with you? Estimates use these counts.</p>
          <CountStepper label="Adults" value={household.adults} min={0} max={8} testId="adults" onChange={(adults) => onChange({ ...household, adults })} />
          <CountStepper label="Kids" value={household.kids} min={0} max={8} testId="kids" onChange={(kids) => onChange({ ...household, kids })} />
        </div>
      )}
    </div>
  );
}

function OrderHistory({ orders }: { orders: SimulatedOrder[] }) {
  return (
    <section className="mt-10" aria-labelledby="history-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 id="history-heading" className="section-title">Order history</h3>
        </div>
        <span className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]" data-testid="text-order-count">{orders.length} simulated</span>
      </div>
      {orders.length === 0 ? (
        <div className="panel flex items-center gap-4 p-5 text-[13px] text-[hsl(var(--muted-foreground))]" data-testid="status-no-orders">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[hsl(var(--muted))]"><ReceiptText size={20} aria-hidden="true" /></span>
          Your simulated orders will appear here after you place one.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="history-card" data-testid={`card-order-${order.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold">Simulated order {String(order.id).padStart(2, '0')}</p>
                  <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--muted-foreground))]">{order.lines.map((line) => `${line.quantity} × ${line.name}`).join(' · ')}</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(order.placedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [active, setActive] = useState(false);
  const [household, setHousehold] = useState<Household>({ ...householdPresets[0] });
  // Estimates only use a complete household; while counts are incomplete, the last complete one stays applied.
  const [appliedHousehold, setAppliedHousehold] = useState<Household>({ ...householdPresets[0] });
  const [householdError, setHouseholdError] = useState('');
  const [editingHousehold, setEditingHousehold] = useState(false);
  const [householdNotice, setHouseholdNotice] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [orderedThisSession, setOrderedThisSession] = useState<Record<string, number>>({});
  const [source, setSource] = useState('Demo receipt');
  const [imageSelected, setImageSelected] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<SimulatedOrder[]>([]);
  const [latestOrder, setLatestOrder] = useState<SimulatedOrder | null>(null);
  const [cadenceOpen, setCadenceOpen] = useState(false);
  const [basketError, setBasketError] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);
  const basketRef = useRef<HTMLElement>(null);

  const basketLines = items.filter((item) => (basket[item.id] ?? 0) > 0).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: basket[item.id],
  }));
  const totalUnits = basketLines.reduce((total, line) => total + line.quantity, 0);
  const estimates: Record<string, number | null> = Object.fromEntries(items.map((item) => [item.id, estimateDays(item, appliedHousehold)]));
  function flagFor(id: string): string | null {
    const days = estimates[id];
    if (days === null) return 'No kids in this household, so this may not apply.';
    if (days > PLENTY_LEFT_DAYS) return `Est. ${days} days left, so you may not need it yet.`;
    return null;
  }
  const flaggedLines = basketLines.filter((line) => flagFor(line.id));

  function householdIsValid(next: Household) {
    return next.adults >= 1;
  }

  function changeHousehold(next: Household) {
    setHousehold(next);
    setReviewOpen(false);
    if (householdIsValid(next)) {
      setAppliedHousehold(next);
      setHouseholdError('');
      if (active) setHouseholdNotice(`Estimates updated for ${householdLabel(next)}.`);
    } else {
      setHouseholdNotice('');
    }
  }

  function requireHousehold() {
    if (!householdIsValid(household)) {
      setHouseholdError('Add at least one adult under Other household so estimates fit your home.');
      return false;
    }
    setHouseholdError('');
    return true;
  }

  function beginWithDemo() {
    if (!requireHousehold()) return;
    setSource('Demo receipt');
    setImageSelected(false);
    setActive(true);
  }

  function chooseImage(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Choose a PNG, JPG, or WEBP image to continue.');
      return;
    }
    setUploadError('');
    if (!requireHousehold()) return;
    // The image is never read, parsed, or transmitted.
    setSource('demo sample data (uploaded file not read)');
    setImageSelected(true);
    setActive(true);
  }

  function changeQuantity(id: string, quantity: number) {
    setBasketError('');
    setReviewOpen(false);
    setBasket((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(99, quantity);
      return next;
    });
  }

  function updateFrequency(id: string, frequency: Frequency) {
    setReviewOpen(false);
    setItems((current) => current.map((item) => item.id === id ? { ...item, frequency } : item));
  }

  function removeFlagged() {
    setBasket((current) => {
      const next = { ...current };
      flaggedLines.forEach((line) => delete next[line.id]);
      return next;
    });
    setReviewOpen(false);
  }

  function placeOrder(confirmed = false) {
    if (basketLines.length === 0) {
      setBasketError('Add at least one item to your basket first.');
      return;
    }
    if (!householdIsValid(household)) {
      setBasketError('Add at least one adult to your household before ordering.');
      setEditingHousehold(true);
      return;
    }
    // Safeguard: pause and let the parent review items the estimate says they may not need yet.
    if (!confirmed && flaggedLines.length > 0) {
      setReviewOpen(true);
      return;
    }
    setReviewOpen(false);
    setOrderedThisSession((current) => {
      const next = { ...current };
      basketLines.forEach((line) => { next[line.id] = (next[line.id] ?? 0) + line.quantity; });
      return next;
    });
    const order: SimulatedOrder = { id: orders.length + 1, placedAt: new Date(), lines: basketLines };
    setOrders((current) => [order, ...current]);
    setLatestOrder(order);
    setBasket({});
    setBasketError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand />
        <span className="header-tag">Demo · No real orders</span>
        {active && <span className="rounded-full border border-white/40 px-3 py-1.5 text-[12px] font-semibold text-white md:hidden">Demo</span>}
      </header>

      {!active ? (
        <main className="page-wrap intro-grid">
          <div className="animate-rise-in">
            <h1 className="display-title max-w-[560px]">Restock your household essentials</h1>
            <p className="muted-copy mt-6 max-w-[450px] text-[16px]">Start with four everyday staples. Add what you need and try an in-app reorder in a few taps. No account or checkout.</p>
            <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={beginWithDemo} data-testid="button-use-demo-receipt">
              Use Demo Receipt Data <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">Demo only. Nothing is purchased.</p>
            <div className="mt-9">
              <p className="mb-3 text-[13px] font-bold">Your household</p>
              <HouseholdPicker household={household} onChange={changeHousehold} />
              <p className="mt-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Your household sets the starting run-out estimates. You can change it later.</p>
              {householdError && <p role="alert" className="mt-2 text-[12px] text-[hsl(var(--destructive))]" data-testid="text-household-error">{householdError}</p>}
            </div>
            <div className="my-6 flex items-center gap-3 max-w-[450px]"><span className="h-px flex-1 bg-[hsl(var(--border))]" /><span className="text-[13px] text-[hsl(var(--muted-foreground))]">or use a screenshot</span><span className="h-px flex-1 bg-[hsl(var(--border))]" /></div>
            <input
              ref={uploadRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label="Choose a receipt screenshot"
              data-testid="input-receipt"
              onChange={(event) => chooseImage(event.target.files?.[0])}
            />
            <button type="button" className="upload-target max-w-[450px]" onClick={() => uploadRef.current?.click()} data-testid="button-upload-receipt">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white"><Upload size={21} aria-hidden="true" /></span>
              <span><strong className="block text-[13px]">Choose a screenshot</strong><span className="mt-1 block text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">PNG, JPG or WEBP · Moves straight to the demo pantry</span></span>
            </button>
            {uploadError && <p role="alert" className="mt-2 text-[12px] text-[hsl(var(--destructive))]" data-testid="text-upload-error">{uploadError}</p>}
            <p className="mt-4 flex max-w-[450px] items-start gap-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"><ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Your image stays on this device. It is not read, uploaded, or used to identify items. Both paths open the same four demo items.</p>
          </div>
          <div className="intro-art animate-rise-in stagger-1" aria-hidden="true">
            <div className="art-sheet">
              <div className="flex items-center justify-between"><span className="text-[18px] font-bold">Your staples</span><ReceiptText size={20} strokeWidth={1.75} /></div>
              <p className="mt-1 text-[13px] text-[hsl(var(--muted-foreground))]">From the demo receipt</p>
              <div className="art-line" />
              {initialItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-[15px]">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-[13px] text-[hsl(var(--muted-foreground))]">Reorder</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : latestOrder ? (
        <main className="page-wrap max-w-[800px] py-12 pb-24 sm:py-20 animate-rise-in">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-black text-white"><Check size={27} aria-hidden="true" /></div>
          <p className="eyebrow mt-6">Simulated order #{latestOrder.id}</p>
          <h1 className="display-title mt-2">Order placed</h1>
          <p className="muted-copy mt-5 max-w-[550px] text-[15px]">Your basket has been cleared and the order is saved for this session. Nothing was purchased, charged, or delivered.</p>
          <div className="panel mt-6 flex max-w-[620px] items-start gap-3 p-4 text-[12px] leading-5" data-testid="text-order-effect">
            <Info size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p><strong>What this order changed:</strong> it was saved to this session's history. Because nothing is delivered, your run-out estimates stay the same and the pantry will show these items as ordered. In a full version, a delivered order would restart that item's estimate.</p>
          </div>
          <section className="panel mt-9 overflow-hidden" aria-labelledby="confirmation-heading" data-testid="card-order-confirmation">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-5 py-5 sm:px-7"><ReceiptText size={20} aria-hidden="true" /><h2 id="confirmation-heading" className="text-[14px] font-bold">Order summary</h2></div>
            <div className="divide-y divide-[hsl(var(--border))] px-5 sm:px-7">
              {latestOrder.lines.map((line) => <div key={line.id} className="flex justify-between gap-4 py-4 text-[13px]" data-testid={`text-confirmed-item-${line.id}`}><span>{line.name}</span><strong className="font-mono">{line.quantity} ×</strong></div>)}
            </div>
            <div className="flex justify-between gap-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] px-5 py-4 text-[12px] sm:px-7"><span>Items in this simulated order</span><strong data-testid="text-confirmed-count">{latestOrder.lines.reduce((sum, line) => sum + line.quantity, 0)}</strong></div>
          </section>
          <button type="button" className="btn btn-primary mt-7 w-full sm:w-auto" onClick={() => { setLatestOrder(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} data-testid="button-order-again">
            <RotateCcw size={17} aria-hidden="true" /> Order again
          </button>
          <OrderHistory orders={orders} />
        </main>
      ) : (
        <main className="page-wrap pantry-layout">
          <div className="min-w-0 animate-rise-in">
            <h1 className="display-title">What do you need?</h1>
            <p className="muted-copy mt-5 max-w-[550px] text-[14px]">Choose your everyday essentials, adjust the quantities, and place a simulated order. No real checkout happens here.</p>
            <div className="mt-7 flex flex-wrap items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              <button type="button" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] px-3 py-2 font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/.6)]" aria-expanded={editingHousehold} aria-controls="household-editor" onClick={() => setEditingHousehold(!editingHousehold)} data-testid="button-change-household">
                <span data-testid="text-household">{householdLabel(household)}</span><Pencil size={12} aria-hidden="true" /><span className="underline underline-offset-2">Change</span>
              </button>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-2">Source: {source}</span>
            </div>
            {editingHousehold && (
              <div id="household-editor" className="mt-4" data-testid="panel-household-editor">
                <HouseholdPicker household={household} onChange={changeHousehold} />
                <button type="button" className="btn btn-light mt-3" onClick={() => setEditingHousehold(false)} disabled={!householdIsValid(household)} data-testid="button-household-done">Done</button>
                {!householdIsValid(household) && <p role="alert" className="mt-2 text-[12px] text-[hsl(var(--destructive))]">Add at least one adult so estimates fit your home. Estimates still use {householdLabel(appliedHousehold)} until you do.</p>}
              </div>
            )}
            <p aria-live="polite" className="mt-2 text-[12px] font-semibold text-[hsl(var(--foreground))]" data-testid="text-household-notice">{householdNotice}</p>
            {imageSelected && <p className="mt-3 text-[13px] leading-5 text-[hsl(var(--muted-foreground))]" data-testid="text-upload-demo-notice">This demo doesn't read uploaded images. These are sample items, not what's in your image.</p>}
            <div className="mt-10 flex items-end justify-between gap-3">
              <div><h2 className="section-title">Your staples</h2></div>
              <span className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">4 items</span>
            </div>
            <div className="panel mt-5 overflow-hidden">
              {items.map((item) => {
                const quantity = basket[item.id] ?? 0;
                const days = estimates[item.id];
                const ordered = orderedThisSession[item.id];
                return (
                  <div key={item.id} className="item-row" data-testid={`active-item-${item.id}`}>
                    <ItemIcon id={item.id} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold leading-5">{item.name}</h3>
                      {days === null ? (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--foreground))]" data-testid={`text-runout-${item.id}`}><AlertTriangle size={12} aria-hidden="true" /> May not apply: no kids in this household</p>
                      ) : (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`text-runout-${item.id}`}><Clock3 size={12} aria-hidden="true" /> Est. {days} days · {dateIn(days)}</p>
                      )}
                      <p className="mt-0.5 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]" data-testid={`text-basis-${item.id}`}>Based on {householdBasis(appliedHousehold)} · {frequencyLabel[item.frequency]}</p>
                      {ordered && <p className="mt-1 inline-block rounded-full bg-[hsl(var(--accent)/.55)] px-2 py-0.5 text-[10px] font-semibold" data-testid={`text-ordered-${item.id}`}>Ordered {ordered} this session (simulated) · estimate unchanged</p>}
                    </div>
                    <div className="item-action shrink-0">
                      {quantity === 0 ? (
                        <button type="button" className="btn btn-light" onClick={() => changeQuantity(item.id, 1)} data-testid={`button-add-${item.id}`} aria-label={`Add ${item.name} to basket`}><Plus size={16} aria-hidden="true" /> {days === null ? 'Add anyway' : 'Add'}</button>
                      ) : (
                        <div className="stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button type="button" onClick={() => changeQuantity(item.id, quantity - 1)} aria-label={`Decrease ${item.name} quantity${quantity === 1 ? ' and remove from basket' : ''}`} data-testid={`button-decrease-${item.id}`}><Minus size={16} aria-hidden="true" /></button>
                          <output aria-live="polite" aria-label={`${item.name} quantity`} data-testid={`text-quantity-${item.id}`}>{quantity}</output>
                          <button type="button" onClick={() => changeQuantity(item.id, quantity + 1)} disabled={quantity >= 99} aria-label={`Increase ${item.name} quantity`} data-testid={`button-increase-${item.id}`}><Plus size={16} aria-hidden="true" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Dates are demo estimates from a simple household rule (who lives with you and how often you use each item), not a scanned receipt, AI prediction, or live stock levels. Check them before you order.</p>
          </div>

          <aside className="basket-panel animate-rise-in stagger-1" ref={basketRef} aria-labelledby="basket-heading" data-testid="panel-basket">
            <div className="flex items-start justify-between gap-3">
              <div><h2 id="basket-heading" className="text-[24px] font-bold tracking-[-.015em]">Your basket</h2></div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white"><ShoppingBag size={20} aria-hidden="true" /></span>
            </div>
            {basketLines.length === 0 ? (
              <div className="mt-7 rounded-2xl border border-dashed border-[hsl(var(--sidebar-border))] px-5 py-8 text-center" data-testid="status-empty-basket">
                <ShoppingBag size={24} className="mx-auto" aria-hidden="true" />
                <p className="mt-3 text-[13px] font-semibold">Nothing in your basket yet.</p>
                <p className="mt-1 text-[11px] leading-5 text-[hsl(var(--sidebar-foreground)/.65)]">Tap Add beside anything you’d like to reorder.</p>
              </div>
            ) : (
              <div className="mt-5" aria-live="polite">
                {basketLines.map((line) => <div key={line.id} className="basket-line" data-testid={`basket-item-${line.id}`}>
                  <div className="min-w-0"><p className="text-[12px] font-semibold">{line.name}</p><p className="mt-1 font-mono text-[10px] text-[hsl(var(--sidebar-foreground)/.65)]">Quantity {line.quantity}</p>{flagFor(line.id) && <p className="mt-1 flex items-start gap-1 text-[10px] leading-4 text-[hsl(var(--sidebar-primary))]" data-testid={`text-flag-${line.id}`}><AlertTriangle size={11} className="mt-0.5 shrink-0" aria-hidden="true" />{flagFor(line.id)}</p>}</div>
                  <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" onClick={() => changeQuantity(line.id, 0)} aria-label={`Remove ${line.name} from basket`} data-testid={`button-remove-${line.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                </div>)}
                <div className="flex justify-between py-5 text-[12px]"><span className="text-[hsl(var(--sidebar-foreground)/.7)]">Total items</span><strong className="font-mono" data-testid="text-basket-count">{totalUnits}</strong></div>
              </div>
            )}
            {reviewOpen && flaggedLines.length > 0 ? (
              <div className="mt-5 rounded-xl border border-[hsl(var(--sidebar-primary))] bg-white p-4" role="alertdialog" aria-labelledby="review-heading" data-testid="panel-review">
                <p id="review-heading" className="flex items-center gap-2 text-[13px] font-bold"><AlertTriangle size={15} aria-hidden="true" />Check before you order</p>
                <p className="mt-1 text-[11px] leading-5 text-[hsl(var(--sidebar-foreground)/.75)]">Based on your household, you may not need {flaggedLines.length === 1 ? 'this item' : 'these items'} yet:</p>
                <ul className="mt-2 space-y-1 text-[11px] leading-5">
                  {flaggedLines.map((line) => <li key={line.id} data-testid={`review-item-${line.id}`}><strong>{line.name}:</strong> {flagFor(line.id)}</li>)}
                </ul>
                <div className="mt-4 grid gap-2">
                  <button type="button" className="btn btn-accent w-full" onClick={removeFlagged} data-testid="button-remove-flagged">Remove {flaggedLines.length === 1 ? 'it' : 'them'} from basket</button>
                  <button type="button" className="btn w-full border-[hsl(var(--border))] bg-white text-black hover:bg-[hsl(var(--muted))]" onClick={() => placeOrder(true)} data-testid="button-order-anyway">Order anyway</button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn btn-accent mt-5 w-full" onClick={() => placeOrder()} data-testid="button-place-order">Place simulated order <ArrowRight size={16} aria-hidden="true" /></button>
            )}
            {basketError && <p role="alert" className="mt-3 text-[13px] font-medium text-[hsl(var(--destructive))]" data-testid="text-basket-error">{basketError}</p>}
            <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-[hsl(var(--sidebar-foreground)/.65)]"><ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />No payment, purchase, or delivery. This is a session-only prototype.</p>
          </aside>
          <div className="col-span-full max-w-[805px]">
            <section className="panel overflow-hidden" aria-labelledby="cadence-heading">
              <button type="button" className="flex min-h-[72px] w-full items-center justify-between gap-4 px-5 text-left sm:px-6" aria-expanded={cadenceOpen} aria-controls="cadence-content" onClick={() => setCadenceOpen(!cadenceOpen)} data-testid="button-toggle-cadence">
                <span><strong id="cadence-heading" className="block text-[13px]">Adjust usage estimates</strong><span className="mt-1 block text-[11px] text-[hsl(var(--muted-foreground))]">Optional · change how soon an item may run out</span></span>
                {cadenceOpen ? <ChevronUp size={19} aria-hidden="true" /> : <ChevronDown size={19} aria-hidden="true" />}
              </button>
              {cadenceOpen && <div id="cadence-content" className="divide-y divide-[hsl(var(--border))] border-t border-[hsl(var(--border))] px-5 sm:px-6">
                {items.map((item) => <div key={item.id} className="py-4">
                  <div className="flex items-center justify-between gap-2 text-[12px]"><strong>{item.name}</strong><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{estimates[item.id] === null ? 'May not apply' : `${estimates[item.id]} days`}</span></div>
                  <div className="cadence-options" role="group" aria-label={`Usage frequency for ${item.name}`}>
                    {frequencies.map((option) => <button key={option.value} type="button" aria-pressed={item.frequency === option.value} onClick={() => updateFrequency(item.id, option.value)} data-testid={`button-frequency-${item.id}-${option.value}`}>{option.label}</button>)}
                  </div>
                </div>)}
              </div>}
            </section>
            <OrderHistory orders={orders} />
          </div>
          {totalUnits > 0 && <div className="mobile-basket-bar" aria-label="Basket shortcut">
            <span className="text-[12px] font-semibold"><span className="block text-[12px] text-[hsl(var(--muted-foreground))]">Your basket</span>{totalUnits} {totalUnits === 1 ? 'item' : 'items'} ready</span>
            <button type="button" className="btn btn-primary" onClick={() => basketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} data-testid="button-view-basket">View basket <ArrowRight size={16} aria-hidden="true" /></button>
          </div>}
        </main>
      )}
    </div>
  );
}