import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  marketplaceApi,
  Listing,
  Order,
  ListingsFilter,
  MarketStats,
  CropGrade,
  MarketTarget,
  CreateListingPayload,
} from '../../api/marketplaceApi';

// ── Helpers ───────────────────────────────────────────────────
const fmtPrice = (n: number, ar: boolean) =>
  n.toLocaleString(ar ? 'ar-EG' : 'en-US') + (ar ? ' ج.م' : ' EGP');
const fmtQty = (n: number, ar: boolean) =>
  n.toLocaleString(ar ? 'ar-EG' : 'en-US') + (ar ? ' كجم' : ' kg');
const fmtDate = (iso: string, ar: boolean) =>
  new Date(iso).toLocaleDateString(ar ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

// ── Config ────────────────────────────────────────────────────
const GRADE_CFG: Record<CropGrade, { color: string; bg: string; labelAr: string; labelEn: string }> = {
  A: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', labelAr: 'درجة A', labelEn: 'Grade A' },
  B: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', labelAr: 'درجة B', labelEn: 'Grade B' },
  C: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', labelAr: 'درجة C', labelEn: 'Grade C' },
};
const TARGET_CFG: Record<string, { flag: string; labelAr: string; labelEn: string; color: string }> = {
  eu:    { flag: '🇪🇺', labelAr: 'أوروبا',  labelEn: 'Europe',  color: '#22d3ee' },
  gulf:  { flag: '🇸🇦', labelAr: 'الخليج', labelEn: 'Gulf',    color: '#fbbf24' },
  local: { flag: '🇪🇬', labelAr: 'محلي',   labelEn: 'Local',   color: '#a78bfa' },
  any:   { flag: '🌍',  labelAr: 'أي سوق', labelEn: 'Any',     color: '#34d399' },
};
const ORDER_STATUS_CFG: Record<string, { color: string; bg: string; labelAr: string; labelEn: string; icon: string }> = {
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  labelAr: 'قيد المعالجة', labelEn: 'Pending',   icon: '⏳' },
  confirmed: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  labelAr: 'مؤكد',         labelEn: 'Confirmed', icon: '✅' },
  shipped:   { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  labelAr: 'تم الشحن',     labelEn: 'Shipped',   icon: '🚢' },
  delivered: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', labelAr: 'تم التسليم',   labelEn: 'Delivered', icon: '📦' },
  cancelled: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   labelAr: 'ملغي',         labelEn: 'Cancelled', icon: '❌' },
};

const LISTING_STATUS_CFG: Record<string, { color: string; bg: string; border: string; labelAr: string; labelEn: string }> = {
  available: { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', labelAr: 'متاح', labelEn: 'Available' },
  reserved:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', labelAr: 'محجوز', labelEn: 'Reserved' },
  sold:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', labelAr: 'مباع', labelEn: 'Sold' },
};

const CROP_OPTIONS = [
  { emoji: '🍅', nameAr: 'طماطم', nameEn: 'Tomatoes' },
  { emoji: '🍊', nameAr: 'برتقال', nameEn: 'Oranges' },
  { emoji: '🍓', nameAr: 'فراولة', nameEn: 'Strawberry' },
  { emoji: '🌾', nameAr: 'قمح', nameEn: 'Wheat' },
  { emoji: '🌽', nameAr: 'ذرة', nameEn: 'Corn' },
  { emoji: '🥔', nameAr: 'بطاطس', nameEn: 'Potatoes' },
  { emoji: '🧅', nameAr: 'بصل', nameEn: 'Onions' },
  { emoji: '🥒', nameAr: 'خيار', nameEn: 'Cucumber' },
];

// ── Toast ─────────────────────────────────────────────────────
interface ToastProps { msg: string; type: 'success' | 'error' | 'info'; }
const Toast: React.FC<ToastProps> = ({ msg, type }) => {
  const colors = { success: 'rgba(16,185,129,0.95)', error: 'rgba(244,63,94,0.95)', info: 'rgba(34,211,238,0.95)' };
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div className="rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2"
        style={{ background: colors[type], color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeInUp 0.3s ease' }}>
        {icons[type]} {msg}
      </div>
    </div>
  );
};

// ── Buy Modal (Trader / Exporter) ─────────────────────────────
interface BuyModalProps {
  listing: Listing; ar: boolean;
  onClose: () => void;
  onConfirm: (qty: number) => void;
  loading: boolean;
}
const BuyModal: React.FC<BuyModalProps> = ({ listing, ar, onClose, onConfirm, loading }) => {
  const [qty, setQty] = useState(Math.min(100, listing.quantity));
  const total = qty * listing.pricePerKg;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="card w-full max-w-md p-6 space-y-5 animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{listing.cropEmoji}</span>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{ar ? listing.cropName : listing.cropNameEn}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ar ? listing.farmerName : listing.farmerNameEn}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: GRADE_CFG[listing.grade].bg, color: GRADE_CFG[listing.grade].color }}>
            {ar ? GRADE_CFG[listing.grade].labelAr : GRADE_CFG[listing.grade].labelEn}
          </span>
          <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            {TARGET_CFG[listing.marketTarget]?.flag} {ar ? TARGET_CFG[listing.marketTarget]?.labelAr : TARGET_CFG[listing.marketTarget]?.labelEn}
          </span>
          {listing.exportApproved && (
            <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(52,211,153,0.1)', color: 'var(--emerald)', border: '1px solid rgba(52,211,153,0.2)' }}>
              ✓ {ar ? 'معتمد للتصدير' : 'Export Approved'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { labelAr: 'سعر الكيلو', labelEn: 'Price/kg', value: fmtPrice(listing.pricePerKg, ar) },
            { labelAr: 'المتاح', labelEn: 'Available', value: fmtQty(listing.quantity, ar) },
            { labelAr: 'جودة AI', labelEn: 'AI Quality', value: `${listing.qualityScore}%` },
            { labelAr: 'تاريخ الانتهاء', labelEn: 'Expires', value: fmtDate(listing.expiryDate, ar) },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {ar ? item.labelAr : item.labelEn}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {ar ? 'الكمية (كجم)' : 'Quantity (kg)'}
            </label>
            <span className="text-sm font-bold" style={{ color: 'var(--emerald)' }}>{qty.toLocaleString()}</span>
          </div>
          <input type="range" min={1} max={listing.quantity} value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-full" style={{ accentColor: 'var(--emerald)' }} />
          <div className="flex justify-between mt-1">
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>1 {ar ? 'كجم' : 'kg'}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtQty(listing.quantity, ar)}</span>
          </div>
        </div>

        <div className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {ar ? 'إجمالي الطلب' : 'Order Total'}
          </p>
          <p className="text-xl font-extrabold" style={{ color: 'var(--emerald)' }}>{fmtPrice(total, ar)}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {ar ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={() => onConfirm(qty)} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: loading ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#10b981,#22d3ee)',
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? (ar ? 'جارٍ...' : 'Processing...') : (ar ? '🛒 تأكيد الطلب' : '🛒 Confirm Order')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Listing Card (Buyer view) ──────────────────────────────────
interface ListingCardProps {
  listing: Listing; ar: boolean;
  onBuy: (l: Listing) => void;
  canBuy: boolean;
}
const ListingCard: React.FC<ListingCardProps> = ({ listing, ar, onBuy, canBuy }) => {
  const grade = GRADE_CFG[listing.grade];
  const target = TARGET_CFG[listing.marketTarget];
  const statusCfg = LISTING_STATUS_CFG[listing.status] || LISTING_STATUS_CFG.available;
  const isAvailable = listing.status === 'available';

  return (
    <div className="card card-hover flex flex-col">
      <div className="h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg,${grade.color}60,transparent)` }} />
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              {listing.cropEmoji}
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                {ar ? listing.cropName : listing.cropNameEn}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ar ? listing.farmerName : listing.farmerNameEn} · {ar ? listing.location : listing.locationEn}
              </p>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
            {ar ? statusCfg.labelAr : statusCfg.labelEn}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: grade.bg, color: grade.color }}>
            {ar ? grade.labelAr : grade.labelEn}
          </span>
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            {target?.flag} {ar ? target?.labelAr : target?.labelEn}
          </span>
          {listing.exportApproved && (
            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(52,211,153,0.08)', color: 'var(--emerald)', border: '1px solid rgba(52,211,153,0.15)' }}>
              ✓ {ar ? 'معتمد تصدير' : 'Export OK'}
            </span>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {ar ? 'جودة AI' : 'AI Quality Score'}
            </span>
            <span className="text-xs font-extrabold" style={{ color: listing.qualityScore >= 85 ? 'var(--emerald)' : listing.qualityScore >= 65 ? 'var(--amber)' : 'var(--rose)' }}>
              {listing.qualityScore}%
            </span>
          </div>
          <div className="health-bar">
            <div className="health-bar-fill" style={{
              width: `${listing.qualityScore}%`,
              background: listing.qualityScore >= 85 ? 'var(--emerald)' : listing.qualityScore >= 65 ? 'var(--amber)' : 'var(--rose)',
            }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {ar ? 'الكمية' : 'Quantity'}
            </p>
            <p className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{fmtQty(listing.quantity, ar)}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)' }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {ar ? 'السعر/كجم' : 'Price/kg'}
            </p>
            <p className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--emerald)' }}>{fmtPrice(listing.pricePerKg, ar)}</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {ar ? listing.description : listing.descriptionEn}
        </p>

        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>🌾 {ar ? 'الحصاد:' : 'Harvest:'} {fmtDate(listing.harvestDate, ar)}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⏰ {ar ? 'حتى:' : 'Exp:'} {fmtDate(listing.expiryDate, ar)}</span>
        </div>
      </div>

      <div className="px-5 pb-5">
        {canBuy ? (
          <button
            onClick={() => onBuy(listing)}
            disabled={!isAvailable}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: isAvailable ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(34,211,238,0.12))' : 'rgba(255,255,255,0.03)',
              border: isAvailable ? '1px solid rgba(52,211,153,0.3)' : '1px solid var(--border)',
              color: isAvailable ? 'var(--emerald)' : 'var(--text-muted)',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => isAvailable && ((e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,#10b981,#22d3ee)', (e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseLeave={e => isAvailable && ((e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(34,211,238,0.12))', (e.currentTarget as HTMLElement).style.color = 'var(--emerald)')}>
            {isAvailable
              ? (ar ? `🛒 اشتري · ${fmtPrice(listing.totalPrice, ar)}` : `🛒 Buy · ${fmtPrice(listing.totalPrice, ar)}`)
              : (ar ? '🚫 غير متاح' : '🚫 Not Available')}
          </button>
        ) : (
          // Admin / read-only view
          <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {ar ? '👁 ' : '👁 '}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Farmer's Own Listing Card ──────────────────────────────────
interface FarmerListingCardProps {
  listing: Listing; ar: boolean;
  onDelete: (id: string) => void;
  orders: Order[];
}
const FarmerListingCard: React.FC<FarmerListingCardProps> = ({ listing, ar, onDelete, orders }) => {
  const grade = GRADE_CFG[listing.grade];
  const statusCfg = LISTING_STATUS_CFG[listing.status] || LISTING_STATUS_CFG.available;
  const listingOrders = orders.filter(o => o.listingId === listing.id);

  return (
    <div className="card flex flex-col">
      <div className="h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg,${grade.color}60,transparent)` }} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              {listing.cropEmoji}
            </div>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{ar ? listing.cropName : listing.cropNameEn}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDate(listing.createdAt, ar)}</p>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap',
            background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
            {ar ? statusCfg.labelAr : statusCfg.labelEn}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: grade.bg, color: grade.color }}>
            {ar ? grade.labelAr : grade.labelEn}
          </span>
          {listing.exportApproved && (
            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(52,211,153,0.08)', color: 'var(--emerald)', border: '1px solid rgba(52,211,153,0.15)' }}>
              ✓ {ar ? 'معتمد تصدير' : 'Export OK'}
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { labelAr: 'الكمية', labelEn: 'Qty', value: fmtQty(listing.quantity, ar) },
            { labelAr: 'السعر', labelEn: 'Price', value: fmtPrice(listing.pricePerKg, ar) + (ar ? '/كجم' : '/kg') },
            { labelAr: 'جودة AI', labelEn: 'AI Score', value: `${listing.qualityScore}%` },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{ar ? m.labelAr : m.labelEn}</p>
              <p className="text-xs font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Orders on this listing */}
        {listingOrders.length > 0 && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)' }}>
            <p style={{ fontSize: 10, color: 'var(--emerald)', fontWeight: 700, marginBottom: 6 }}>
              📦 {ar ? `${listingOrders.length} طلب` : `${listingOrders.length} order(s)`}
            </p>
            {listingOrders.slice(0, 2).map(o => {
              const scfg = ORDER_STATUS_CFG[o.status];
              return (
                <div key={o.id} className="flex items-center justify-between text-xs py-1">
                  <span style={{ color: 'var(--text-secondary)' }}>{o.buyerName} · {fmtQty(o.quantity, ar)}</span>
                  <span style={{ color: scfg.color, fontWeight: 700 }}>{scfg.icon} {ar ? scfg.labelAr : scfg.labelEn}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onDelete(listing.id)}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'; }}>
          🗑 {ar ? 'حذف الإعلان' : 'Delete Listing'}
        </button>
      </div>
    </div>
  );
};

// ── Add Listing Modal (Farmer) ────────────────────────────────
interface AddListingModalProps {
  ar: boolean; onClose: () => void;
  onSubmit: (payload: CreateListingPayload) => void;
  loading: boolean;
}
const AddListingModal: React.FC<AddListingModalProps> = ({ ar, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState<CreateListingPayload>({
    cropName: '', cropNameEn: '', cropEmoji: '🍅',
    grade: 'A', marketTarget: 'local',
    quantity: 100, pricePerKg: 10,
    description: '', descriptionEn: '',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    exportApproved: false,
  });

  const selectCrop = (crop: typeof CROP_OPTIONS[0]) => {
    setForm(f => ({ ...f, cropName: crop.nameAr, cropNameEn: crop.nameEn, cropEmoji: crop.emoji }));
  };

  const inp = (field: keyof CreateListingPayload, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.cropNameEn || !form.quantity || !form.pricePerKg) return;
    onSubmit(form);
  };

  const fieldStyle = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', outline: 'none', borderRadius: 12,
    padding: '8px 12px', fontSize: 13, width: '100%',
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="card w-full max-w-lg p-6 space-y-5 animate-fadeInUp" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>
              🌾 {ar ? 'إضافة محصول للبيع' : 'Add Crop for Sale'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {ar ? 'سيتم تقييم الجودة بالذكاء الاصطناعي تلقائياً' : 'AI quality score will be assigned automatically'}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop picker */}
        <div>
          <label style={labelStyle}>{ar ? 'اختر المحصول' : 'Select Crop'}</label>
          <div className="grid grid-cols-4 gap-2">
            {CROP_OPTIONS.map(crop => (
              <button key={crop.nameEn} onClick={() => selectCrop(crop)}
                className="flex flex-col items-center p-2.5 rounded-xl transition-all"
                style={{
                  background: form.cropNameEn === crop.nameEn ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.03)',
                  border: form.cropNameEn === crop.nameEn ? '1px solid rgba(52,211,153,0.4)' : '1px solid var(--border)',
                }}>
                <span className="text-xl">{crop.emoji}</span>
                <span className="text-xs font-bold mt-1" style={{ color: form.cropNameEn === crop.nameEn ? 'var(--emerald)' : 'var(--text-muted)' }}>
                  {ar ? crop.nameAr : crop.nameEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grade + Market Target */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>{ar ? 'درجة الجودة' : 'Grade'}</label>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as CropGrade[]).map(g => (
                <button key={g} onClick={() => inp('grade', g)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: form.grade === g ? GRADE_CFG[g].bg : 'rgba(255,255,255,0.03)',
                    color: form.grade === g ? GRADE_CFG[g].color : 'var(--text-muted)',
                    border: `1px solid ${form.grade === g ? GRADE_CFG[g].color + '60' : 'var(--border)'}`,
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>{ar ? 'السوق المستهدف' : 'Target Market'}</label>
            <select value={form.marketTarget} onChange={e => inp('marketTarget', e.target.value)}
              style={{ ...fieldStyle }}>
              {Object.entries(TARGET_CFG).map(([k, v]) => (
                <option key={k} value={k} style={{ background: 'var(--bg-card)' }}>
                  {v.flag} {ar ? v.labelAr : v.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity + Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>{ar ? 'الكمية (كجم)' : 'Quantity (kg)'}</label>
            <input type="number" min={1} value={form.quantity}
              onChange={e => inp('quantity', Number(e.target.value))}
              style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>{ar ? 'السعر/كجم (ج.م)' : 'Price/kg (EGP)'}</label>
            <input type="number" min={0.1} step={0.5} value={form.pricePerKg}
              onChange={e => inp('pricePerKg', Number(e.target.value))}
              style={fieldStyle} />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>{ar ? 'تاريخ الحصاد' : 'Harvest Date'}</label>
            <input type="date" value={form.harvestDate} onChange={e => inp('harvestDate', e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>{ar ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
            <input type="date" value={form.expiryDate} onChange={e => inp('expiryDate', e.target.value)} style={fieldStyle} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>{ar ? 'وصف المحصول (عربي)' : 'Description (Arabic)'}</label>
          <textarea value={form.description} onChange={e => inp('description', e.target.value)}
            rows={2} style={{ ...fieldStyle, resize: 'none' }}
            placeholder={ar ? 'أدخل وصفاً للمحصول...' : 'Enter crop description in Arabic...'} />
        </div>
        <div>
          <label style={labelStyle}>{ar ? 'وصف المحصول (إنجليزي)' : 'Description (English)'}</label>
          <textarea value={form.descriptionEn} onChange={e => inp('descriptionEn', e.target.value)}
            rows={2} style={{ ...fieldStyle, resize: 'none' }}
            placeholder="Enter crop description in English..." />
        </div>

        {/* Export toggle */}
        <div className="flex items-center justify-between rounded-xl p-3"
          style={{ background: form.exportApproved ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              ✓ {ar ? 'معتمد للتصدير' : 'Export Approved'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {ar ? 'المحصول مستوفٍ لمعايير التصدير الدولية' : 'Crop meets international export standards'}
            </p>
          </div>
          <button onClick={() => inp('exportApproved', !form.exportApproved)}
            className="w-12 h-6 rounded-full transition-all flex-shrink-0"
            style={{ background: form.exportApproved ? 'var(--emerald)' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ [ar ? 'right' : 'left']: form.exportApproved ? 26 : 2 }} />
          </button>
        </div>

        {/* Total estimate */}
        {form.quantity > 0 && form.pricePerKg > 0 && (
          <div className="rounded-xl p-3 flex items-center justify-between"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ar ? 'القيمة الإجمالية المتوقعة' : 'Estimated Total Value'}</p>
            <p className="text-lg font-extrabold" style={{ color: 'var(--emerald)' }}>
              {fmtPrice(form.quantity * form.pricePerKg, ar)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {ar ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={handleSubmit} disabled={loading || !form.cropNameEn}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: !form.cropNameEn || loading ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#10b981,#22d3ee)',
              color: '#fff', cursor: !form.cropNameEn || loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? (ar ? 'جارٍ الإضافة...' : 'Adding...') : (ar ? '✅ نشر الإعلان' : '✅ Post Listing')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Orders Table (shared by buyer & admin) ────────────────────
interface OrdersTableProps { orders: Order[]; ar: boolean; adminView?: boolean; }
const OrdersTable: React.FC<OrdersTableProps> = ({ orders, ar, adminView }) => (
  <div className="card">
    <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
        {adminView ? (ar ? 'كل الطلبات' : 'All Orders') : (ar ? 'سجل طلباتي' : 'My Order History')}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {ar ? `${orders.length} طلب إجمالاً` : `${orders.length} orders total`}
      </p>
    </div>
    {orders.length === 0 ? (
      <div className="p-16 text-center">
        <p className="text-4xl mb-3">📦</p>
        <p style={{ color: 'var(--text-muted)' }}>{ar ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
      </div>
    ) : (
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {orders.map(order => {
          const scfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.pending;
          return (
            <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.01] transition-colors">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                {order.cropEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {ar ? order.cropName : order.cropNameEn}
                  </p>
                  <span style={{ padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: GRADE_CFG[order.grade].bg, color: GRADE_CFG[order.grade].color }}>
                    {ar ? GRADE_CFG[order.grade].labelAr : GRADE_CFG[order.grade].labelEn}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {ar ? 'من:' : 'From:'} {ar ? order.farmerName : order.farmerNameEn}
                  {adminView && <> · {ar ? 'المشتري:' : 'Buyer:'} {order.buyerName}</>}
                  {' '}· {fmtQty(order.quantity, ar)} · {fmtDate(order.createdAt, ar)}
                </p>
              </div>
              <div className="text-end flex-shrink-0">
                <p className="font-extrabold" style={{ color: 'var(--emerald)' }}>{fmtPrice(order.totalPrice, ar)}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: scfg.bg, color: scfg.color, marginTop: 4, display: 'inline-block' }}>
                  {scfg.icon} {ar ? scfg.labelAr : scfg.labelEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ── Filter Bar ────────────────────────────────────────────────
const CROPS_AR = ['الكل', 'طماطم', 'برتقال', 'فراولة', 'قمح', 'ذرة', 'بطاطس', 'بصل', 'خيار'];
const CROPS_EN = ['All', 'Tomatoes', 'Oranges', 'Strawberry', 'Wheat', 'Corn', 'Potatoes', 'Onions', 'Cucumber'];

interface FilterBarProps {
  ar: boolean; search: string; setSearch: (v: string) => void;
  cropFilter: string; setCropFilter: (v: string) => void;
  gradeFilter: 'all' | CropGrade; setGradeFilter: (v: 'all' | CropGrade) => void;
  targetFilter: 'all' | MarketTarget; setTargetFilter: (v: 'all' | MarketTarget) => void;
}
const FilterBar: React.FC<FilterBarProps> = ({ ar, search, setSearch, cropFilter, setCropFilter, gradeFilter, setGradeFilter, targetFilter, setTargetFilter }) => (
  <div className="card p-4">
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <svg className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ [ar ? 'right' : 'left']: 12, color: 'var(--text-muted)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={ar ? 'ابحث عن محصول أو مزارع...' : 'Search crop or farmer...'}
          className="w-full rounded-xl py-2 text-sm"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', paddingInlineStart: 36, paddingInlineEnd: 12 }} />
      </div>
      <select value={cropFilter} onChange={e => setCropFilter(e.target.value === 'all' ? '' : e.target.value)}
        className="rounded-xl px-3 py-2 text-sm"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', outline: 'none' }}>
        {(ar ? CROPS_AR : CROPS_EN).map((c, i) => (
          <option key={i} value={i === 0 ? '' : c} style={{ background: 'var(--bg-card)' }}>{c}</option>
        ))}
      </select>
      {(['all', 'A', 'B', 'C'] as const).map(g => (
        <button key={g} onClick={() => setGradeFilter(g)}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{
            background: gradeFilter === g ? (g === 'all' ? 'rgba(52,211,153,0.15)' : GRADE_CFG[g]?.bg) : 'rgba(255,255,255,0.03)',
            color: gradeFilter === g ? (g === 'all' ? 'var(--emerald)' : GRADE_CFG[g]?.color) : 'var(--text-muted)',
            border: `1px solid ${gradeFilter === g ? (g === 'all' ? 'rgba(52,211,153,0.3)' : GRADE_CFG[g]?.color + '40') : 'var(--border)'}`,
          }}>
          {g === 'all' ? (ar ? 'كل الدرجات' : 'All Grades') : (ar ? GRADE_CFG[g].labelAr : GRADE_CFG[g].labelEn)}
        </button>
      ))}
      <select value={targetFilter} onChange={e => setTargetFilter(e.target.value as 'all' | MarketTarget)}
        className="rounded-xl px-3 py-2 text-sm"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', outline: 'none' }}>
        <option value="all" style={{ background: 'var(--bg-card)' }}>{ar ? 'كل الأسواق' : 'All Markets'}</option>
        {Object.entries(TARGET_CFG).map(([k, v]) => (
          <option key={k} value={k} style={{ background: 'var(--bg-card)' }}>{v.flag} {ar ? v.labelAr : v.labelEn}</option>
        ))}
      </select>
    </div>
  </div>
);

// ── Stats Bar ─────────────────────────────────────────────────
const StatsBar: React.FC<{ stats: MarketStats; ar: boolean; role: string }> = ({ stats, ar, role }) => {
  const items = [
    { labelAr: 'إجمالي المنتجات', labelEn: 'Listings', value: stats.totalListings, color: 'var(--emerald)', suffix: '' },
    { labelAr: 'حجم الكميات', labelEn: 'Volume', value: (stats.totalVolume / 1000).toFixed(1), color: 'var(--cyan)', suffix: ar ? ' طن' : 'T' },
    { labelAr: 'إجمالي القيمة', labelEn: 'Value', value: (stats.totalValue / 1000).toFixed(0) + 'K', color: '#34d399', suffix: ar ? ' ج.م' : 'EGP' },
    { labelAr: 'متوسط الجودة', labelEn: 'Avg Quality', value: stats.avgQualityScore, color: 'var(--amber)', suffix: '%' },
    { labelAr: 'Grade A %', labelEn: 'Grade A', value: stats.gradeAPercent, color: '#34d399', suffix: '%' },
    { labelAr: 'جاهز للتصدير', labelEn: 'Export Ready', value: stats.exportReadyPercent, color: 'var(--cyan)', suffix: '%' },
    ...(role === 'admin' ? [
      { labelAr: 'إجمالي الطلبات', labelEn: 'Total Orders', value: stats.totalOrders, color: '#a78bfa', suffix: '' },
      { labelAr: 'طلبات معلقة', labelEn: 'Pending', value: stats.pendingOrders, color: '#fbbf24', suffix: '' },
    ] : []),
  ];
  return (
    <div className={`grid gap-3 ${role === 'admin' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
      {items.map((s, i) => (
        <div key={i} className="card p-4 text-center">
          <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}{s.suffix}</p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {ar ? s.labelAr : s.labelEn}
          </p>
        </div>
      ))}
    </div>
  );
};

// ── Listings Grid ─────────────────────────────────────────────
interface ListingsGridProps {
  listings: Listing[]; ar: boolean; loading: boolean;
  canBuy: boolean;
  onBuy: (l: Listing) => void;
  onReset: () => void;
  page: number; totalPages: number; setPage: (p: number) => void;
}
const ListingsGrid: React.FC<ListingsGridProps> = ({ listings, ar, loading, canBuy, onBuy, onReset, page, totalPages, setPage }) => {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card" style={{ height: 380, animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  );
  if (listings.length === 0) return (
    <div className="card p-16 text-center">
      <p className="text-4xl mb-3">🌾</p>
      <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{ar ? 'لا توجد منتجات تطابق البحث' : 'No listings match your filters'}</p>
      <button onClick={onReset} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold"
        style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--emerald)', border: '1px solid rgba(52,211,153,0.2)' }}>
        {ar ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
      </button>
    </div>
  );
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {listings.map(l => <ListingCard key={l.id} listing={l} ar={ar} onBuy={onBuy} canBuy={canBuy} />)}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-secondary)' }}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
              style={{
                background: page === p ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
                color: page === p ? 'var(--emerald)' : 'var(--text-muted)',
                border: page === p ? '1px solid rgba(52,211,153,0.3)' : '1px solid var(--border)',
              }}>{p}</button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)' }}>→</button>
        </div>
      )}
    </>
  );
};

// ── Role Banner ───────────────────────────────────────────────
const RoleBanner: React.FC<{ role: string; ar: boolean }> = ({ role, ar }) => {
  const config: Record<string, { icon: string; color: string; bg: string; border: string; msgAr: string; msgEn: string }> = {
    farmer:   { icon: '🌾', color: '#34d399', bg: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.2)', msgAr: 'أنت تستخدم النظام كمزارع.', msgEn: "You're logged in as a Farmer" },
    trader:   { icon: '🏪', color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)', msgAr: 'أنت تستخدم النظام كتاجر — يمكنك شراء المحاصيل من المزارعين وإدارة طلباتك.', msgEn: "You're logged in as a Trader — you can browse and buy crops from farmers." },
    exporter: { icon: '✈️', color: '#22d3ee', bg: 'rgba(34,211,238,0.06)', border: 'rgba(34,211,238,0.2)', msgAr: 'أنت تستخدم النظام كمصدِّر.', msgEn: "You're logged in as an Exporter  ." },
   
  };
  const c = config[role];
  if (!c) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="text-xl">{c.icon}</span>
      <p className="text-sm font-semibold" style={{ color: c.color }}>{ar ? c.msgAr : c.msgEn}</p>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const MarketplacePage: React.FC = () => {
  const { language, user } = useApp();
  const ar = language === 'ar';
  const role = user?.role ?? 'admin';
  const isFarmer = role === 'farmer';
  const isBuyer = role === 'trader' || role === 'exporter';
  const isAdmin = role === 'admin';

  // Mock farmerId: in production, use user.id
  const FARMER_ID = 'farmer-1';

  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingListings, setLoadingListings] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Tabs per role
  type FarmerTab = 'mylistings' | 'farmerorders';
  type BuyerTab = 'browse' | 'myorders';
  type AdminTab = 'browse' | 'allorders';
  const [farmerTab, setFarmerTab] = useState<FarmerTab>('mylistings');
  const [buyerTab, setBuyerTab] = useState<BuyerTab>('browse');
  const [adminTab, setAdminTab] = useState<AdminTab>('browse');

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | CropGrade>('all');
  const [targetFilter, setTargetFilter] = useState<'all' | MarketTarget>('all');
  const [cropFilter, setCropFilter] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 6;

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshStats = () => {
    marketplaceApi.getStats().then(r => { if (r.success) setStats(r.data); });
  };

  // Fetch all public listings (buyer & admin browse)
  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const filter: ListingsFilter = { page, limit: LIMIT, search, grade: gradeFilter, marketTarget: targetFilter, crop: cropFilter || undefined };
      const res = await marketplaceApi.getListings(filter);
      if (res.success) { setListings(res.data.items); setTotalPages(res.data.totalPages); setTotalItems(res.data.total); }
    } finally { setLoadingListings(false); }
  }, [page, search, gradeFilter, targetFilter, cropFilter]);

  // Fetch farmer's own listings
  const fetchMyListings = useCallback(async () => {
    const res = await marketplaceApi.getListings({ farmerId: FARMER_ID, limit: 50 });
    if (res.success) setMyListings(res.data.items);
  }, []);

  useEffect(() => {
    refreshStats();
    if (isBuyer || isAdmin) fetchListings();
    if (isFarmer) { fetchMyListings(); marketplaceApi.getFarmerOrders(FARMER_ID).then(r => { if (r.success) setOrders(r.data); }); }
    if (isBuyer) { marketplaceApi.getMyOrders().then(r => { if (r.success) setOrders(r.data); }); }
    if (isAdmin) { marketplaceApi.getAllOrders().then(r => { if (r.success) setAllOrders(r.data); }); }
  }, []);

  useEffect(() => { if (isBuyer || isAdmin) fetchListings(); }, [fetchListings]);
  useEffect(() => { setPage(1); }, [search, gradeFilter, targetFilter, cropFilter]);

  const resetFilters = () => { setSearch(''); setGradeFilter('all'); setTargetFilter('all'); setCropFilter(''); };

  // ── Buy (Trader / Exporter) ──
  const handleBuy = async (qty: number) => {
    if (!selectedListing || !user) return;
    setBuyLoading(true);
    try {
      const res = await marketplaceApi.createOrder({
        listingId: selectedListing.id, quantity: qty,
        buyerName: user.name, buyerRole: user.role,
      });
      if (res.success) {
        setOrders(prev => [res.data, ...prev]);
        showToast(ar ? `✅ تم تأكيد الطلب: ${qty.toLocaleString()} كجم ${selectedListing.cropName}` : `Order confirmed: ${qty.toLocaleString()} kg ${selectedListing.cropNameEn}`, 'success');
        setSelectedListing(null);
        fetchListings();
        refreshStats();
      }
    } catch { showToast(ar ? 'فشل إرسال الطلب' : 'Order failed, please retry', 'error'); }
    finally { setBuyLoading(false); }
  };

  // ── Add Listing (Farmer) ──
  const handleAddListing = async (payload: CreateListingPayload) => {
    setAddLoading(true);
    try {
      const res = await marketplaceApi.createListing(payload, FARMER_ID, user?.name ?? 'مزارع', user?.name ?? 'Farmer');
      if (res.success) {
        setShowAddModal(false);
        fetchMyListings();
        refreshStats();
        showToast(ar ? '✅ تم نشر الإعلان بنجاح' : '✅ Listing posted successfully!', 'success');
      }
    } catch { showToast(ar ? 'فشل نشر الإعلان' : 'Failed to post listing', 'error'); }
    finally { setAddLoading(false); }
  };

  // ── Delete Listing (Farmer) ──
  const handleDeleteListing = async (id: string) => {
    await marketplaceApi.deleteListing(id);
    fetchMyListings();
    refreshStats();
    showToast(ar ? 'تم حذف الإعلان' : 'Listing deleted', 'info');
  };

  // ── Page Header ──
  const roleSubtitles: Record<string, { ar: string; en: string }> = {
    farmer:   { ar: 'انشر محاصيلك وابدأ البيع', en: 'Post your crops and start selling' },
    trader:   { ar: 'تصفح المحاصيل واشتري مباشرة من المزارعين', en: 'Browse AI-graded crops and buy directly from farmers' },
    exporter: { ar: 'تصفح المحاصيل المعتمدة للتصدير واشتري بسهولة', en: 'Browse export-certified crops and place orders' },
    admin:    { ar: 'مراقبة نشاط السوق والمنتجات والطلبات', en: 'Monitor market activity, listings, and orders' },
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="animate-fadeInUp flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge">Live Market</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {ar ? 'سوق المحاصيل الذكي' : 'Smart Crop Marketplace'}
            </span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">{ar ? 'السوق الزراعي' : 'Agri Marketplace'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {ar ? roleSubtitles[role]?.ar : roleSubtitles[role]?.en}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--emerald)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--emerald)' }}>
              {ar ? `${totalItems || (isFarmer ? myListings.length : 0)} منتج` : `${totalItems || (isFarmer ? myListings.length : 0)} listings`}
            </span>
          </div>
          {/* Farmer: Add button */}
          {isFarmer && (
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#10b981,#22d3ee)', color: '#fff' }}>
              ➕ {ar ? 'إضافة محصول' : 'Add Listing'}
            </button>
          )}
        </div>
      </div>

      {/* Role Banner */}
      <RoleBanner role={role} ar={ar} />

      {/* Stats */}
      {stats && <StatsBar stats={stats} ar={ar} role={role} />}

      {/* ══════════════ FARMER VIEW ══════════════ */}
      {isFarmer && (
        <>
          {/* Farmer Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {[
              { key: 'mylistings', labelAr: `إعلاناتي (${myListings.length})`, labelEn: `My Listings (${myListings.length})`, icon: '🌾' },
              { key: 'farmerorders', labelAr: `الطلبات الواردة (${orders.length})`, labelEn: `Incoming Orders (${orders.length})`, icon: '📦' },
            ].map(t => (
              <button key={t.key} onClick={() => setFarmerTab(t.key as FarmerTab)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: farmerTab === t.key ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(34,211,238,0.1))' : 'transparent',
                  color: farmerTab === t.key ? 'var(--emerald)' : 'var(--text-muted)',
                  border: farmerTab === t.key ? '1px solid rgba(52,211,153,0.25)' : '1px solid transparent',
                }}>
                {t.icon} {ar ? t.labelAr : t.labelEn}
              </button>
            ))}
          </div>

          {farmerTab === 'mylistings' && (
            <>
              {myListings.length === 0 ? (
                <div className="card p-16 text-center">
                  <p className="text-5xl mb-4">🌾</p>
                  <p className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                    {ar ? 'لا توجد إعلانات بعد' : 'No listings yet'}
                  </p>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                    {ar ? 'أضف أول محصول لك وابدأ البيع فوراً' : 'Add your first crop and start selling right away'}
                  </p>
                  <button onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 rounded-xl text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#10b981,#22d3ee)', color: '#fff' }}>
                    ➕ {ar ? 'إضافة محصول' : 'Add Listing'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myListings.map(l => (
                    <FarmerListingCard key={l.id} listing={l} ar={ar} onDelete={handleDeleteListing} orders={orders} />
                  ))}
                </div>
              )}
            </>
          )}

          {farmerTab === 'farmerorders' && (
            <OrdersTable orders={orders} ar={ar} adminView={false} />
          )}
        </>
      )}

      {/* ══════════════ BUYER VIEW (Trader / Exporter) ══════════════ */}
      {isBuyer && (
        <>
          {/* Buyer Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {[
              { key: 'browse', labelAr: 'تصفح المنتجات', labelEn: 'Browse Listings', icon: '🏪' },
              { key: 'myorders', labelAr: `طلباتي (${orders.length})`, labelEn: `My Orders (${orders.length})`, icon: '📦' },
            ].map(t => (
              <button key={t.key} onClick={() => setBuyerTab(t.key as BuyerTab)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: buyerTab === t.key ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(34,211,238,0.1))' : 'transparent',
                  color: buyerTab === t.key ? 'var(--emerald)' : 'var(--text-muted)',
                  border: buyerTab === t.key ? '1px solid rgba(52,211,153,0.25)' : '1px solid transparent',
                }}>
                {t.icon} {ar ? t.labelAr : t.labelEn}
              </button>
            ))}
          </div>

          {buyerTab === 'browse' && (
            <>
              <FilterBar ar={ar} search={search} setSearch={setSearch} cropFilter={cropFilter} setCropFilter={setCropFilter}
                gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} targetFilter={targetFilter} setTargetFilter={setTargetFilter} />
              <ListingsGrid listings={listings} ar={ar} loading={loadingListings} canBuy={true}
                onBuy={setSelectedListing} onReset={resetFilters} page={page} totalPages={totalPages} setPage={setPage} />
            </>
          )}

          {buyerTab === 'myorders' && <OrdersTable orders={orders} ar={ar} />}
        </>
      )}

      {/* ══════════════ ADMIN VIEW ══════════════ */}
      {isAdmin && (
        <>
          {/* Admin Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {[
              { key: 'browse', labelAr: 'مراقبة المنتجات', labelEn: 'Monitor Listings', icon: '👁' },
              { key: 'allorders', labelAr: `كل الطلبات (${allOrders.length})`, labelEn: `All Orders (${allOrders.length})`, icon: '📊' },
            ].map(t => (
              <button key={t.key} onClick={() => setAdminTab(t.key as AdminTab)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: adminTab === t.key ? 'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(34,211,238,0.1))' : 'transparent',
                  color: adminTab === t.key ? '#a78bfa' : 'var(--text-muted)',
                  border: adminTab === t.key ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
                }}>
                {t.icon} {ar ? t.labelAr : t.labelEn}
              </button>
            ))}
          </div>

          {adminTab === 'browse' && (
            <>
              <FilterBar ar={ar} search={search} setSearch={setSearch} cropFilter={cropFilter} setCropFilter={setCropFilter}
                gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} targetFilter={targetFilter} setTargetFilter={setTargetFilter} />
              <ListingsGrid listings={listings} ar={ar} loading={loadingListings} canBuy={false}
                onBuy={() => {}} onReset={resetFilters} page={page} totalPages={totalPages} setPage={setPage} />
            </>
          )}

          {adminTab === 'allorders' && <OrdersTable orders={allOrders} ar={ar} adminView={true} />}
        </>
      )}

      {/* Modals */}
      {selectedListing && (
        <BuyModal listing={selectedListing} ar={ar}
          onClose={() => setSelectedListing(null)} onConfirm={handleBuy} loading={buyLoading} />
      )}
      {showAddModal && (
        <AddListingModal ar={ar} onClose={() => setShowAddModal(false)} onSubmit={handleAddListing} loading={addLoading} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default MarketplacePage;
