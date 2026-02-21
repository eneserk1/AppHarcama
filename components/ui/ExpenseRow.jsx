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
  CreditCard,
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
  editTaksitNo,
  editTaksitToplam,
  editIsTaksit,
  setEditIsTaksit,
  editTaksitCount,
  setEditTaksitCount,
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

  const { Icon: EditIcon, color: editColor } = getCategoryMeta(editCategory);

  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const border = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const inputBg = isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]';
  const textColor = isDark ? 'text-white' : 'text-black';
  const dimColor = isDark ? 'text-white/40' : 'text-black/40';
  const divider = isDark ? 'border-white/[0.08]' : 'border-black/[0.06]';

  const inputClass = `w-full rounded-[12px] px-4 py-3.5 text-[16px] outline-none ${inputBg} ${textColor}`;

  // Bu kayit taksitli mi (orijinal)
  const wasAlreadyTaksit = !!editTaksitToplam;

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className={`mx-4 mb-3 rounded-[24px] border ${cardBg} ${border} overflow-hidden`}
        style={{ boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.10)' }}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${editColor}18 0%, ${editColor}06 100%)` }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: editColor + '20' }}
          >
            <EditIcon size={20} color={editColor} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[18px] font-bold ${textColor}`}>Kaydi Duzenle</p>
            {wasAlreadyTaksit ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                style={{ backgroundColor: '#5856D622', color: '#5856D6' }}
              >
                <CreditCard size={10} />
                {editTaksitNo}/{editTaksitToplam} Taksit
              </span>
            ) : (
              <p className={`text-[12px] mt-0.5 ${dimColor}`}>Tek seferlik harcama</p>
            )}
          </div>
          <button
            onClick={handleCancelEditExpense}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-black/06'}`}
          >
            <X size={15} color={isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)'} />
          </button>
        </div>

        <div className={`border-t ${divider}`} />

        {/* Tutar */}
        <div className="px-5 pt-4">
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>Tutar</p>
          <div
            className="flex items-center gap-2 rounded-[14px] px-4 py-3"
            style={{ backgroundColor: editColor + '12' }}
          >
            <span className="text-[22px] font-light" style={{ color: editColor }}>₺</span>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="flex-1 bg-transparent text-[26px] font-bold outline-none text-right"
              style={{ color: editColor }}
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Tarih */}
        <div className="px-5 pt-4">
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>Tarih</p>
          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={inputClass} />
        </div>

        {/* Kategori */}
        <div className="px-5 pt-4">
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>Kategori</p>
          <div className="flex flex-wrap gap-2">
            {effectiveCategories?.map((c) => {
              const m = getCategoryMeta(c);
              const active = editCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setEditCategory(c)}
                  className="rounded-full px-3.5 py-2 text-[13px] font-semibold border transition-all duration-150"
                  style={{
                    backgroundColor: active ? m.bg : 'transparent',
                    color: active ? m.color : isDark ? 'rgba(235,235,245,0.4)' : 'rgba(60,60,67,0.4)',
                    borderColor: active ? m.color + '80' : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                    boxShadow: active ? `0 2px 8px ${m.color}30` : undefined,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Not */}
        <div className="px-5 pt-4">
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dimColor}`}>
            Not <span className="normal-case font-normal">(opsiyonel)</span>
          </p>
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            className={inputClass}
            placeholder="Aciklama ekle..."
          />
        </div>

        {/* Taksit bolumu — sadece taksitsiz kayitlarda goster */}
        {!wasAlreadyTaksit && (
          <div className="px-5 pt-4">
            <div className={`rounded-[16px] border ${border} overflow-hidden`}>
              {/* Toggle satiri */}
              <div className={`p-4 flex items-center justify-between ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#F9F9FB]'}`}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: editIsTaksit ? '#5856D622' : isDark ? '#3A3A3C' : '#EBEBF0' }}
                  >
                    <CreditCard size={15} color={editIsTaksit ? '#5856D6' : isDark ? 'rgba(235,235,245,0.4)' : 'rgba(60,60,67,0.3)'} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className={`text-[14px] font-semibold ${textColor}`}>Taksitli Alim</p>
                    <p className={`text-[11px] ${dimColor}`}>
                      {editIsTaksit ? `${editTaksitCount} ay boyunca` : 'Tek seferlik odeme'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditIsTaksit(!editIsTaksit)}
                  className="w-12 h-7 rounded-full relative flex-shrink-0 transition-all duration-200"
                  style={{ backgroundColor: editIsTaksit ? '#5856D6' : isDark ? '#3A3A3C' : '#E5E5EA' }}
                >
                  <span
                    className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-all duration-200"
                    style={{ left: editIsTaksit ? '22px' : '2px' }}
                  />
                </button>
              </div>

              {/* Taksit sayisi secici */}
              {editIsTaksit && (
                <div className={`border-t ${divider} p-4`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${dimColor}`}>Taksit Sayisi</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditTaksitCount((v) => String(Math.max(2, parseInt(v) - 1)))}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${isDark ? 'bg-[#3A3A3C] text-white' : 'bg-[#EBEBF0] text-black'}`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={editTaksitCount}
                      onChange={(e) => setEditTaksitCount(String(Math.max(2, Math.min(60, parseInt(e.target.value) || 2))))}
                      className={`flex-1 text-center rounded-[12px] px-3 py-3 text-[20px] font-bold outline-none ${inputBg} ${textColor}`}
                      min="2"
                      max="60"
                    />
                    <button
                      onClick={() => setEditTaksitCount((v) => String(Math.min(60, parseInt(v) + 1)))}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${isDark ? 'bg-[#3A3A3C] text-white' : 'bg-[#EBEBF0] text-black'}`}
                    >
                      +
                    </button>
                  </div>
                  {Number(editAmount) > 0 && (
                    <div className={`mt-3 rounded-[12px] p-3 ${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'}`}>
                      <p className={`text-[13px] text-center ${dimColor}`}>
                        Aylik{' '}
                        <span className="font-bold" style={{ color: '#5856D6' }}>
                          ₺{Number(Number(editAmount).toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                        {' · '}
                        {editTaksitCount} ay
                        {' · '}
                        Toplam{' '}
                        <span className="font-bold" style={{ color: '#007AFF' }}>
                          ₺{(Number(editAmount) * parseInt(editTaksitCount)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`border-t ${divider} mt-4`} />

        {/* Butonlar */}
        <div className="px-5 py-4 flex gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSaveEditExpense}
            className="flex-1 py-3.5 rounded-[14px] text-[15px] font-bold flex items-center justify-center gap-2 text-white"
            style={{
              backgroundColor: editIsTaksit && !wasAlreadyTaksit ? '#5856D6' : '#007AFF',
              boxShadow: editIsTaksit && !wasAlreadyTaksit ? '0 4px 16px rgba(88,86,214,0.35)' : '0 4px 16px rgba(0,122,255,0.35)',
            }}
          >
            <Check size={17} strokeWidth={2.5} />
            {editIsTaksit && !wasAlreadyTaksit ? `${editTaksitCount} Taksit Kaydet` : 'Kaydet'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCancelEditExpense}
            className={`py-3.5 px-4 rounded-[14px] text-[15px] font-semibold border ${
              isDark ? 'border-white/15 text-white/60' : 'border-black/12 text-black/50'
            }`}
          >
            Iptal
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleDeleteExpense(it.id)}
            className="py-3.5 px-4 rounded-[14px] border"
            style={{ borderColor: '#FF3B3040', backgroundColor: '#FF3B3010' }}
          >
            <Trash2 size={17} color="#FF3B30" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 20, stiffness: 200 }}
      className={`mx-4 mb-0.5 rounded-[16px] overflow-hidden ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}
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
            <p className={`text-[13px] italic truncate mt-0.5 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
              {it.note}
            </p>
          ) : null}
          {it.taksit_toplam ? (
            <span
              className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#5856D622', color: '#5856D6' }}
            >
              <CreditCard size={10} />
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
