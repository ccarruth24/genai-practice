import { type ReactNode, useMemo, useRef, useState } from 'react';
import { useTriggerPantryTestAlert } from '@workspace/api-client-react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  CircleHelp,
  FileImage,
  Info,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
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

const cadenceCopy: Record<Frequency, string> = {
  less: 'less often',
  standard: 'standard',
  more: 'more often',
};
const defaultHouseholdSize = 4;

function Logo() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-smart-pantry">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] shadow-[0_5px_0_hsl(157_24%_18%/0.1)]">
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
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_5px_0_hsl(157_24%_18%/0.12)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_hsl(157_24%_18%/0.12)]',
    quiet: 'bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
    outline: 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--muted)/0.55)]',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-[13px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}>
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
  onContinue,
}: {
  receiptName: string;
  setReceiptName: (name: string) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const chooseReceipt = (file?: File) => {
    if (!file) return;
    if (file.type.startsWith('image/')) setReceiptName(file.name);
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <PageIntro eyebrow="Start with what you already have" title="Let’s make restocking feel automatic.">
        Upload a grocery receipt and we’ll sketch out a starting rhythm for your household.
      </PageIntro>
      <div className="mt-10 animate-rise-in stagger-1">
        <div
          role="button"
          tabIndex={0}
          data-testid="dropzone-receipt"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click(); }}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); chooseReceipt(event.dataTransfer.files?.[0]); }}
          className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[22px] border border-dashed px-6 text-center transition-all duration-300 ${isDragging ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent)/0.25)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card)/0.62)] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--card))]'}`}
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" data-testid="input-receipt" onChange={(event) => chooseReceipt(event.target.files?.[0])} />
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[17px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-transform duration-300 group-hover:-translate-y-1">
            {receiptName ? <Check size={25} strokeWidth={2.2} /> : <FileImage size={25} strokeWidth={1.7} />}
          </div>
          <p className="text-[15px] font-semibold" data-testid="text-receipt-state">{receiptName ? receiptName : 'Drop a receipt screenshot here'}</p>
          <p className="mt-2 text-[12px] text-[hsl(var(--muted-foreground))]">{receiptName ? 'Ready to use as a demo estimate' : 'PNG, JPG or WEBP · or choose a file'}</p>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-[hsl(var(--muted)/0.65)] px-3.5 py-3 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
          <Info size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary)/0.75)]" />
          <span><strong className="font-semibold text-[hsl(var(--foreground))]">Demo estimates only.</strong> There’s no receipt scanning service connected here, so the items below are a thoughtful starting point—not a read of your image.</span>
        </div>
      </div>
      <div className="mt-10 flex items-center justify-between animate-rise-in stagger-2">
        <div className="flex items-center gap-2 text-[12px] text-[hsl(var(--muted-foreground))]"><CircleHelp size={15} /> You can tune every item next</div>
        <Button onClick={onContinue} testId="button-review-cadence">Review cadence <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

function CadenceReview({
  items,
  onChange,
  onBack,
  onContinue,
}: {
  items: PantryItem[];
  onChange: (id: string, frequency: Frequency) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <PageIntro eyebrow="Step 02 · make it yours" title="A rhythm that fits your table.">
        We’ve estimated when each staple may run out for a household of four. Adjust anything that feels off.
      </PageIntro>
      <div className="mt-9 overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] shadow-[0_12px_30px_-20px_hsl(157_24%_18%/0.25)] animate-rise-in stagger-1">
        <div className="hidden grid-cols-[1fr_130px_390px] border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.38)] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))] sm:grid">
          <span>Pantry item</span><span>Est. run out</span><span className="text-right">How often?</span>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {items.map((item, index) => (
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_130px_390px] sm:items-center" key={item.id} data-testid={`row-pantry-item-${item.id}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-[11px] text-[12px] font-semibold ${index % 3 === 0 ? 'bg-[hsl(var(--accent)/0.7)]' : index % 3 === 1 ? 'bg-[hsl(188_35%_53%/0.17)]' : 'bg-[hsl(11_64%_67%/0.2)]'}`}>{item.name.slice(0, 1)}</div>
                <div>
                  <p className="text-[13px] font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">Household staple</p>
                </div>
              </div>
              <p className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]"><span className="sm:hidden">Runs out in </span><strong className="font-medium text-[hsl(var(--foreground))]">{item.daysToRunOut} days</strong></p>
              <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={`Cadence for ${item.name}`}>
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-testid={`button-frequency-${item.id}-${option.value}`}
                    onClick={() => onChange(item.id, option.value)}
                    className={`min-h-10 rounded-[10px] border px-1.5 text-[10px] font-medium transition-all duration-200 ${item.frequency === option.value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}
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
      <div className="mt-4 flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]"><Info size={14} /> You can change these estimates anytime.</div>
      <div className="mt-9 flex items-center justify-between animate-rise-in stagger-2">
        <Button variant="quiet" onClick={onBack} testId="button-back-onboarding"><ChevronLeft size={16} /> Back</Button>
        <Button onClick={onContinue} testId="button-set-up-alerts">Set up alerts <ArrowRight size={16} /></Button>
      </div>
    </div>
  );
}

function PhonePreview({ message, phoneNumber }: { message?: string; phoneNumber: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[295px] rounded-[34px] border-[7px] border-[hsl(157_24%_18%)] bg-[hsl(42_43%_95%)] p-2 shadow-[0_20px_35px_-20px_hsl(157_24%_18%/0.65)]">
      <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-[13px] bg-[hsl(157_24%_18%)]" />
      <div className="min-h-[330px] overflow-hidden rounded-[25px] bg-[hsl(42_43%_95%)]">
        <div className="border-b border-[hsl(var(--border))] px-4 pb-3 pt-8 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[10px] font-semibold">SP</div>
          <p className="mt-1.5 text-[11px] font-semibold">SmartPantry</p>
        </div>
        <div className="flex min-h-[258px] flex-col justify-end gap-2 px-3 pb-4">
          <p className="mb-1 text-center font-mono text-[8px] uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">{message ? 'Just now' : 'Your preview'}</p>
          {message ? (
            <div className="max-w-[225px] rounded-[17px] rounded-bl-[5px] bg-[hsl(188_35%_53%/0.22)] px-3.5 py-3 text-[11px] leading-4 text-[hsl(var(--foreground))]" data-testid="text-alert-message">{message}</div>
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
  alert,
  onTest,
  isTesting,
  testError,
  onBack,
  onActivate,
}: {
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  alert?: Alert;
  onTest: () => void;
  isTesting: boolean;
  testError?: string;
  onBack: () => void;
  onActivate: () => void;
}) {
  const canActivate = !alertsEnabled || phoneNumber.trim().length > 0;
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <PageIntro eyebrow="Step 03 · choose your nudge" title="A gentle heads-up, when it matters.">
        SmartPantry can text you before the essentials disappear. Nothing is sent during this demo—your test stays on screen.
      </PageIntro>
      <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="animate-rise-in stagger-1">
          <div className="rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.7)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[hsl(var(--accent)/0.75)]"><Smartphone size={18} /></div>
                <div>
                  <p className="text-[13px] font-semibold">Restock reminders</p>
                  <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">A short SMS when something is nearly due.</p>
                </div>
              </div>
              <button type="button" role="switch" aria-checked={alertsEnabled} data-testid="toggle-alerts" onClick={() => setAlertsEnabled(!alertsEnabled)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${alertsEnabled ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-[hsl(var(--card))] shadow-sm transition-transform duration-200 ${alertsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {alertsEnabled && (
              <div className="mt-5 border-t border-[hsl(var(--border))] pt-5 animate-rise-in">
                <label htmlFor="phone-number" className="text-[12px] font-semibold">Mobile number</label>
                <div className="mt-2 flex items-center rounded-[12px] border border-[hsl(var(--input))] bg-[hsl(var(--background)/0.55)] px-3 transition-colors focus-within:border-[hsl(var(--primary))]">
                  <span className="font-mono text-[12px] text-[hsl(var(--muted-foreground))]">+1</span>
                  <input id="phone-number" type="tel" inputMode="tel" required value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="(555) 014-2288" data-testid="input-phone-number" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[13px] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.6)]" />
                </div>
                {!phoneNumber.trim() && <p className="mt-2 text-[11px] text-[hsl(var(--destructive))]" data-testid="text-phone-required">A mobile number is required when alerts are on.</p>}
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]"><ShieldCheck size={14} className="mt-0.5 shrink-0" /> Only used for your SmartPantry alerts. This prototype keeps it in memory.</p>
              </div>
            )}
          </div>
          <div className="mt-5 rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.48)] p-5">
            <div className="flex items-center gap-2"><Sparkles size={16} /><p className="text-[13px] font-semibold">See the message first</p></div>
            <p className="mt-2 max-w-[390px] text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">Send yourself a simulated alert. It will appear in the phone preview—no SMS is delivered.</p>
            <Button variant="outline" onClick={onTest} disabled={!canActivate || isTesting} testId="button-test-alert">
              {isTesting ? 'Preparing preview…' : 'Send a test alert'} <ArrowRight size={15} />
            </Button>
            {testError && <p className="mt-3 text-[11px] leading-4 text-[hsl(var(--destructive))]" data-testid="text-alert-error">{testError}</p>}
          </div>
        </div>
        <div className="order-first animate-rise-in stagger-2 lg:order-last">
          <PhonePreview message={alert?.message} phoneNumber={phoneNumber} />
          {alert && <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]" data-testid="text-delivery-mode">Delivery mode · {alert.deliveryMode}</p>}
        </div>
      </div>
      <div className="mt-9 flex items-center justify-between animate-rise-in stagger-3">
        <Button variant="quiet" onClick={onBack} testId="button-back-cadence"><ChevronLeft size={16} /> Back</Button>
        <Button onClick={onActivate} disabled={!canActivate} testId="button-activate">Activate SmartPantry <Check size={16} /></Button>
      </div>
    </div>
  );
}

function ActiveSimulation({
  items,
  phoneNumber,
  alertsEnabled,
  alert,
  onTest,
  isTesting,
  testError,
}: {
  items: PantryItem[];
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
        <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">SmartPantry is active</p>
        <h2 className="mt-4 max-w-[600px] font-serif text-[clamp(36px,5.2vw,62px)] leading-[.98] tracking-[-0.055em]">The pantry has a plan now.</h2>
        <p className="mt-5 max-w-[500px] text-[15px] leading-6 text-[hsl(var(--muted-foreground))]">We’ll keep an eye on {items.length} household staples and give you a little room before they run out.</p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="animate-rise-in stagger-1 rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.72)] p-5">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
            <div><p className="text-[13px] font-semibold">Your restock rhythm</p><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Household of {defaultHouseholdSize} · {items.length} items</p></div>
            <ReceiptText size={18} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="mt-1 divide-y divide-[hsl(var(--border))]">
            {items.map((item) => (
              <div className="flex items-center justify-between gap-3 py-3" key={item.id} data-testid={`active-item-${item.id}`}>
                <span className="text-[12px] font-medium">{item.name}</span>
                <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">Every {item.daysToRunOut}d · {cadenceCopy[item.frequency]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-rise-in stagger-2 rounded-[20px] bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))]">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold">Next on your radar</p>
            <span className="rounded-full bg-[hsl(var(--sidebar-primary)/0.18)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[hsl(var(--sidebar-primary))]">{dueSoon.length} soon</span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--sidebar-foreground)/0.6)]">Based on your everyday pace.</p>
          <div className="mt-6 space-y-3">
            {dueSoon.map((item) => (
              <div className="flex items-center justify-between rounded-[11px] bg-[hsl(var(--sidebar-accent))] px-3 py-2.5" key={item.id}>
                <span className="text-[11px]">{item.name}</span><span className="font-mono text-[10px] text-[hsl(var(--sidebar-primary))]">{item.daysToRunOut}d</span>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-[hsl(var(--sidebar-border))] pt-4 text-[10px] leading-4 text-[hsl(var(--sidebar-foreground)/0.55)]">{alertsEnabled ? `Alerts on · ${phoneNumber}` : 'Alerts are off for this setup.'}</p>
        </div>
      </div>
      <div className="mt-7 rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.45)] p-5 animate-rise-in stagger-3">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><p className="text-[13px] font-semibold">Want to see it in action?</p><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Run another simulated alert. Nothing leaves this screen.</p></div>
          <Button variant="outline" onClick={onTest} disabled={!alertsEnabled || !phoneNumber.trim() || isTesting} testId="button-test-alert-active">{isTesting ? 'Preparing preview…' : 'Test alert'} <ArrowRight size={15} /></Button>
        </div>
        {alert && <div className="mt-4 border-t border-[hsl(var(--border))] pt-4 text-[12px] leading-5 text-[hsl(var(--foreground))]" data-testid="text-active-alert">{alert.message}</div>}
        {testError && <p className="mt-4 border-t border-[hsl(var(--border))] pt-4 text-[11px] leading-4 text-[hsl(var(--destructive))]" data-testid="text-active-alert-error">{testError}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('onboarding');
  const [receiptName, setReceiptName] = useState('');
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
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
    if (!phoneNumber.trim()) return;
    alertMutation.mutate(
      { data: { phoneNumber: phoneNumber.trim() } },
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
            {stage === 'onboarding' && <Onboarding receiptName={receiptName} setReceiptName={setReceiptName} onContinue={() => setStage('cadence')} />}
            {stage === 'cadence' && <CadenceReview items={items} onChange={updateFrequency} onBack={() => setStage('onboarding')} onContinue={() => setStage('sms')} />}
            {stage === 'sms' && <SmsSetup alertsEnabled={alertsEnabled} setAlertsEnabled={setAlertsEnabled} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} alert={alert} onTest={triggerTestAlert} isTesting={alertMutation.isPending} testError={testError} onBack={() => setStage('cadence')} onActivate={() => setStage('active')} />}
            {stage === 'active' && <ActiveSimulation items={items} phoneNumber={phoneNumber} alertsEnabled={alertsEnabled} alert={alert} onTest={triggerTestAlert} isTesting={alertMutation.isPending} testError={testError} />}
          </div>
        </main>
      </div>
    </div>
  );
}