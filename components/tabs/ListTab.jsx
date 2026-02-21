'use client';
import { motion } from 'framer-motion';
import {
  Plus,
  RotateCw,
  Calendar,
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';
import HeroCard from '../ui/HeroCard';
import ExpenseRow from '../ui/ExpenseRow';
import FilterPanel from '../ui/FilterPanel';

const FILTER_ALL = 'Tumuu';

function formatMoney(v) {
  return `₺${Number(v || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ListTab({
  groupedExpenses,
  weeklyData,
  pieData,
  monthlyTotal,
  budgetNum,
  budgetRemaining,
  budgetProgress,
  filteredTotal,
  avgDaily,
  topCategory,
  dailyBudgetLimit,
  remainingDays,
  lastMonthTotal,
  monthTrend,
  biggestExpense,
  members,
  memberMap,
  memberMonthlyTotals,
  memberOptions,
  effectiveCategories,
  group,
  hasActiveFilters,
  session,
  filterCategory,
  setFilterCategory,
  filterUser,
  setFilterUser,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  searchText,
  setSearchText,
  isFilterOpen,
  filterMounted,
  toggleFilter,
  clearAllFilters,
  presetDate,
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
  handleStartEditExpense,
  handleSaveEditExpense,
  handleCancelEditExpense,
  handleDeleteExpense,
  onAddExpense,
  isDark,
  upcomingInstallments,
}) {
  const sessionUserId = session?.user?.id;
  const containerBg = isDark ? 'bg-black' : 'bg-[#F5F5F7]';
  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const cardBorder = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const textColor = isDark ? 'text-white' : 'text-black';
  const dimColor = isDark ? 'text-white/40' : 'text-black/40';

  const containerClass = `mx-4 mb-3 rounded-[20px] border ${cardBg} ${cardBorder} p-4`;
  const buttonClass = 'flex items-center justify-center gap-2 rounded-[12px] py-3 font-semibold text-[15px]';

  const totalExpenses = Object.values(groupedExpenses || {}).flat().length;
  const expenseStaggerBase = (dayIndex) => dayIndex * 0.08;

  return (
    <div className={`${containerBg} h-full overflow-y-auto no-scrollbar pb-24`}>
      {/* iOS Large Title Header */}
      <div className="pt-16 px-4 pb-6">
        <h1 className={`text-[34px] font-bold tracking-tight ${textColor}`}>
          {group?.name || 'Harcamalar'}
        </h1>
      </div>

      {/* HeroCard */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 0.1 }}
        className="mb-3"
      >
        <HeroCard
          monthlyTotal={monthlyTotal}
          budgetNum={budgetNum}
          budgetRemaining={budgetRemaining}
          budgetProgress={budgetProgress}
          groupName={group?.name}
          isDark={isDark}
        />
      </motion.div>

      {/* Daily Budget Box */}
      {dailyBudgetLimit > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.15 }}
          className={containerClass}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[13px] font-semibold ${dimColor} uppercase tracking-wider`}>
                Gunluk Butce Limiti
              </p>
              <p className={`text-[24px] font-bold mt-1 text-[#34C759]`}>
                {formatMoney(dailyBudgetLimit)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[13px] ${dimColor}`}>{remainingDays} gun kaldi</p>
              <p className={`text-[15px] font-semibold ${textColor} mt-1`}>
                {formatMoney(Math.max(0, dailyBudgetLimit - (filteredTotal / Math.max(1, remainingDays))))}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Month Trend Box */}
      {lastMonthTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.2 }}
          className={containerClass}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[13px] font-semibold ${dimColor} uppercase tracking-wider`}>
                Onceki Aya Kiyasla
              </p>
              <p className={`text-[24px] font-bold mt-1 ${monthTrend >= 0 ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                {monthTrend >= 0 ? '+' : ''}{monthTrend.toFixed(1)}%
              </p>
            </div>
            <div>
              {monthTrend >= 0 ? (
                <TrendingUp size={32} className="text-[#FF3B30]" />
              ) : (
                <TrendingDown size={32} className="text-[#34C759]" />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Installments */}
      {upcomingInstallments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.22 }}
          className={containerClass}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[13px] font-semibold ${dimColor} uppercase tracking-wider`}>
                Gelecek Ay Taksit
              </p>
              <p className="text-[24px] font-bold mt-1" style={{ color: '#5856D6' }}>
                {formatMoney(upcomingInstallments)}
              </p>
              <p className={`text-[12px] mt-0.5 ${dimColor}`}>
                Sonraki ay odenecek taksitler
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#5856D6' + '22' }}
            >
              <span style={{ color: '#5856D6', fontSize: 22 }}>₺</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.25 }}
        className="mx-4 mb-3 grid grid-cols-2 gap-2"
      >
        {/* Harcama Ekle */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAddExpense}
          className={`${buttonClass} bg-[#007AFF] text-white`}
        >
          <Plus size={18} />
          <span>Ekle</span>
        </motion.button>

        {/* Yenile */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className={`${buttonClass} bg-[#5856D6] text-white`}
        >
          <RotateCw size={18} />
          <span>Yenile</span>
        </motion.button>

        {/* Bugun */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            presetDate('today');
            if (!isFilterOpen) toggleFilter();
          }}
          className={`${buttonClass} bg-[#34C759] text-white`}
        >
          <Calendar size={18} />
          <span>Bugun</span>
        </motion.button>

        {/* Temizle */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
          className={`${buttonClass} ${
            hasActiveFilters
              ? 'bg-[#FF9500] text-white'
              : isDark
                ? 'bg-[#2C2C2E] text-white/30'
                : 'bg-[#F2F2F7] text-black/30'
          }`}
        >
          <Filter size={18} />
          <span>Temizle</span>
        </motion.button>
      </motion.div>

      {/* Member Spending Distribution */}
      {members && members.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.3 }}
          className={containerClass}
        >
          <p className={`text-[15px] font-semibold ${textColor} mb-3`}>Kisi Harcamalari</p>
          <div className="flex flex-col gap-2.5">
            {members.map((member) => {
              const total = memberMonthlyTotals?.[member.id] || 0;
              const pct = monthlyTotal > 0 ? (total / monthlyTotal) * 100 : 0;
              return (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[13px] font-medium ${textColor}`}
                    >
                      {member.label}
                    </span>
                    <span className={`text-[13px] font-semibold ${textColor}`}>
                      {formatMoney(total)}
                    </span>
                  </div>
                  <div
                    className={`h-[4px] rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} overflow-hidden`}
                  >
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 120,
                      }}
                      className="h-full rounded-full bg-[#007AFF]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filter Toggle Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.35 }}
        className={containerClass}
      >
        <button
          onClick={toggleFilter}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className={textColor} />
            <span className={`text-[16px] font-medium ${textColor}`}>Filtrele & Ara</span>
          </div>
          <motion.div
            animate={{ rotate: isFilterOpen ? 180 : 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          >
            <ChevronDown size={18} className={dimColor} />
          </motion.div>
        </button>
      </motion.div>

      {/* FilterPanel Component */}
      <div className="mx-4">
        <FilterPanel
          isDark={isDark}
          FILTER_ALL={FILTER_ALL}
          effectiveCategories={effectiveCategories}
          memberOptions={memberOptions}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterUser={filterUser}
          setFilterUser={setFilterUser}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          searchText={searchText}
          setSearchText={setSearchText}
          presetDate={presetDate}
          isOpen={isFilterOpen}
          isMounted={filterMounted}
        />
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.4 }}
        className="mx-4 mb-3 grid grid-cols-3 gap-2"
      >
        {/* Filtre Toplam */}
        <div
          className={`rounded-[16px] border ${cardBg} ${cardBorder} p-3 text-center`}
        >
          <p className={`text-[11px] font-semibold uppercase ${dimColor} tracking-wider mb-1`}>
            Filtre
          </p>
          <p className={`text-[17px] font-bold ${textColor}`}>
            {formatMoney(filteredTotal)}
          </p>
        </div>

        {/* Gunluk Ort */}
        <div
          className={`rounded-[16px] border ${cardBg} ${cardBorder} p-3 text-center`}
        >
          <p className={`text-[11px] font-semibold uppercase ${dimColor} tracking-wider mb-1`}>
            Gunluk
          </p>
          <p className={`text-[17px] font-bold ${textColor}`}>
            {formatMoney(avgDaily)}
          </p>
        </div>

        {/* En Cok */}
        <div
          className={`rounded-[16px] border ${cardBg} ${cardBorder} p-3 text-center`}
        >
          <p className={`text-[11px] font-semibold uppercase ${dimColor} tracking-wider mb-1`}>
            Kategori
          </p>
          <p className={`text-[15px] font-bold ${textColor} truncate`}>
            {topCategory || '-'}
          </p>
        </div>
      </motion.div>

      {/* Biggest Expense Card */}
      {biggestExpense && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.45 }}
          className={containerClass}
        >
          <p className={`text-[13px] font-semibold ${dimColor} uppercase tracking-wider mb-2`}>
            En Buyuk Harcama
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[16px] font-semibold ${textColor}`}>
                {biggestExpense.category}
              </p>
              <p className={`text-[13px] ${dimColor} mt-0.5`}>
                {biggestExpense.note || memberMap?.get(biggestExpense.user_id) || 'Kullanici'}
              </p>
            </div>
            <p className={`text-[22px] font-bold text-[#FF3B30]`}>
              {formatMoney(biggestExpense.amount)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Weekly Chart Placeholder */}
      {weeklyData && weeklyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.5 }}
          className={containerClass}
        >
          <p className={`text-[15px] font-semibold ${textColor} mb-3`}>Haftalik Ozet</p>
          <div className={`h-[200px] rounded-[12px] ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#F5F5F7]'} flex items-center justify-center`}>
            <p className={dimColor}>Grafik yeri (WeeklyChart component)</p>
          </div>
        </motion.div>
      )}

      {/* Pie Chart Placeholder */}
      {pieData && pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.55 }}
          className={containerClass}
        >
          <p className={`text-[15px] font-semibold ${textColor} mb-3`}>Kategori Dagilimi</p>
          <div className={`h-[250px] rounded-[12px] ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#F5F5F7]'} flex items-center justify-center`}>
            <p className={dimColor}>Grafik yeri (PieChart component)</p>
          </div>
        </motion.div>
      )}

      {/* Expense List by Day */}
      {totalExpenses === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.6 }}
          className={containerClass}
        >
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Receipt size={48} className={dimColor} />
            <p className={`text-[16px] font-medium ${textColor}`}>Harcama yok</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onAddExpense}
              className="mt-2 px-4 py-2 rounded-[10px] bg-[#007AFF] text-white text-[14px] font-semibold"
            >
              Harcama Ekle
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05, delayChildren: 0.6 }}
        >
          {Object.entries(groupedExpenses || {})
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([date, expenses], dayIndex) => {
              const dayDate = new Date(date);
              const dayLabel = dayDate.toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });
              const dayTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

              return (
                <motion.div key={date} className="mb-3">
                  {/* Day Header */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: expenseStaggerBase(dayIndex),
                      type: 'spring',
                      damping: 20,
                      stiffness: 200,
                    }}
                    className="mx-4 mb-2 flex items-center justify-between"
                  >
                    <p
                      className={`text-[13px] font-semibold uppercase tracking-wider ${dimColor}`}
                    >
                      {dayLabel}
                    </p>
                    <p className={`text-[15px] font-semibold ${textColor}`}>
                      {formatMoney(dayTotal)}
                    </p>
                  </motion.div>

                  {/* Expenses for day */}
                  {expenses.map((expense, expenseIndex) => (
                    <ExpenseRow
                      key={expense.id}
                      it={expense}
                      isDark={isDark}
                      sessionUserId={sessionUserId}
                      memberMap={memberMap}
                      editExpenseId={editExpenseId}
                      editAmount={editAmount}
                      setEditAmount={setEditAmount}
                      editDate={editDate}
                      setEditDate={setEditDate}
                      editCategory={editCategory}
                      setEditCategory={setEditCategory}
                      editNote={editNote}
                      setEditNote={setEditNote}
                      editTaksitNo={editTaksitNo}
                      editTaksitToplam={editTaksitToplam}
                      editIsTaksit={editIsTaksit}
                      setEditIsTaksit={setEditIsTaksit}
                      editTaksitCount={editTaksitCount}
                      setEditTaksitCount={setEditTaksitCount}
                      effectiveCategories={effectiveCategories}
                      handleStartEditExpense={handleStartEditExpense}
                      handleSaveEditExpense={handleSaveEditExpense}
                      handleCancelEditExpense={handleCancelEditExpense}
                      handleDeleteExpense={handleDeleteExpense}
                      staggerIndex={expenseStaggerBase(dayIndex) + expenseIndex * 0.04}
                    />
                  ))}
                </motion.div>
              );
            })}
        </motion.div>
      )}
    </div>
  );
}
