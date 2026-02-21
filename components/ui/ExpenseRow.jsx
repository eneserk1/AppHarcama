'use client';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Zap,
  Car,
  Utensils,
  MoreHorizontal,
  Tag,
  Trash2,
  X,
  Check,
} from 'lucide-react';

const CATEGORY_META = {
  Market: { Icon: ShoppingCart, color: '#34C759', bg: '#E8F9ED' },
  Fatura: { Icon: Zap, color: '#FF9500', bg: '#FFF3E0' },
  Ulasim: { Icon: Car, color: '#007AFF', bg: '#E3F2FD' },
  Yemek: { Icon: Utensils, color: '#FF3B30', bg: '#FFEBEE' },
  Diger: { Icon: MoreHorizontal, color: '#8E8E93', bg: '#F2F2F7' },
};

function getCategoryMeta(name) {
  return CATEGORY_META[name] || { Icon: Tag, color: '#5856D6', bg: '#EDECFB' };
}

function formatMoney(v) {
  return `₺${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function relativeDay(isoStr) {
  const d = new Date(isoStr);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const day = d.toISOString().slice(0, 10);
  if (day === today) return 'Bugun';
  if (day === yesterday) return 'Dun';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export default function ExpenseRow({
  it,
  isDark,
  sessionUserId,
  memberMap,
  editExpenseId,
  editAmount,
  setEditAmount,
  editDate,
  setEditDate,
  editCategory,
  setEditCategory,
  editNote,
  setEditNote,
  effectiveCategories,
  handleStartEditExpense,
  handleSaveEditExpense,
  handleCancelEditExpense,
  handleDeleteExpense,
  staggerIndex = 0,
}) {
  const { Icon, color, bg } = getCategoryMeta(it.category);
  const isOwn = it.user_id === sessionUserId;
  const isEditing = editExpenseId === it.id;
  const member = memberMap?.get(it.user_id) || 'Kullanici';
  const delay = Math.min(staggerIndex * 0.04, 0.5);

  const inputClass = `w-full rounded-[10px] px-3 py-3 text-[15px] outline-none ${
    isDark
      ? 'bg-[#2C2C2E] text-white placeholder-white/30'
      : 'bg-[#F2F2F7] text-black placeholder-black/30'
  }`;

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mx-4 mb-1 rounded-[16px] p-4 border ${
          isDark ? 'bg-[#1C1C1E] border-white/[0.06]' : 'bg-white border-black/[0.06]'
        }`}
      >
        <p className={`text-[17px] font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
          Duzenle
        </p>
        <div className="flex flex-col gap-2">
          <div>
            <label
              className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${
                isDark ? 'text-white/40' : 'text-black/40'
              }`}
            >
              Tutar
            </label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label
              className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${
                isDark ? 'text-white/40' : 'text-black/40'
              }`}
            >
              Tarih
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${
                isDark ? 'text-white/40' : 'text-black/40'
              }`}
            >
              Kategori
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {effectiveCategories?.map((c) => {
                const m = getCategoryMeta(c);
                const active = editCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setEditCategory(c)}
                    className="rounded-full px-3 py-1.5 text-[12px] font-semibold border transition-all"
                    style={{
                      backgroundColor: active ? m.bg : 'transparent',
                      color: active
                        ? m.color
                        : isDark
                          ? 'rgba(235,235,245,0.4)'
                          : 'rgba(60,60,67,0.4)',
                      borderColor: active
                        ? m.color
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(0,0,0,0.12)',
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label
              className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${
                isDark ? 'text-white/40' : 'text-black/40'
              }`}
            >
              Not
            </label>
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className={inputClass}
              placeholder="Opsiyonel"
            />
          </div>
          <div className="flex gap-2 mt-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSaveEditExpense}
              className="flex-1 py-3 bg-[#007AFF] text-white rounded-[12px] text-[15px] font-semibold flex items-center justify-center gap-1.5"
            >
              <Check size={16} /> Kaydet
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCancelEditExpense}
              className={`flex-1 py-3 rounded-[12px] text-[15px] font-semibold border ${
                isDark ? 'border-white/20 text-white/60' : 'border-black/20 text-black/60'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <X size={16} /> Iptal
              </span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleDeleteExpense(it.id)}
              className="px-4 py-3 rounded-[12px] border border-[#FF3B30]/30 text-[#FF3B30]"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 20, stiffness: 200 }}
      className={`mx-4 mb-0.5 rounded-[16px] overflow-hidden ${
        isDark ? 'bg-[#1C1C1E]' : 'bg-white'
      }`}
    >
      <button
        onClick={() => isOwn && handleStartEditExpense(it)}
        className="w-full flex items-center px-4 py-[14px] gap-3.5 active:opacity-70 transition-opacity text-left"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          <Icon size={18} color={color} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[16px] font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>
            {it.category}
          </p>
          <p className={`text-[13px] mt-0.5 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
            {relativeDay(it.spent_at)} · {member}
          </p>
          {it.note ? (
            <p
              className={`text-[13px] italic truncate mt-0.5 ${isDark ? 'text-white/40' : 'text-black/40'}`}
            >
              {it.note}
            </p>
          ) : null}
          {it.taksit_toplam ? (
            <span
              className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#5856D6' + '22', color: '#5856D6' }}
            >
              {it.taksit_no}/{it.taksit_toplam} Taksit
            </span>
          ) : null}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[17px] font-semibold" style={{ color }}>
            {formatMoney(it.amount)}
          </p>
          {isOwn && (
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
              Duzenle
            </p>
          )}
        </div>
      </button>
    </motion.div>
  );
}
