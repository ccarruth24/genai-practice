import { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Droplets,
  Milk,
  Minus,
  Package,
  Plus,
  ReceiptText,
  RotateCcw,
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
  daysToRunOut: number;
  frequency: Frequency;
};
type OrderLine = { id: string; name: string; quantity: number };
type SimulatedOrder = { id: number; placedAt: Date; lines: OrderLine[] };

const initialItems: PantryItem[] = [
  { id: 'kids-body-wash', name: 'Kids Body Wash', baseDays: 14, daysToRunOut: 14, frequency: 'standard' },
  { id: 'dishwasher-pods', name: 'Dishwasher Pods', baseDays: 21, daysToRunOut: 21, frequency: 'standard' },
  { id: 'whole-milk', name: 'Whole Milk', baseDays: 4, daysToRunOut: 4, frequency: 'standard' },
  { id: 'hand-soap-refill', name: 'Hand Soap Refill', baseDays: 30, daysToRunOut: 30, frequency: 'standard' },
];

const householdOptions = ['2 Adults, 2 Kids under 10', '1 Adult, 1 Kid', '2 Adults', 'Other household'];
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
    <span className={`item-symbol ${id === 'whole-milk' ? 'bg-[hsl(34_73%_88%)]' : id === 'dishwasher-pods' ? 'bg-[hsl(343_27%_89%)]' : 'bg-[hsl(38_77%_83%)]'}`} aria-hidden="true">
      {icon}
    </span>
  );
}

function OrderHistory({ orders }: { orders: SimulatedOrder[] }) {
  return (
    <section className="mt-10" aria-labelledby="history-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">This session only</p>
          <h3 id="history-heading" className="section-title mt-2">Order history</h3>
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
  const [household, setHousehold] = useState(householdOptions[0]);
  const [source, setSource] = useState('Demo receipt');
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

  function beginWithDemo() {
    setSource('Demo receipt');
    setActive(true);
  }

  function chooseImage(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Choose a PNG, JPG, or WEBP image to continue.');
      return;
    }
    setUploadError('');
    // Only the filename is kept. The image is never read, parsed, or transmitted.
    setSource(file.name);
    setActive(true);
  }

  function changeQuantity(id: string, quantity: number) {
    setBasketError('');
    setBasket((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(99, quantity);
      return next;
    });
  }

  function updateFrequency(id: string, frequency: Frequency) {
    const factor: Record<Frequency, number> = { less: 1.25, standard: 1, more: 0.75 };
    setItems((current) => current.map((item) => item.id === id
      ? { ...item, frequency, daysToRunOut: Math.max(1, Math.round(item.baseDays * factor[frequency])) }
      : item));
  }

  function placeOrder() {
    if (basketLines.length === 0) {
      setBasketError('Add at least one item before placing a simulated order.');
      return;
    }
    const order: SimulatedOrder = { id: orders.length + 1, placedAt: new Date(), lines: basketLines };
    setOrders((current) => [order, ...current]);
    setLatestOrder(order);
    setBasket({});
    setBasketError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell pantry-noise">
      <header className="site-header">
        <Brand />
        <span className="header-tag">A calmer way to reorder · Demo only</span>
        {active && <span className="rounded-full border border-[hsl(var(--border))] px-3 py-2 font-mono text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))] md:hidden">Demo pantry</span>}
      </header>

      {!active ? (
        <main className="page-wrap intro-grid">
          <div className="animate-rise-in">
            <p className="eyebrow">The everyday essentials, sorted</p>
            <h1 className="display-title mt-5 max-w-[600px]">More of what<br />you need.</h1>
            <p className="muted-copy mt-6 max-w-[450px] text-[16px]">Start with four everyday staples. Add what you need and try an in-app reorder in a few taps. No account or checkout.</p>
            <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={beginWithDemo} data-testid="button-use-demo-receipt">
              Use Demo Receipt Data <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">Demo only. Nothing is purchased.</p>
            <div className="mt-9">
              <p className="mb-3 text-[13px] font-bold">Your household</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Choose household size">
                {householdOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid={`button-household-${option.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    aria-pressed={household === option}
                    onClick={() => setHousehold(option)}
                    className={`min-h-11 rounded-full border px-4 text-[12px] font-semibold transition-colors ${household === option ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]'}`}
                  >{option}</button>
                ))}
              </div>
            </div>
            <div className="my-6 flex items-center gap-3 max-w-[450px]"><span className="h-px flex-1 bg-[hsl(var(--border))]" /><span className="eyebrow">or use a screenshot</span><span className="h-px flex-1 bg-[hsl(var(--border))]" /></div>
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
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent)/.55)]"><Upload size={21} aria-hidden="true" /></span>
              <span><strong className="block text-[13px]">Choose a screenshot</strong><span className="mt-1 block text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">PNG, JPG or WEBP · Moves straight to the demo pantry</span></span>
            </button>
            {uploadError && <p role="alert" className="mt-2 text-[12px] text-[hsl(var(--destructive))]" data-testid="text-upload-error">{uploadError}</p>}
            <p className="mt-4 flex max-w-[450px] items-start gap-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"><ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Your image stays on this device. It is not read, uploaded, or used to identify items. Both paths open the same four demo items.</p>
          </div>
          <div className="intro-art animate-rise-in stagger-1" aria-hidden="true">
            <div className="art-sheet">
              <div className="flex items-start justify-between"><span className="font-serif text-[24px] font-semibold tracking-[-.05em]">Household list</span><ReceiptText size={22} strokeWidth={1.5} /></div>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">The things that run out</p>
              <div className="art-line" />
              {initialItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <span><span className="mr-3 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">0{index + 1}</span>{item.name}</span>
                  <span className="h-4 w-4 rounded-full border border-[hsl(var(--border))]" />
                </div>
              ))}
              <div className="art-line" />
              <p className="font-serif text-[20px] italic text-[hsl(var(--muted-foreground))]">Ready when you are.</p>
            </div>
            <span className="absolute bottom-5 right-6 font-mono text-[9px] uppercase tracking-[.17em] text-[hsl(var(--sidebar-foreground)/.6)]">01 / pantry</span>
          </div>
        </main>
      ) : latestOrder ? (
        <main className="page-wrap max-w-[800px] py-12 pb-24 sm:py-20 animate-rise-in">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent))]"><Check size={27} aria-hidden="true" /></div>
          <p className="eyebrow mt-8">Simulated order {String(latestOrder.id).padStart(2, '0')} · Complete</p>
          <h1 className="display-title mt-4">That’s taken care of.<br /><span className="italic">For the demo.</span></h1>
          <p className="muted-copy mt-5 max-w-[550px] text-[15px]">Your basket has been cleared and the order is saved for this session. Nothing was purchased, charged, or delivered.</p>
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
            <p className="eyebrow">Your active demo pantry</p>
            <h1 className="display-title mt-4">What do you<br /><span className="italic">need more of?</span></h1>
            <p className="muted-copy mt-5 max-w-[550px] text-[14px]">Choose your everyday essentials, adjust the quantities, and place a simulated order. No real checkout happens here.</p>
            <div className="mt-7 flex flex-wrap items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-2 font-semibold text-[hsl(var(--foreground))]" data-testid="text-household">{household}</span>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-2">Source: {source}</span>
            </div>
            <div className="mt-10 flex items-end justify-between gap-3">
              <div><p className="eyebrow">The essentials</p><h2 className="section-title mt-2">Your four staples</h2></div>
              <span className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">04 items</span>
            </div>
            <div className="panel mt-5 overflow-hidden">
              {items.map((item) => {
                const quantity = basket[item.id] ?? 0;
                return (
                  <div key={item.id} className="item-row" data-testid={`active-item-${item.id}`}>
                    <ItemIcon id={item.id} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold leading-5">{item.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`text-runout-${item.id}`}><Clock3 size={12} aria-hidden="true" /> Est. {item.daysToRunOut} days · {dateIn(item.daysToRunOut)}</p>
                    </div>
                    <div className="item-action shrink-0">
                      {quantity === 0 ? (
                        <button type="button" className="btn btn-light" onClick={() => changeQuantity(item.id, 1)} data-testid={`button-add-${item.id}`} aria-label={`Add ${item.name} to basket`}><Plus size={16} aria-hidden="true" /> Add</button>
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
            <p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Dates are estimates from demo data, not a scanned receipt or live stock levels.</p>
          </div>

          <aside className="basket-panel animate-rise-in stagger-1" ref={basketRef} aria-labelledby="basket-heading" data-testid="panel-basket">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--sidebar-primary))]">Ready when you are</p><h2 id="basket-heading" className="mt-2 font-serif text-[30px] tracking-[-.05em]">Your basket</h2></div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--sidebar-accent))]"><ShoppingBag size={20} aria-hidden="true" /></span>
            </div>
            {basketLines.length === 0 ? (
              <div className="mt-7 rounded-2xl border border-dashed border-[hsl(var(--sidebar-border))] px-5 py-8 text-center" data-testid="status-empty-basket">
                <ShoppingBag size={24} className="mx-auto text-[hsl(var(--sidebar-primary))]" aria-hidden="true" />
                <p className="mt-3 text-[13px] font-semibold">Nothing in your basket yet.</p>
                <p className="mt-1 text-[11px] leading-5 text-[hsl(var(--sidebar-foreground)/.65)]">Tap Add beside anything you’d like to reorder.</p>
              </div>
            ) : (
              <div className="mt-5" aria-live="polite">
                {basketLines.map((line) => <div key={line.id} className="basket-line" data-testid={`basket-item-${line.id}`}>
                  <div className="min-w-0"><p className="text-[12px] font-semibold">{line.name}</p><p className="mt-1 font-mono text-[10px] text-[hsl(var(--sidebar-foreground)/.65)]">Quantity {line.quantity}</p></div>
                  <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" onClick={() => changeQuantity(line.id, 0)} aria-label={`Remove ${line.name} from basket`} data-testid={`button-remove-${line.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                </div>)}
                <div className="flex justify-between py-5 text-[12px]"><span className="text-[hsl(var(--sidebar-foreground)/.7)]">Total items</span><strong className="font-mono" data-testid="text-basket-count">{totalUnits}</strong></div>
              </div>
            )}
            <button type="button" className="btn btn-accent mt-5 w-full" onClick={placeOrder} disabled={basketLines.length === 0} data-testid="button-place-order">Place simulated order <ArrowRight size={16} aria-hidden="true" /></button>
            {basketError && <p role="alert" className="mt-3 text-[11px] text-[hsl(var(--sidebar-primary))]" data-testid="text-basket-error">{basketError}</p>}
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
                  <div className="flex items-center justify-between gap-2 text-[12px]"><strong>{item.name}</strong><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{item.daysToRunOut} days</span></div>
                  <div className="cadence-options" role="group" aria-label={`Usage frequency for ${item.name}`}>
                    {frequencies.map((option) => <button key={option.value} type="button" aria-pressed={item.frequency === option.value} onClick={() => updateFrequency(item.id, option.value)} data-testid={`button-frequency-${item.id}-${option.value}`}>{option.label}</button>)}
                  </div>
                </div>)}
              </div>}
            </section>
            <OrderHistory orders={orders} />
          </div>
          {totalUnits > 0 && <div className="mobile-basket-bar" aria-label="Basket shortcut">
            <span className="text-[12px] font-semibold"><span className="block font-mono text-[10px] text-[hsl(var(--muted-foreground))]">YOUR BASKET</span>{totalUnits} {totalUnits === 1 ? 'item' : 'items'} ready</span>
            <button type="button" className="btn btn-primary" onClick={() => basketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} data-testid="button-view-basket">View basket <ArrowRight size={16} aria-hidden="true" /></button>
          </div>}
        </main>
      )}
    </div>
  );
}