'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES, FILTER_ALL } from '../lib/constants';
import { categoryKey, getLast7Days, getRedirectUrl, mergeCategories, normalizeCategory, relativeDay, todayStr } from '../lib/helpers';
import AuthScreen from '../components/AuthScreen';
import GroupSetup from '../components/GroupSetup';
import TabBar from '../components/TabBar';
import ListTab from '../components/tabs/ListTab';
import AddTab from '../components/tabs/AddTab';
import SettingsTab from '../components/tabs/SettingsTab';
import Toast from '../components/Toast';

function formatMoney(v) {
  return '\u20BA' + Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');
  const [toastVisible, setToastVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [group, setGroup] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [settingsSection, setSettingsSection] = useState('root');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterMounted, setFilterMounted] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayStr());
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [isTaksit, setIsTaksit] = useState(false);
  const [taksitCount, setTaksitCount] = useState('3');
  const [editExpenseId, setEditExpenseId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState(todayStr());
  const [editCategory, setEditCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [editNote, setEditNote] = useState('');
  const [editTaksitNo, setEditTaksitNo] = useState(null);
  const [editTaksitToplam, setEditTaksitToplam] = useState(null);
  const [editIsTaksit, setEditIsTaksit] = useState(false);
  const [editTaksitCount, setEditTaksitCount] = useState('3');
  const [filterCategory, setFilterCategory] = useState(FILTER_ALL);
  const [filterUser, setFilterUser] = useState(FILTER_ALL);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [groupNameEdit, setGroupNameEdit] = useState('');
  const [editName, setEditName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [budgetTarget, setBudgetTarget] = useState('10000');

  const toastTimer = useRef(null);
  const prevUserIdRef = useRef(null);
  const realtimeRef = useRef(null);
  const budgetWarnedRef = useRef(false);
  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const showToast = useCallback((msg, type = 'info') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg); setToastType(type); setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  }, []);

  useEffect(() => { try { const s = localStorage.getItem('theme_mode'); if (s === 'light' || s === 'dark') setThemeMode(s); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('theme_mode', themeMode); } catch {} }, [themeMode]);
  useEffect(() => { try { const s = localStorage.getItem('active_tab'); if (s === 'list' || s === 'add' || s === 'settings') setActiveTab(s); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('active_tab', activeTab); } catch {} }, [activeTab]);

  useEffect(() => {
    if (!hasSupabaseConfig) { setBootLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const s = data.session ?? null;
      setSession(s);
      if (s?.user) await ensureProfile(s.user);
      setBootLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange(async (_e, next) => {
      setSession(next ?? null);
      if (next?.user) await ensureProfile(next.user);
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user) { prevUserIdRef.current = null; setGroup(null); setMembers([]); setExpenses([]); setCategories(DEFAULT_CATEGORIES); return; }
    if (session.user.id === prevUserIdRef.current) return;
    prevUserIdRef.current = session.user.id;
    loadGroupAndData(session.user.id);
  }, [session]);

  useEffect(() => {
    if (!group?.id || !hasSupabaseConfig) return;
    const gid = group.id;
    const channel = supabase.channel('group_' + gid)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: 'group_id=eq.' + gid }, () => { loadMembers(gid).catch(() => {}); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: 'group_id=eq.' + gid }, () => { loadExpenses(gid).catch(() => {}); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'groups', filter: 'id=eq.' + gid }, (payload) => {
        if (payload.new?.budget_target !== undefined) {
          setBudgetTarget(String(payload.new.budget_target));
          setGroup((p) => ({ ...p, budget_target: payload.new.budget_target, name: payload.new.name || p.name }));
        }
      }).subscribe();
    realtimeRef.current = channel;
    return () => { supabase.removeChannel(channel); realtimeRef.current = null; };
  }, [group?.id]);

  useEffect(() => { if (activeTab !== 'list' && editExpenseId) handleCancelEditExpense(); }, [activeTab]);

  const memberMap = useMemo(() => {
    const m = new Map();
    members.forEach((x) => m.set(x.user_id, x.username || (x.email ? x.email.split('@')[0] : x.user_id.slice(0, 6))));
    return m;
  }, [members]);

  const memberOptions = useMemo(() => members.map((x) => ({ id: x.user_id, label: x.username || x.email || x.user_id.slice(0, 6) })), [members]);
  const effectiveCategories = useMemo(() => mergeCategories(categories, expenses), [categories, expenses]);

  const filteredExpenses = useMemo(() => expenses.filter((item) => {
    const day = item.spent_at.slice(0, 10);
    const name = memberMap.get(item.user_id) || '';
    const srch = (item.category + ' ' + (item.note || '') + ' ' + name).toLowerCase();
    return (filterCategory === FILTER_ALL || item.category === filterCategory)
      && (filterUser === FILTER_ALL || item.user_id === filterUser)
      && (!filterStartDate || day >= filterStartDate)
      && (!filterEndDate || day <= filterEndDate)
      && (!searchText.trim() || srch.includes(searchText.trim().toLowerCase()));
  }), [expenses, filterCategory, filterUser, filterStartDate, filterEndDate, searchText, memberMap]);

  const weeklyData = useMemo(() => getLast7Days().map((d) => ({ ...d, total: filteredExpenses.filter((x) => x.spent_at.slice(0, 10) === d.key).reduce((s, x) => s + Number(x.amount), 0) })), [filteredExpenses]);

  const pieData = useMemo(() => {
    const m = new Map();
    filteredExpenses.forEach((x) => m.set(x.category, (m.get(x.category) || 0) + Number(x.amount)));
    return Array.from(m.entries()).map(([c, a]) => ({ category: c, amount: a })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const monthlyTotal = useMemo(() => {
    const n = new Date();
    return expenses.filter((x) => { const d = new Date(x.spent_at); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, x) => s + Number(x.amount), 0);
  }, [expenses]);

  const lastMonthTotal = useMemo(() => {
    const n = new Date(); const lm = new Date(n.getFullYear(), n.getMonth() - 1, 1);
    return expenses.filter((x) => { const d = new Date(x.spent_at); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); }).reduce((s, x) => s + Number(x.amount), 0);
  }, [expenses]);

  const memberMonthlyTotals = useMemo(() => {
    const n = new Date(); const map = new Map();
    expenses.filter((x) => { const d = new Date(x.spent_at); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); })
      .forEach((x) => map.set(x.user_id, (map.get(x.user_id) || 0) + Number(x.amount)));
    return map;
  }, [expenses, members]);

  const biggestExpense = useMemo(() => {
    const n = new Date();
    const me = expenses.filter((x) => { const d = new Date(x.spent_at); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); });
    return me.length ? me.reduce((m, x) => Number(x.amount) > Number(m.amount) ? x : m, me[0]) : null;
  }, [expenses]);

  const upcomingInstallments = useMemo(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    const nm = next.getMonth();
    const ny = next.getFullYear();
    return expenses
      .filter((x) => {
        const d = new Date(x.spent_at);
        return d.getMonth() === nm && d.getFullYear() === ny && x.taksit_toplam;
      })
      .reduce((s, x) => s + Number(x.amount), 0);
  }, [expenses]);

  const groupedExpenses = useMemo(() => {
    const groups = new Map();
    filteredExpenses.forEach((it) => { const day = relativeDay(it.spent_at); if (!groups.has(day)) groups.set(day, []); groups.get(day).push(it); });
    return Array.from(groups.entries());
  }, [filteredExpenses]);

  const filteredTotal = filteredExpenses.reduce((s, x) => s + Number(x.amount), 0);
  const avgDaily = filteredExpenses.length ? filteredTotal / (new Set(filteredExpenses.map((x) => x.spent_at.slice(0, 10))).size || 1) : 0;
  const topCategory = pieData[0]?.category || '-';
  const budgetNum = Number(budgetTarget.replace(',', '.')) || 0;
  const budgetRemaining = budgetNum > 0 ? budgetNum - monthlyTotal : 0;
  const budgetProgress = budgetNum > 0 ? Math.min(1, monthlyTotal / budgetNum) : 0;
  const canAddExpense = Number(String(amount).replace(',', '.')) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(expenseDate);
  const today2 = new Date();
  const lastDayOfMonth = new Date(today2.getFullYear(), today2.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, lastDayOfMonth - today2.getDate() + 1);
  const dailyBudgetLimit = budgetNum > 0 && budgetRemaining > 0 ? budgetRemaining / remainingDays : 0;
  const monthTrend = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const hasActiveFilters = filterCategory !== FILTER_ALL || filterUser !== FILTER_ALL || Boolean(filterStartDate) || Boolean(filterEndDate) || Boolean(searchText.trim());

  useEffect(() => {
    if (budgetNum > 0 && budgetProgress >= 0.8 && !budgetWarnedRef.current) {
      budgetWarnedRef.current = true;
      showToast(budgetProgress >= 1 ? 'Aylik butceyi astin!' : "Butcenin %80'ini harcadin!", 'error');
    }
    if (budgetProgress < 0.8) budgetWarnedRef.current = false;
  }, [budgetProgress, budgetNum]);

  useEffect(() => {
    if (!effectiveCategories.length) return;
    if (!effectiveCategories.includes(category)) setCategory(effectiveCategories[0]);
    if (!effectiveCategories.includes(editCategory)) setEditCategory(effectiveCategories[0]);
    if (filterCategory !== FILTER_ALL && !effectiveCategories.includes(filterCategory)) setFilterCategory(FILTER_ALL);
  }, [effectiveCategories]);

  async function runBusy(label, fn) {
    setBusy(label);
    try { await fn(); } catch (err) { showToast(err?.message || 'Bir hata olustu.', 'error'); } finally { setBusy(''); }
  }
  async function ensureProfile(user) {
    const fallback = user?.user_metadata?.username || (user.email ? user.email.split('@')[0] : 'Kullanici');
    await supabase.from('profiles').upsert({ user_id: user.id, email: user.email || (user.id + '@placeholder.local'), username: fallback }, { onConflict: 'user_id' });
  }
  async function loadGroupAndData(userId) {
    await runBusy('Yukleniyor...', async () => {
      const { data: row, error } = await supabase.from('group_members').select('group_id, groups(id,code,name,created_by,budget_target)').eq('user_id', userId).limit(1).maybeSingle();
      if (error) throw error;
      if (!row?.groups) return;
      setGroup(row.groups); setGroupNameEdit(row.groups.name || '');
      if (row.groups.budget_target) setBudgetTarget(String(row.groups.budget_target));
      await Promise.all([loadMembers(row.groups.id), loadExpenses(row.groups.id), loadCategories(row.groups.id)]);
    });
  }
  async function loadMembers(groupId) {
    const { data: gm, error: e1 } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
    if (e1) throw e1;
    const ids = (gm ?? []).map((x) => x.user_id);
    if (!ids.length) return setMembers([]);
    const { data: prof, error: e2 } = await supabase.from('profiles').select('user_id,email,username').in('user_id', ids);
    if (e2) throw e2;
    const map = new Map((prof ?? []).map((x) => [x.user_id, x]));
    const rows = ids.map((id) => ({ user_id: id, email: map.get(id)?.email || '', username: map.get(id)?.username || '' }));
    setMembers(rows);
    const me = rows.find((x) => x.user_id === session?.user?.id);
    if (me?.username) setEditName(me.username);
  }
  async function loadCategories(groupId) {
    const { data, error } = await supabase.from('group_categories').select('name').eq('group_id', groupId).order('name');
    if (error) throw error;
    setCategories((data ?? []).map((x) => normalizeCategory(x.name)).filter(Boolean));
  }
  async function loadExpenses(groupId) {
    const { data, error } = await supabase.from('expenses').select('id,amount,category,note,spent_at,user_id,taksit_toplam,taksit_no,taksit_grup_id').eq('group_id', groupId).order('spent_at', { ascending: false });
    if (error) throw error;
    setExpenses(data ?? []);
  }
  async function handleLogin() { await runBusy('Giris yapiliyor...', async () => { const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error; }); }
  async function handleGoogleLogin() { await runBusy('Yonlendiriliyor...', async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: getRedirectUrl() } }); if (error) throw error; }); }
  async function handleRegister() {
    if (!usernameInput.trim()) return showToast('Kullanici adi gerekli.', 'error');
    await runBusy('Hesap olusturuluyor...', async () => {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { username: usernameInput.trim() }, emailRedirectTo: getRedirectUrl() } });
      if (error) throw error;
      showToast('Kayit tamam! E-postani onaylayip giris yap.', 'success');
      setAuthMode('login');
    });
  }
  async function handleForgotPassword() { await runBusy('Mail gonderiliyor...', async () => { const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: getRedirectUrl() }); if (error) throw error; showToast('Sifre sifirlama maili gonderildi.', 'success'); }); }
  async function handleCreateGroup() {
    await runBusy('Butce olusturuluyor...', async () => {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data: g, error: e1 } = await supabase.from('groups').insert({ name: 'Ortak Butce', code, created_by: session.user.id }).select('id,code,name,created_by').single();
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('group_members').insert({ group_id: g.id, user_id: session.user.id });
      if (e2) throw e2;
      setGroup(g); setGroupNameEdit(g.name || '');
      await Promise.all([loadMembers(g.id), loadExpenses(g.id), loadCategories(g.id)]);
    });
  }
  async function handleJoinGroup() {
    if (!joinCode.trim()) return;
    await runBusy('Katiliniyor...', async () => {
      const { data: g, error: e1 } = await supabase.from('groups').select('id,code,name,created_by').eq('code', joinCode.trim().toUpperCase()).single();
      if (e1) throw new Error('Kod bulunamadi.');
      const { error: e2 } = await supabase.from('group_members').insert({ group_id: g.id, user_id: session.user.id });
      if (e2 && e2.code !== '23505') throw e2;
      setGroup(g); setGroupNameEdit(g.name || '');
      await Promise.all([loadMembers(g.id), loadExpenses(g.id), loadCategories(g.id)]);
    });
  }
  async function handleAddExpense() {
    const n = Number(amount.replace(',', '.'));
    if (!n || n <= 0) return showToast('Gecerli bir tutar gir.', 'error');
    await runBusy('Kaydediliyor...', async () => {
      const dt = new Date(expenseDate + 'T12:00:00');
      if (Number.isNaN(dt.getTime())) throw new Error('Gecerli tarih gir.');
      if (isTaksit) {
        const count = Math.max(1, Math.min(60, parseInt(taksitCount, 10) || 1));
        const grupId = crypto.randomUUID();
        const records = Array.from({ length: count }, (_, i) => {
          const d = new Date(dt);
          d.setMonth(d.getMonth() + i);
          return { group_id: group.id, user_id: session.user.id, amount: n, category, note: note.trim(), spent_at: d.toISOString(), taksit_toplam: count, taksit_no: i + 1, taksit_grup_id: grupId };
        });
        const { error } = await supabase.from('expenses').insert(records);
        if (error) throw error;
        setAmount(''); setNote(''); setExpenseDate(todayStr()); setIsTaksit(false); setTaksitCount('3'); setActiveTab('list');
        loadExpenses(group.id).catch(() => {});
        showToast(count + ' taksit eklendi!', 'success');
      } else {
        const { error } = await supabase.from('expenses').insert({ group_id: group.id, user_id: session.user.id, amount: n, category, note: note.trim(), spent_at: dt.toISOString() });
        if (error) throw error;
        setAmount(''); setNote(''); setExpenseDate(todayStr()); setActiveTab('list');
        loadExpenses(group.id).catch(() => {});
        showToast('Harcama eklendi!', 'success');
      }
    });
  }
  function handleStartEditExpense(expense) { setEditExpenseId(expense.id); setEditAmount(String(expense.amount)); setEditDate(expense.spent_at.slice(0, 10)); setEditCategory(expense.category); setEditNote(expense.note || ''); setEditTaksitNo(expense.taksit_no ?? null); setEditTaksitToplam(expense.taksit_toplam ?? null); setEditIsTaksit(!!expense.taksit_toplam); setEditTaksitCount(String(expense.taksit_toplam || 3)); }
  function handleCancelEditExpense() { setEditExpenseId(''); setEditAmount(''); setEditDate(todayStr()); setEditCategory(effectiveCategories[0] || DEFAULT_CATEGORIES[0]); setEditNote(''); setEditTaksitNo(null); setEditTaksitToplam(null); setEditIsTaksit(false); setEditTaksitCount('3'); }
  async function handleSaveEditExpense() {
    if (!editExpenseId) return;
    const n = Number(String(editAmount).replace(',', '.'));
    if (!n || n <= 0) return showToast('Gecerli tutar gir.', 'error');
    await runBusy('Guncelleniyor...', async () => {
      const dt = new Date(editDate + 'T12:00:00');
      if (Number.isNaN(dt.getTime())) throw new Error('Gecerli tarih gir.');
      if (editIsTaksit && !editTaksitToplam) {
        const count = Math.max(2, Math.min(60, parseInt(editTaksitCount, 10) || 2));
        const grupId = crypto.randomUUID();
        const records = Array.from({ length: count }, (_, i) => {
          const d = new Date(dt); d.setMonth(d.getMonth() + i);
          return { group_id: group.id, user_id: session.user.id, amount: n, category: editCategory, note: editNote.trim(), spent_at: d.toISOString(), taksit_toplam: count, taksit_no: i + 1, taksit_grup_id: grupId };
        });
        const { error: delErr } = await supabase.from('expenses').delete().eq('id', editExpenseId).eq('group_id', group.id);
        if (delErr) throw delErr;
        const { error } = await supabase.from('expenses').insert(records);
        if (error) throw error;
        handleCancelEditExpense(); await loadExpenses(group.id); showToast(count + ' taksit olusturuldu!', 'success');
      } else {
        const { error } = await supabase.from('expenses').update({ amount: n, category: editCategory, note: editNote.trim(), spent_at: dt.toISOString() }).eq('id', editExpenseId).eq('group_id', group.id);
        if (error) throw error;
        handleCancelEditExpense(); await loadExpenses(group.id); showToast('Guncellendi.', 'success');
      }
    });
  }
  async function handleDeleteExpense(id) {
    if (!id) return;
    await runBusy('Siliniyor...', async () => {
      const { error } = await supabase.from('expenses').delete().eq('id', id).eq('group_id', group.id);
      if (error) throw error;
      if (editExpenseId === id) handleCancelEditExpense();
      await loadExpenses(group.id); showToast('Harcama silindi.', 'info');
    });
  }
  async function handleSaveUsername() { if (!editName.trim()) return; await runBusy('Guncelleniyor...', async () => { const { error } = await supabase.from('profiles').update({ username: editName.trim(), updated_at: new Date().toISOString() }).eq('user_id', session.user.id); if (error) throw error; await loadMembers(group.id); showToast('Kullanici adi guncellendi.', 'success'); }); }
  async function handleUpdateGroupName() { if (!groupNameEdit.trim()) return; await runBusy('Guncelleniyor...', async () => { const { error } = await supabase.from('groups').update({ name: groupNameEdit.trim() }).eq('id', group.id); if (error) throw error; setGroup((p) => ({ ...p, name: groupNameEdit.trim() })); showToast('Butce adi guncellendi.', 'success'); }); }
  async function handleSaveBudget() {
    const n = Number(String(budgetTarget).replace(',', '.'));
    if (!n || n <= 0) return showToast('Gecerli butce tutari gir.', 'error');
    await runBusy('Kaydediliyor...', async () => { const { error } = await supabase.from('groups').update({ budget_target: n }).eq('id', group.id); if (error) throw error; setGroup((p) => ({ ...p, budget_target: n })); showToast('Butce hedefi guncellendi.', 'success'); });
  }
  async function handleAddCategory() {
    const name = normalizeCategory(newCategory);
    if (!name) return;
    if (effectiveCategories.some((c) => categoryKey(c) === categoryKey(name))) return showToast('Bu kategori zaten mevcut.', 'error');
    await runBusy('Ekleniyor...', async () => { const { error } = await supabase.from('group_categories').insert({ group_id: group.id, name, created_by: session.user.id }); if (error) throw error; setNewCategory(''); await loadCategories(group.id); showToast('Kategori eklendi.', 'success'); });
  }
  async function handleDeleteCategory(name) { await runBusy('Siliniyor...', async () => { const { error } = await supabase.from('group_categories').delete().eq('group_id', group.id).eq('name', name); if (error) throw error; await loadCategories(group.id); }); }
  async function handleRemoveMember(userId) { await runBusy('Guncelleniyor...', async () => { const { error } = await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', userId); if (error) throw error; if (userId === session.user.id) { setGroup(null); setMembers([]); setExpenses([]); return; } await loadMembers(group.id); }); }
  async function handleCopyCode() { if (!group?.code) return; if (navigator.clipboard) { await navigator.clipboard.writeText(group.code); showToast('Butce kodu kopyalandi.', 'success'); } }
  function handleShareWhatsApp() { if (!group?.code) return; window.open('https://wa.me/?text=' + encodeURIComponent('Aile Harcama uygulamasina katil! Butce kodu: ' + group.code), '_blank'); }
  async function handleLogout() { await supabase.auth.signOut(); }
  function toggleFilter() { if (!isFilterOpen) { setFilterMounted(true); setIsFilterOpen(true); } else { setIsFilterOpen(false); setTimeout(() => setFilterMounted(false), 300); } }
  function clearAllFilters() { setFilterCategory(FILTER_ALL); setFilterUser(FILTER_ALL); setFilterStartDate(''); setFilterEndDate(''); setSearchText(''); }
  function presetDate(type) {
    const t = todayStr();
    if (type === 'today') { setFilterStartDate(t); setFilterEndDate(t); return; }
    if (type === 'week') { const s = new Date(); s.setDate(s.getDate() - 6); setFilterStartDate(s.toISOString().slice(0, 10)); setFilterEndDate(t); return; }
    if (type === 'month') { const s = new Date(); s.setDate(1); setFilterStartDate(s.toISOString().slice(0, 10)); setFilterEndDate(t); return; }
    setFilterStartDate(''); setFilterEndDate('');
  }

  if (!hasSupabaseConfig) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6">
      <div className="bg-white rounded-[20px] p-6 max-w-sm w-full shadow-sm border border-black/[0.06]">
        <p className="text-black font-semibold text-lg">Kurulum Gerekli</p>
        <p className="text-black/50 mt-2 text-sm">.env.local dosyasina Supabase bilgilerini ekle.</p>
      </div>
    </div>
  );
  if (bootLoading) return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      <p className="text-black/40 text-sm">Yukleniyor...</p>
    </div>
  );
  if (!session) return <AuthScreen authMode={authMode} setAuthMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} usernameInput={usernameInput} setUsernameInput={setUsernameInput} busy={!!busy} handleLogin={handleLogin} handleRegister={handleRegister} handleForgotPassword={handleForgotPassword} handleGoogleLogin={handleGoogleLogin} isDark={isDark} toastMsg={toastMsg} toastType={toastType} toastVisible={toastVisible} />;
  if (!group) return <GroupSetup joinCode={joinCode} setJoinCode={setJoinCode} handleCreateGroup={handleCreateGroup} handleJoinGroup={handleJoinGroup} handleLogout={handleLogout} busy={!!busy} isDark={isDark} toastMsg={toastMsg} toastType={toastType} toastVisible={toastVisible} />;

  const listProps = { groupedExpenses, weeklyData, pieData, monthlyTotal, budgetNum, budgetRemaining, budgetProgress, filteredTotal, avgDaily, topCategory, dailyBudgetLimit, remainingDays, lastMonthTotal, monthTrend, biggestExpense, members, memberMap, memberMonthlyTotals, memberOptions, effectiveCategories, group, hasActiveFilters, session, filterCategory, setFilterCategory, filterUser, setFilterUser, filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate, searchText, setSearchText, isFilterOpen, filterMounted, toggleFilter, clearAllFilters, presetDate, editExpenseId, editAmount, setEditAmount, editDate, setEditDate, editCategory, setEditCategory, editNote, setEditNote, editTaksitNo, editTaksitToplam, editIsTaksit, setEditIsTaksit, editTaksitCount, setEditTaksitCount, handleStartEditExpense, handleSaveEditExpense, handleCancelEditExpense, handleDeleteExpense, onAddExpense: () => setActiveTab('add'), isDark, FILTER_ALL, formatMoney, upcomingInstallments };
  const addProps = { amount, setAmount, expenseDate, setExpenseDate, note, setNote, category, setCategory, effectiveCategories, canAddExpense, handleAddExpense, isDark, isTaksit, setIsTaksit, taksitCount, setTaksitCount };
  const settingsProps = { session, group, members, memberMap, memberOptions, effectiveCategories, categories, settingsSection, setSettingsSection, groupNameEdit, setGroupNameEdit, budgetTarget, setBudgetTarget, editName, setEditName, newCategory, setNewCategory, themeMode, setThemeMode, isDark, handleSaveUsername, handleUpdateGroupName, handleSaveBudget, handleAddCategory, handleDeleteCategory, handleRemoveMember, handleCopyCode, handleShareWhatsApp, handleLogout, monthlyTotal, budgetRemaining, budgetProgress, formatMoney };

  return (
    <div className={'flex justify-center min-h-screen ' + (isDark ? 'bg-black' : 'bg-[#F2F2F7]')}>
      <div className={'relative w-full max-w-[430px] h-[100dvh] overflow-hidden ' + (isDark ? 'bg-black' : 'bg-[#F2F2F7]')}>
        <div className="absolute inset-0 overflow-hidden">
          {activeTab === 'list' && <ListTab {...listProps} />}
          {activeTab === 'add' && <AddTab {...addProps} />}
          {activeTab === 'settings' && <SettingsTab {...settingsProps} />}
        </div>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} />
        <Toast message={toastMsg} type={toastType} visible={toastVisible} />
        {busy && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className={'backdrop-blur-xl rounded-[24px] p-7 flex flex-col items-center gap-4 min-w-[150px] shadow-2xl border ' + (isDark ? 'bg-[#1C1C1E]/90 border-white/[0.06]' : 'bg-white/90 border-black/[0.06]')}>
              <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
              <p className={'text-sm font-medium ' + (isDark ? 'text-white' : 'text-black')}>{busy}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
