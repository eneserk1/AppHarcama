'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { ShoppingCart, Zap, Car, Utensils, MoreHorizontal, Tag, CheckCircle2 } from 'lucide-react';

const CATEGORY_META = {
  'Market': { Icon: ShoppingCart, color: '#34C759', bg: '#E8F9ED' },
  'Fatura': { Icon: Zap, color: '#FF9500', bg: '#FFF3E0' },
  'Ulasim': { Icon: Car, color: '#007AFF', bg: '#E3F2FD' },
  'Yemek': { Icon: Utensils, color: '#FF3B30', bg: '#FFEBEE' },
  'Diger': { Icon: MoreHorizontal, color: '#8E8E93', bg: '#F2F2F7' },
};

function getCategoryMeta(name) {
  return CATEGORY_META[name] || { Icon: Tag, color: '#5856D6', bg: '#EDECFB' };
}

export default function AddTab({
  amount,
  setAmount,
  expenseDate,
  setExpenseDate,
  note,
  setNote,
  category,
  setCategory,
  effectiveCategories,
  canAddExpense,
  handleAddExpense,
  isDark,
  isTaksit,
  setIsTaksit,
  taksitCount,
  setTaksitCount,
}) {
  const [catBounce, setCatBounce] = useState(null);
  const amountLen = amount.length;
  const amountFontSize = amountLen > 10 ? 30 : amountLen > 7 ? 38 : 48;

  function selectCategory(c) {
    setCategory(c);
    setCatBounce(c);
    setTimeout(() => setCatBounce(null), 400);
  }

  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const border = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const inputBg = isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]';
  const textColor = isDark ? 'text-white' : 'text-black';
  const dimColor = isDark ? 'text-white/40' : 'text-black/40';
  const divider = isDark ? 'border-white/[0.08]' : 'border-black/[0.06]';
  const bgColor = isDark ? 'bg-black' : 'bg-[#F2F2F7]';

  return (
    <div className={`h-full overflow-y-auto no-scrollbar pb-28 ${bgColor}`}>
      {/* Header */}
      <div className="px-5 pt-16 pb-3">
        <h1 className={`text-[34px] font-bold tracking-tight ${textColor}`}>Harcama Ekle</h1>
      </div>

      {/* Amount Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="mx-4 mb-4 rounded-[28px] bg-[#007AFF] p-7 shadow-xl shadow-blue-500/30"
      >
        <p className="text-white/70 text-[12px] font-semibold uppercase tracking-widest mb-3">Tutar</p>
        <div className="flex items-center justify-end">
          <span className="text-white/60 text-[34px] font-light mr-2">₺</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="bg-transparent text-white font-bold flex-1 min-w-0 outline-none text-right placeholder-white/30"
            style={{ fontSize: amountFontSize, letterSpacing: '-0.04em' }}
          />
        </div>
        {canAddExpense && (
          <>
            <div className="mt-4 h-px bg-white/20" />
            <p className="text-white/70 text-[13px] mt-3">
              {expenseDate} · {category}
            </p>
          </>
        )}
      </motion.div>

      {/* Category grid */}
      <div className="mx-4 mb-4">
        <p className={`text-[12px] font-semibold uppercase tracking-wider mb-3 pl-1 ${dimColor}`}>
          Kategori
        </p>
        <div className="flex flex-wrap gap-2.5">
          {(effectiveCategories || []).map((c) => {
            const { Icon, color, bg } = getCategoryMeta(c);
            const active = category === c;
            return (
              <motion.button
                key={c}
                onClick={() => selectCategory(c)}
                whileTap={{ scale: 0.9 }}
                animate={catBounce === c ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
                transition={
                  catBounce === c
                    ? { type: 'spring', damping: 8, stiffness: 400, mass: 0.25 }
                    : {}
                }
                className={`flex flex-col items-center gap-2 rounded-[16px] p-3 border ${border} transition-colors duration-200`}
                style={{
                  width: 'calc(33.33% - 7px)',
                  flexGrow: 1,
                  backgroundColor: active ? bg : isDark ? '#1C1C1E' : 'white',
                  boxShadow: active ? `0 2px 12px ${color}22` : undefined,
                }}
              >
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors duration-200"
                  style={{
                    backgroundColor: active ? color : isDark ? '#2C2C2E' : '#F2F2F7',
                  }}
                >
                  <Icon
                    size={22}
                    color={
                      active
                        ? '#fff'
                        : isDark
                          ? 'rgba(235,235,245,0.4)'
                          : 'rgba(60,60,67,0.4)'
                    }
                    strokeWidth={1.8}
                  />
                </div>
                <span
                  className="text-[12px] font-semibold text-center leading-tight transition-colors duration-200"
                  style={{
                    color: active
                      ? color
                      : isDark
                        ? 'rgba(235,235,245,0.4)'
                        : 'rgba(60,60,67,0.4)',
                  }}
                >
                  {c}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Date + Note */}
      <div className={`mx-4 mb-4 rounded-[20px] border ${cardBg} ${border} overflow-hidden`}>
        <div className="p-4">
          <p className={`text-[12px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>
            Tarih
          </p>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className={`w-full rounded-[12px] px-3 py-3 text-[16px] outline-none ${inputBg} ${textColor}`}
          />
        </div>
        <div className={`border-t ${divider} p-4`}>
          <p className={`text-[12px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>
            Not (Opsiyonel)
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Aciklama ekle..."
            rows={3}
            className={`w-full rounded-[12px] px-3 py-3 text-[16px] outline-none resize-none ${inputBg} ${textColor} placeholder:${dimColor}`}
          />
        </div>
      </div>

      {/* Taksit */}
      <div className={`mx-4 mb-4 rounded-[20px] border ${cardBg} ${border} overflow-hidden`}>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className={`text-[15px] font-semibold ${textColor}`}>Taksitli Alim</p>
            <p className={`text-[12px] mt-0.5 ${dimColor}`}>
              {isTaksit ? `${taksitCount} ay boyunca` : 'Tek seferlik odeme'}
            </p>
          </div>
          <button
            onClick={() => setIsTaksit(!isTaksit)}
            className={`w-12 h-7 rounded-full transition-all duration-200 relative flex-shrink-0`}
            style={{ backgroundColor: isTaksit ? '#007AFF' : isDark ? '#3A3A3C' : '#E5E5EA' }}
          >
            <span
              className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-all duration-200"
              style={{ left: isTaksit ? '22px' : '2px' }}
            />
          </button>
        </div>
        {isTaksit && (
          <div className={`border-t ${divider} p-4`}>
            <p className={`text-[12px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>
              Taksit Sayisi
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTaksitCount((v) => String(Math.max(2, parseInt(v) - 1)))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${isDark ? 'bg-[#2C2C2E] text-white' : 'bg-[#F2F2F7] text-black'}`}
              >
                −
              </button>
              <input
                type="number"
                value={taksitCount}
                onChange={(e) => setTaksitCount(String(Math.max(2, Math.min(60, parseInt(e.target.value) || 2))))}
                className={`flex-1 text-center rounded-[12px] px-3 py-3 text-[20px] font-bold outline-none ${inputBg} ${textColor}`}
                min="2"
                max="60"
              />
              <button
                onClick={() => setTaksitCount((v) => String(Math.min(60, parseInt(v) + 1)))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${isDark ? 'bg-[#2C2C2E] text-white' : 'bg-[#F2F2F7] text-black'}`}
              >
                +
              </button>
            </div>
            {Number(amount) > 0 && (
              <div className={`mt-3 rounded-[12px] p-3 ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]'}`}>
                <p className={`text-[13px] text-center ${dimColor}`}>
                  Aylik <span className="font-bold" style={{ color: '#007AFF' }}>
                    ₺{Number(Number(amount.replace(',','.')).toFixed(2)).toLocaleString('tr-TR', {minimumFractionDigits:2})}
                  </span>
                  {' · '}
                  {taksitCount} ay
                  {' · '}
                  Toplam <span className="font-bold" style={{ color: '#5856D6' }}>
                    ₺{(Number(amount.replace(',','.')) * parseInt(taksitCount)).toLocaleString('tr-TR', {minimumFractionDigits:2})}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="mx-4">
        <motion.button
          animate={canAddExpense ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={
            canAddExpense ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } : {}
          }
          whileTap={{ scale: 0.96 }}
          onClick={handleAddExpense}
          disabled={!canAddExpense}
          className="w-full py-5 rounded-[20px] text-[17px] font-bold flex items-center justify-center gap-2.5 transition-all"
          style={{
            backgroundColor: canAddExpense ? '#007AFF' : isDark ? '#1C1C1E' : 'white',
            color: canAddExpense
              ? 'white'
              : isDark
                ? 'rgba(235,235,245,0.3)'
                : 'rgba(60,60,67,0.3)',
            boxShadow: canAddExpense ? '0 6px 24px rgba(0,122,255,0.35)' : undefined,
          }}
        >
          <CheckCircle2 size={22} strokeWidth={2} />
          {canAddExpense ? (isTaksit ? `${taksitCount} Taksit Kaydet` : 'Harcama Kaydet') : 'Tutar gir'}
        </motion.button>
      </div>
    </div>
  );
}
