import { type ReactNode, useMemo, useRef, useState } from 'react';
import { useTriggerPantryTestAlert } from '@workspace/api-client-react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  FileImage,
  Info,
  ReceiptText,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

type Frequency = 'less' | 'standard' | 'more';
type Stage = 'onboarding' | 'cadence' | 'sms' | 'active';

type PantryItem = {
  id: string;
  name: string;
  baseDays: number;
  daysToRunOut: number;
  frequency: Frequency;
};

type Alert = {
  message: string;
  deliveryMode: 'simulated';
};

const initialItems: PantryItem[] = [
  { id: 'kids-body-wash', name: 'Kids Body Wash', baseDays: 14, daysToRunOut: 14, frequency: 'standard' },
  { id: 'dishwasher-pods', name: 'Dishwasher Pods', baseDays: 21, daysToRunOut: 21, frequency: 'standard' },
  { id: 'whole-milk', name: 'Whole Milk', baseDays: 4, daysToRunOut: 4, frequency: 'standard' },
  { id: 'hand-soap-refill', name: 'Hand Soap Refill', baseDays: 30, daysToRunOut: 30, frequency: 'standard' },
];

const frequencyOptions: { value: Frequency; label: string; description: string }[] = [
  { value: 'less', label: 'Less Frequent', description: 'Stretch the interval' },
  { value: 'standard', label: 'Standard', description: 'Keep the estimate' },
  { value: 'more', label: 'More Frequent', description: 'Restock sooner' },
];

const householdOptions = [
  { value: '2 Adults, 2 Kids under 10', label: '2 Adults, 2 Kids under 10' },
  { value: '1 Adult, 1 Kid', label: '1 Adult, 1 Kid' },
  { value: '2 Adults', label: '2 Adults' },
  { value: 'Other household', label: 'Other household' },
];
const isPlausiblePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && !/^(\d)\1+$/.test(digits);
};
function runOutDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function Logo() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-smart-pantry">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[0_5px_0_hsl(var(--foreground)/0.1)]">
        <div className="absolute top-[9px] h-1.5 w-4 rounded-full border-2 border-[hsl(var(--foreground))]" />
        <div className="h-5 w-4 rounded-b-[6px] rounded-t-[3px] border-2 border-[hsl(var(--foreground))]" />
      </div>
      <div>
        <p className="font-serif text-[19px] font-semibold leading-none tracking-[-0.02em]">SmartPantry</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">restock, quietly</p>
      </div>
    </div>
  );
}

function ProgressRail({ stage }: { stage: Stage }) {
  const stages: { id: Stage; label: string; number: string }[] = [
    { id: 'onboarding', label: 'Your pantry', number: '01' },
    { id: 'cadence', label: 'Your rhythm', number: '02' },
    { id: 'sms', label: 'Your nudge', number: '03' },
  ];
  const currentIndex = stage === 'active' ? 3 : stages.findIndex((item) => item.id === stage);

  return (
    <aside className="hidden min-h-[100dvh] w-[266px] shrink-0 flex-col justify-between bg-[hsl(var(--sidebar))] px-7 py-8 text-[hsl(var(--sidebar-foreground))] md:flex">
      <div>
        <Logo />
        <div className="mt-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--sidebar-foreground)/0.5)]">A little less to remember</p>
          <h1 className="mt-4 max-w-[180px] font-serif text-[31px] leading-[1.08] tracking-[-0.04em]">The right things, at the right time.</h1>
          <p className="mt-5 max-w-[185px] text-[13px] leading-5 text-[hsl(var(--sidebar-foreground)/0.65)]">A quiet rhythm for the things your household reaches for every week.</p>
        </div>
        <div className="mt-14 space-y-4">
          {stages.map((item, index) => {
            const completed = currentIndex > index;
            const current = stage === item.id;
            return (
              <div className="flex items-center gap-3" key={item.id}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-medium transition-colors ${completed ? 'border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : current ? 'border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]' : 'border-[hsl(var(--sidebar-foreground)/0.28)] text-[hsl(var(--sidebar-foreground)/0.45)]'}`}>
                  {completed ? <Check size={13} strokeWidth={2.5} /> : item.number}
                </div>
                <span className={`text-[12px] ${current ? 'font-medium text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/0.5)]'}`}>{item.label}</span>
              </div>
            );
          })}
          {stage === 'active' && (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"><Check size={13} strokeWidth={2.5} /></div>
              <span className="text-[12px] font-medium">All set</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-[hsl(var(--sidebar-border))] pt-5">
        <div className="flex items-start gap-2.5 text-[hsl(var(--sidebar-foreground)/0.55)]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <p className="text-[11px] leading-4">Private by design.<br />Your setup stays in this session.</p>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ stage }: { stage: Stage }) {
  const label = stage === 'active' ? 'All set' : stage === 'onboarding' ? 'Step 01 of 03' : stage === 'cadence' ? 'Step 02 of 03' : 'Step 03 of 03';
  return (
    <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.7)] px-5 py-4 md:hidden">
      <Logo />
      <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]" data-testid="text-mobile-step">{label}</span>
    </header>
  );
}

function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  testId,
  type = 'button',
}: {
  children: ReactNode;
  variant?: 'primary' | 'quiet' | 'outline';
  onClick?: () => void;
  disabled?: boolean;
  testId: string;
  type?: 'button' | 'submit';
}) {
  const styles = {
     primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_5px_0_hsl(var(--foreground)/0.12)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_hsl(var(--foreground)/0.12)]',
    quiet: 'bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
    outline: 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--muted)/0.55)]',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-center text-[13px] font-semibold transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}>
      {children}
    </button>
  );
}

function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="animate-rise-in">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">{eyebrow}</p>
      <h2 className="mt-4 max-w-[620px] font-serif text-[clamp(36px,5.2vw,62px)] leading-[.98] tracking-[-0.055em] text-[hsl(var(--foreground))]">{title}</h2>
      <p className="mt-5 max-w-[510px] text-[15px] leading-6 text-[hsl(var(--muted-foreground))]">{children}</p>
    </div>
  );
}

function Onboarding({
  receiptName,
  setReceiptName,
  household,
  setHousehold,
  onContinue,
}: {
  receiptName: string;
  setReceiptName: (name: string) => void;
  household: string;
  setHousehold: (value: string) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const chooseReceipt = (file?: File) => {
    if (!file) return;
    if (['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setReceiptName(file.name);
      onContinue();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <PageIntro eyebrow="A lighter way to keep stocked" title="The little things, taken care of.">
        Set up your smart pantry in under 2 minutes.
      </PageIntro>
      <div className="mt-7 rounded-[22px] bg-[hsl(var(--accent))] px-5 py-5 shadow-[0_9px_0_hsl(var(--foreground)/0.06)] animate-rise-in stagger-1 sm:px-7 sm:py-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--card)/0.65)]"><ReceiptText size={20} /></div>
          <div>
            <p className="font-serif text-[23px] leading-tight tracking-[-0.03em] sm:text-[28px]">Start with a ready-made pantry.</p>
            <p className="mt-1.5 text-[13px] leading-5 opacity-80">Four everyday staples, ready for you to adjust.</p>
          </div>
        </div>
        <Button onClick={onContinue} testId="button-review-cadence">
          Use Demo Receipt Data <ArrowRight size={17} />
        </Button>
      </div>
      <fieldset className="mt-8 animate-rise-in stagger-2">
        <legend className="text-[13px] font-semibold">Who’s at home?</legend>
        <p className="mt-1 text-[12px] text-[hsl(var(--muted-foreground))]">Your starting household size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {householdOptions.map((option) => (
            <button key={option.value} type="button" aria-pressed={household === option.value} data-testid={`button-household-${option.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => setHousehold(option.value)} className={`min-h-11 rounded-full border px-4 text-[12px] font-semibold transition-colors ${household === option.value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]'}`}>{option.label}</button>
          ))}
        </div>
      </fieldset>
      <div className="mt-9 animate-rise-in stagger-3">
        <div className="mb-3 flex items-center gap-3"><span className="h-px flex-1 bg-[hsl(var(--border))]" /><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Or add your own screenshot</span><span className="h-px flex-1 bg-[hsl(var(--border))]" /></div>
        <div
          role="button"
          tabIndex={0}
          data-testid="dropzone-receipt"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click(); } }}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); chooseReceipt(event.dataTransfer.files?.[0]); }}
          aria-label="Choose an Amazon or grocery screenshot"
          className={`group relative flex min-h-[144px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed px-5 text-center transition-colors duration-200 ${isDragging ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent)/0.25)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card)/0.62)] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--card))]'}`}
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" data-testid="input-receipt" onChange={(event) => chooseReceipt(event.target.files?.[0])} />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-transform duration-300 group-hover:-translate-y-1">
            {receiptName ? <Check size={25} strokeWidth={2.2} /> : <FileImage size={25} strokeWidth={1.7} />}
          </div>
          <p className="text-[13px] font-semibold" data-testid="text-receipt-state">{receiptName ? receiptName : 'Choose an Amazon or grocery screenshot'}</p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Tap to choose or drop a PNG, JPG or WEBP</p>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-[hsl(var(--muted)/0.65)] px-3.5 py-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
          <Info size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary)/0.75)]" />
          <span><strong className="font-semibold text-[hsl(var(--foreground))]">No image reading or OCR.</strong> Uploading moves you to the same demo estimates. Your image stays local to your browser and is not sent anywhere.</span>
        </div>
      </div>
    </div>
  );
}

function CadenceReview({
  items,
  household,
  onChange,
  onBack,
  onContinue,
}: {
  items: PantryItem[];
  household: string;
  onChange: (id: string, frequency: Frequency) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <PageIntro eyebrow="Step 02 · make it yours" title="Find your household rhythm.">
        Starting estimates for {household.toLowerCase()}. Tap a pace to see when each item may run out.
      </PageIntro>
      <div className="mt-8 overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] shadow-[0_12px_30px_-20px_hsl(var(--foreground)/0.2)] animate-rise-in stagger-1">
        <div className="divide-y divide-[hsl(var(--border))]">
          {items.map((item, index) => (
            <div className="px-4 py-5 sm:px-6" key={item.id} data-testid={`row-pantry-item-${item.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[13px] font-semibold ${index % 3 === 0 ? 'bg-[hsl(var(--accent)/0.7)]' : index % 3 === 1 ? 'bg-[hsl(21_67%_77%/0.4)]' : 'bg-[hsl(25_54%_82%/0.5)]'}`}>{item.name.slice(0, 1)}</div>
                  <p className="text-[14px] font-semibold">{item.name}</p>
                </div>
                <div className="shrink-0 text-right" aria-live="polite" data-testid={`text-runout-${item.id}`}>
                  <p className="text-[13px] font-bold">{item.daysToRunOut} days</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Est. {runOutDate(item.daysToRunOut)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1.5" role="group" aria-label={`Cadence for ${item.name}`}>
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={item.frequency === option.value}
                    data-testid={`button-frequency-${item.id}-${option.value}`}
                    onClick={() => onChange(item.id, option.value)}
                    className={`min-h-12 rounded-[10px] border px-1 text-[11px] font-semibold leading-tight transition-colors duration-200 ${item.frequency === option.value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"><Info size={14} className="shrink-0" /> Estimates are based on demo data, not a scanned receipt.</div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-2 animate-rise-in stagger-2">
        <Button variant="quiet" onClick={onBack} testId="button-back-onboarding"><ChevronLeft size={16} /> Back</Button>
        <Button onClick={onContinue} testId="button-set-up-alerts">Set up alerts <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

function PhonePreview({ message, phoneNumber }: { message?: string; phoneNumber: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[295px] rounded-[34px] border-[7px] border-[hsl(var(--foreground))] bg-[hsl(var(--background))] p-2 shadow-[0_20px_35px_-20px_hsl(var(--foreground)/0.45)]">
      <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-[13px] bg-[hsl(var(--foreground))]" />
      <div className="min-h-[330px] overflow-hidden rounded-[25px] bg-[hsl(var(--background))]">
        <div className="border-b border-[hsl(var(--border))] px-4 pb-3 pt-8 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[10px] font-semibold">SP</div>
          <p className="mt-1.5 text-[11px] font-semibold">SmartPantry</p>
        </div>
        <div className="flex min-h-[258px] flex-col justify-end gap-2 px-3 pb-4">
          <p className="mb-1 text-center font-mono text-[8px] uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">{message ? 'Just now' : 'Your preview'}</p>
          {message ? (
            <div className="max-w-[225px] whitespace-pre-wrap break-words rounded-[17px] rounded-bl-[5px] bg-[hsl(var(--accent)/0.58)] px-3.5 py-3 text-[11px] leading-5 text-[hsl(var(--foreground))]" data-testid="text-alert-message">{message}</div>
          ) : (
            <div className="rounded-[17px] rounded-bl-[5px] border border-dashed border-[hsl(var(--border))] px-3.5 py-3 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]" data-testid="text-alert-placeholder">Your SmartPantry message will appear here after you send a test.</div>
          )}
          <p className="px-2 text-[9px] text-[hsl(var(--muted-foreground))]">{phoneNumber || 'Your phone number'}</p>
        </div>
      </div>
    </div>
  );
}

function SmsSetup({
  alertsEnabled,
  setAlertsEnabled,
  phoneNumber,
  setPhoneNumber,
  onBack,
  onActivate,
}: {
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  onBack: () => void;
  onActivate: () => void;
}) {
  const canActivate = !alertsEnabled || isPlausiblePhone(phoneNumber);
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <PageIntro eyebrow="Step 03 · choose your nudge" title="A gentle heads-up, when it matters.">
        Choose whether to set up text alerts. This demo won’t actually send texts or place Amazon orders.
      </PageIntro>
      <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="animate-rise-in stagger-1">
          <div className="rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.7)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[hsl(var(--accent)/0.75)] sm:flex"><Smartphone size={18} /></div>
                <div>
                  <p id="alerts-toggle-label" className="text-[13px] font-semibold leading-5">Enable 1-Tap Auto-Reorder Alerts via SMS</p>
                  <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">Optional. You can still explore without a number.</p>
                </div>
              </div>
              <button type="button" role="switch" aria-labelledby="alerts-toggle-label" aria-checked={alertsEnabled} data-testid="toggle-alerts" onClick={() => setAlertsEnabled(!alertsEnabled)} className={`relative flex h-11 w-14 shrink-0 items-center rounded-full transition-colors duration-200 ${alertsEnabled ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]'}`}>
                <span className={`absolute left-1 h-6 w-6 rounded-full bg-[hsl(var(--card))] shadow-sm transition-transform duration-200 ${alertsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            {alertsEnabled && (
              <div className="mt-5 border-t border-[hsl(var(--border))] pt-5 animate-rise-in">
                <label htmlFor="phone-number" className="text-[12px] font-semibold">Phone number for alerts</label>
                <div className="mt-2 flex items-center rounded-[12px] border border-[hsl(var(--input))] bg-[hsl(var(--background)/0.55)] px-3 transition-colors focus-within:border-[hsl(var(--primary))]">
                  <input id="phone-number" type="tel" inputMode="tel" autoComplete="tel" aria-describedby="phone-hint" aria-invalid={phoneNumber.length > 0 && !isPlausiblePhone(phoneNumber)} value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="(415) 555-0184" data-testid="input-phone-number" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[14px] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.6)]" />
                </div>
                <p id="phone-hint" className="mt-2 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]" data-testid="text-phone-required">{phoneNumber && !isPlausiblePhone(phoneNumber) ? 'Enter a valid phone number (10–15 digits).' : 'Enter 10–15 digits to activate with alerts on.'}</p>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]"><ShieldCheck size={14} className="mt-0.5 shrink-0" /> Saved only in this browser session. No real SMS will be sent.</p>
              </div>
            )}
          </div>
          <p className="mt-5 text-[12px] leading-5 text-[hsl(var(--muted-foreground))]">Activation starts an on-screen simulation only. Your test alert is available on the next screen, even with alerts off.</p>
        </div>
        <div className="hidden animate-rise-in stagger-2 lg:block"><PhonePreview phoneNumber={phoneNumber} /></div>
      </div>
      <div className="mt-9 flex flex-wrap items-center justify-between gap-2 animate-rise-in stagger-3">
        <Button variant="quiet" onClick={onBack} testId="button-back-cadence"><ChevronLeft size={16} /> Back</Button>
        <Button onClick={onActivate} disabled={!canActivate} testId="button-activate">Activate Smart Pantry <Check size={16} /></Button>
      </div>
    </div>
  );
}

function ActiveSimulation({
  items,
  household,
  phoneNumber,
  alertsEnabled,
  alert,
  onTest,
  isTesting,
  testError,
}: {
  items: PantryItem[];
  household: string;
  phoneNumber: string;
  alertsEnabled: boolean;
  alert?: Alert;
  onTest: () => void;
  isTesting: boolean;
  testError?: string;
}) {
  const dueSoon = useMemo(() => items.filter((item) => item.daysToRunOut <= 7), [items]);
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div className="animate-rise-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><Check size={24} strokeWidth={2.3} /></div>
        <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">Your demo pantry is active</p>
        <h2 className="mt-4 max-w-[600px] font-serif text-[clamp(36px,5.2vw,62px)] leading-[.98] tracking-[-0.055em]">The pantry has a plan now.</h2>
        <p className="mt-5 max-w-[500px] text-[15px] leading-6 text-[hsl(var(--muted-foreground))]">Your {items.length} staples are ready to explore. This is a simulation: no monitoring, real SMS, or Amazon order happens.</p>
      </div>
      <div className="mt-8 rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.45)] p-5 animate-rise-in stagger-1 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-[23px] leading-tight tracking-[-0.03em]">See a restock nudge.</p>
            <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--muted-foreground))]">Creates an on-screen preview, even if you switched alerts off.</p>
          </div>
          <Button onClick={onTest} disabled={isTesting} testId="button-test-alert-active">{isTesting ? 'Preparing alert…' : 'Trigger Test SMS Alert Now'} <ArrowRight size={16} /></Button>
        </div>
        {isTesting && <div role="status" className="mt-5 space-y-2" data-testid="status-alert-loading"><div className="skeleton h-4 w-3/4 rounded bg-[hsl(var(--card)/0.7)]" /><div className="skeleton h-4 w-1/2 rounded bg-[hsl(var(--card)/0.7)]" /><span className="sr-only">Preparing simulated alert</span></div>}
        {testError && <p role="alert" className="mt-4 text-[12px] font-medium text-[hsl(var(--destructive))]" data-testid="text-active-alert-error">{testError} Use the button above to retry.</p>}
        {alert && <div className="mt-5 border-t border-[hsl(var(--foreground)/0.13)] pt-5" aria-live="polite"><PhonePreview message={alert.message} phoneNumber={phoneNumber} /><p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]" data-testid="text-delivery-mode">Delivery mode · {alert.deliveryMode}</p><p className="sr-only" data-testid="text-active-alert">{alert.message}</p></div>}
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="animate-rise-in stagger-1 rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] p-5">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
            <div><p className="text-[13px] font-semibold">Your restock rhythm</p><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{household} · {items.length} items</p></div>
            <ReceiptText size={18} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="mt-1 divide-y divide-[hsl(var(--border))]">
            {items.map((item) => (
              <div className="flex items-center justify-between gap-3 py-3" key={item.id} data-testid={`active-item-${item.id}`}>
                <span className="text-[12px] font-medium">{item.name}</span>
                <span className="shrink-0 text-right font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{item.daysToRunOut}d · Est. {runOutDate(item.daysToRunOut)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-rise-in stagger-2 rounded-[20px] bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))]">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">Next on your radar</p>
            <span className="rounded-full bg-[hsl(var(--sidebar-primary)/0.18)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[hsl(var(--sidebar-primary))]">{dueSoon.length} soon</span>
          </div>
           <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--sidebar-foreground)/0.6)]">Based on your demo estimates.</p>
          <div className="mt-6 space-y-3">
             {dueSoon.length === 0 && <p className="text-[12px] leading-5 text-[hsl(var(--sidebar-foreground)/0.7)]">Nothing due this week. A little breathing room.</p>}
            {dueSoon.map((item) => (
              <div className="flex items-center justify-between rounded-[11px] bg-[hsl(var(--sidebar-accent))] px-3 py-2.5" key={item.id}>
                <span className="text-[11px]">{item.name}</span><span className="font-mono text-[10px] text-[hsl(var(--sidebar-primary))]">{item.daysToRunOut}d</span>
              </div>
            ))}
          </div>
           <p className="mt-6 border-t border-[hsl(var(--sidebar-border))] pt-4 text-[10px] leading-4 text-[hsl(var(--sidebar-foreground)/0.7)]">{alertsEnabled ? `Alert preference on · ${phoneNumber} (demo only)` : 'Alert preference off · test preview still available.'}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('onboarding');
  const [receiptName, setReceiptName] = useState('');
  const [household, setHousehold] = useState(householdOptions[0].value);
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alert, setAlert] = useState<Alert>();
  const alertMutation = useTriggerPantryTestAlert();
  const testError = alertMutation.isError ? 'The preview could not be prepared. Try again.' : undefined;

  const updateFrequency = (id: string, frequency: Frequency) => {
    const cadenceFactor: Record<Frequency, number> = {
      less: 1.25,
      standard: 1,
      more: 0.75,
    };
    setItems((current) => current.map((item) => item.id === id
      ? { ...item, frequency, daysToRunOut: Math.max(1, Math.round(item.baseDays * cadenceFactor[frequency])) }
      : item));
  };

  const triggerTestAlert = () => {
    setAlert(undefined);
    alertMutation.mutate(
      { data: phoneNumber.trim() ? { phoneNumber: phoneNumber.trim() } : {} },
      { onSuccess: (result) => setAlert({ message: result.message, deliveryMode: result.deliveryMode }) },
    );
  };

  return (
    <div className="pantry-noise min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="flex min-h-[100dvh]">
        <ProgressRail stage={stage} />
        <main className="min-w-0 flex-1">
          <MobileHeader stage={stage} />
          <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8 sm:py-12 lg:px-14 lg:py-16">
            {stage === 'onboarding' && <Onboarding receiptName={receiptName} setReceiptName={setReceiptName} household={household} setHousehold={setHousehold} onContinue={() => setStage('cadence')} />}
            {stage === 'cadence' && <CadenceReview items={items} household={household} onChange={updateFrequency} onBack={() => setStage('onboarding')} onContinue={() => setStage('sms')} />}
            {stage === 'sms' && <SmsSetup alertsEnabled={alertsEnabled} setAlertsEnabled={setAlertsEnabled} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} onBack={() => setStage('cadence')} onActivate={() => setStage('active')} />}
            {stage === 'active' && <ActiveSimulation items={items} household={household} phoneNumber={phoneNumber} alertsEnabled={alertsEnabled} alert={alert} onTest={triggerTestAlert} isTesting={alertMutation.isPending} testError={testError} />}
          </div>
        </main>
      </div>
    </div>
  );
}