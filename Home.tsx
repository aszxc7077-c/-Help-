import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  Banknote,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  Clock3,
  Crosshair,
  CreditCard,
  Bell,
  Globe2,
  HardHat,
  Headphones,
  Languages,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Package,
  Percent,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Service = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Truck;
  tone: string;
  detail: string;
};

type Provider = {
  name: string;
  serviceId: string;
  type: string;
  distance: string;
  distanceKm: number;
  eta: string;
  etaMinutes: number;
  rating: string;
  priceValue: number;
  price: string;
  icon: typeof Truck;
  available: boolean;
};

const services: Service[] = [
  { id: "tow", title: "سطحة وإنقاذ", subtitle: "سيارات ومركبات", icon: Truck, tone: "lime", detail: "سطحات عادية، هيدروليك، وإنقاذ على الطريق" },
  { id: "mobile", title: "ورشة متنقلة", subtitle: "إصلاح في موقعك", icon: Wrench, tone: "sky", detail: "بطارية، بنشر، اشتراك، وفحص سريع" },
  { id: "heavy", title: "معدات ثقيلة", subtitle: "نقل ورفع", icon: Package, tone: "amber", detail: "سطحات ومعدات لنقل الشاحنات والآليات" },
  { id: "fuel", title: "وقود وبطارية", subtitle: "مساعدة فورية", icon: Zap, tone: "violet", detail: "توصيل وقود أو تشغيل بطارية في أقرب وقت" },
  { id: "projects", title: "مشاريع ومقاولات", subtitle: "صيانة ومعدات", icon: HardHat, tone: "slate", detail: "دعم المواقع، صيانة الآليات، ونقل المعدات" },
];

const providers: Provider[] = [
  { name: "شركة درب الإنقاذ", serviceId: "tow", type: "سطحة هيدروليك", distance: "1.8 كم", distanceKm: 1.8, eta: "8 دقائق", etaMinutes: 8, rating: "4.9", priceValue: 120, price: "يبدأ من ١٢٠ ر.س", icon: Truck, available: true },
  { name: "ورشة السريع المتنقلة", serviceId: "mobile", type: "فني سيارات متنقل", distance: "2.4 كم", distanceKm: 2.4, eta: "11 دقيقة", etaMinutes: 11, rating: "4.8", priceValue: 80, price: "يبدأ من ٨٠ ر.س", icon: Wrench, available: true },
  { name: "مساندة للآليات", serviceId: "heavy", type: "إنقاذ مركبات تجارية", distance: "4.7 كم", distanceKm: 4.7, eta: "16 دقيقة", etaMinutes: 16, rating: "4.7", priceValue: 250, price: "يبدأ من ٢٥٠ ر.س", icon: Package, available: false },
  { name: "حلول مواقع البناء", serviceId: "projects", type: "صيانة ومعدات مشاريع", distance: "6.2 كم", distanceKm: 6.2, eta: "22 دقيقة", etaMinutes: 22, rating: "4.9", priceValue: 350, price: "يبدأ من ٣٥٠ ر.س", icon: HardHat, available: true },
];

const faqs = [
  ["كيف أطلب المساعدة؟", "حدد نوع الخدمة، شارك موقعك، ثم راجع مقدمي الخدمة الأقرب قبل إرسال الطلب."],
  ["هل الدفع آمن داخل نجدة؟", "نعم. يُحجز المبلغ داخل المنصة ولا يُحوّل لمقدم الخدمة إلا بعد تأكيد إتمام المهمة."],
  ["هل يمكنني التسجيل كمقدم خدمة؟", "نعم، ستتمكن من رفع خبرتك وتراخيصك وتحديد نطاق الخدمة والأسعار بعد إطلاق حسابات مقدمي الخدمة."],
];

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => openAuthModal("login")} (imported from "@/const"). Never call
  // openAuthModal("login") during render (no href={openAuthModal("login")}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const trpcUtils = trpc.useUtils();
  const createServiceRequest = trpc.serviceRequests.create.useMutation();
  const rateServiceMutation = trpc.ratings.create.useMutation();
  const createProviderMutation = trpc.providers.create.useMutation();
  const registerMutation = trpc.auth.register.useMutation({ onSuccess: (newUser) => { trpcUtils.auth.me.setData(undefined, newUser); setAuthModalOpen(false); toast.success("تم إنشاء حسابك بنجاح"); } });
  const loginMutation = trpc.auth.login.useMutation({ onSuccess: (signedInUser) => { trpcUtils.auth.me.setData(undefined, signedInUser); setAuthModalOpen(false); toast.success("تم تسجيل الدخول"); } });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authAccepted, setAuthAccepted] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [providerBusinessName, setProviderBusinessName] = useState("");
  const [providerServiceType, setProviderServiceType] = useState("سطحة وإنقاذ");
  const [providerPhone, setProviderPhone] = useState("");
  const [providerCoverage, setProviderCoverage] = useState("الرياض");
  const [providerCrNumber, setProviderCrNumber] = useState("");
  const [providerCardNumber, setProviderCardNumber] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const termsQuery = trpc.terms.status.useQuery(undefined, { enabled: isAuthenticated });
  const termsAccepted = Boolean(termsQuery.data?.accepted);
  const acceptTermsMutation = trpc.terms.accept.useMutation({
    onSuccess: async () => {
      setTermsOpen(false);
      setTermsChecked(false);
      await termsQuery.refetch();
      toast.success("تم حفظ موافقتك — يمكنك الآن استخدام خدمات نجدة", { duration: 3200 });
    },
  });
  const notificationsQuery = trpc.notifications.list.useQuery(undefined, { enabled: Boolean(isAuthenticated && termsAccepted), refetchInterval: 30000 });
  const unreadNotificationsQuery = trpc.notifications.unreadCount.useQuery(undefined, { enabled: Boolean(isAuthenticated && termsAccepted), refetchInterval: 30000 });
  const markNotificationRead = trpc.notifications.markRead.useMutation({
    onSuccess: async () => {
      await trpcUtils.notifications.list.invalidate();
      await trpcUtils.notifications.unreadCount.invalidate();
    },
  });
  const markAllNotificationsRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: async () => {
      await trpcUtils.notifications.list.invalidate();
      await trpcUtils.notifications.unreadCount.invalidate();
    },
  });

  const [selectedService, setSelectedService] = useState("tow");
  const [location, setLocation] = useState("طريق الملك فهد، الرياض");
  const [requestOpen, setRequestOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [search, setSearch] = useState("");
  const [mapServiceFilter, setMapServiceFilter] = useState("all");
  const [mapRatingFilter, setMapRatingFilter] = useState("all");
  const [mapSort, setMapSort] = useState<"distance" | "rating" | "price" | "eta">("distance");
  const [minPrice, setMinPrice] = useState(80);
  const [maxPrice, setMaxPrice] = useState(400);
  const [contractTerm, setContractTerm] = useState<"short" | "long">("short");
  const contractDetails = contractTerm === "short"
    ? { duration: "مهمة إلى ٣ أشهر", coverage: "مدينة أو نطاق ٥٠ كم", value: "من ٨٠٠ إلى ١٥,٠٠٠ ر.س", commission: "قابلة للتحديد" }
    : { duration: "٦ أشهر إلى ٣ سنوات", coverage: "المملكة أو عدة مناطق", value: "من ٢٥,٠٠٠ إلى ٥٠٠,٠٠٠ ر.س", commission: "قابلة للتحديد" };
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
  const [trackingProgress, setTrackingProgress] = useState(38);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "held" | "released">("pending");
  const [paymentHoldId, setPaymentHoldId] = useState<number | null>(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [walletSettingsOpen, setWalletSettingsOpen] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<"apple_pay" | "mada" | "stc_pay" | "card">("apple_pay");
  const [paymentMethodLabel, setPaymentMethodLabel] = useState("Apple Pay");
  const [paymentLast4, setPaymentLast4] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("100");
  const [payoutAmount, setPayoutAmount] = useState("100");
  const [chatOpen, setChatOpen] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "provider", text: "مرحبًا، أنا في الطريق إليك. هل موقعك واضح؟" },
    { from: "user", text: "نعم، أنا بجانب مخرج طريق الملك فهد." },
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [availableCount, setAvailableCount] = useState(0);
  const walletQuery = trpc.wallet.me.useQuery(undefined, { enabled: Boolean(isAuthenticated && termsAccepted && trackingOpen), refetchOnWindowFocus: false });
  const paymentMethodsQuery = trpc.wallet.paymentMethods.useQuery(undefined, { enabled: Boolean(isAuthenticated && termsAccepted && walletSettingsOpen) });
  const bankAccountsQuery = trpc.wallet.bankAccounts.useQuery(undefined, { enabled: Boolean(isAuthenticated && termsAccepted && walletSettingsOpen) });
  const holdWalletFunds = trpc.wallet.hold.useMutation();
  const releaseWalletFunds = trpc.wallet.release.useMutation();
  const addPaymentMethodMutation = trpc.wallet.addPaymentMethod.useMutation({ onSuccess: () => paymentMethodsQuery.refetch() });
  const addBankAccountMutation = trpc.wallet.addBankAccount.useMutation({ onSuccess: () => { setIban(""); bankAccountsQuery.refetch(); } });
  const createTopUpIntentMutation = trpc.wallet.createTopUpIntent.useMutation();
  const requestPayoutMutation = trpc.wallet.requestPayout.useMutation();
  const messagesQuery = trpc.messages.list.useQuery(
    { requestId: currentRequestId ?? 0 },
    { enabled: Boolean(isAuthenticated && chatOpen && currentRequestId), refetchInterval: 5000 },
  );
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: async () => {
      setChatInput("");
      await messagesQuery.refetch();
    },
  });

  const chosenService = services.find((service) => service.id === selectedService) ?? services[0];
  const ChosenIcon = chosenService.icon;
  const chatDisplayMessages = isAuthenticated && currentRequestId && messagesQuery.data
    ? messagesQuery.data.map((message) => ({ from: message.senderId === user?.id ? "user" : "provider", text: message.body }))
    : chatMessages;
  const activeServicePrice = providers.find((provider) => provider.serviceId === selectedService && provider.available)?.priceValue ?? 120;
  const activePlatformFee = Math.round(activeServicePrice * 0.1);
  const activeProviderNet = activeServicePrice - activePlatformFee;
  const visibleProviders = useMemo(() => {
    const source = showAllProviders ? providers : providers.slice(0, 2);
    if (!search.trim()) return source;
    return source.filter((provider) => `${provider.name} ${provider.type}`.includes(search.trim()));
  }, [search, showAllProviders]);
  const filteredMapProviders = useMemo(() => providers.filter((provider) => {
    const matchesService = mapServiceFilter === "all" || provider.serviceId === mapServiceFilter;
    const matchesRating = mapRatingFilter === "all" || Number(provider.rating) >= Number(mapRatingFilter);
    return matchesService && matchesRating && provider.priceValue >= minPrice && provider.priceValue <= maxPrice;
  }).sort((first, second) => {
    if (mapSort === "rating") return Number(second.rating) - Number(first.rating);
    if (mapSort === "price") return first.priceValue - second.priceValue;
    if (mapSort === "eta") return first.etaMinutes - second.etaMinutes;
    return first.distanceKm - second.distanceKm;
  }), [mapRatingFilter, mapServiceFilter, mapSort, minPrice, maxPrice]);

  useEffect(() => {
    if (!trackingOpen || paymentStatus !== "held" || trackingProgress >= 100) return;
    const timer = window.setInterval(() => setTrackingProgress((value) => Math.min(value + 4, 100)), 1800);
    return () => window.clearInterval(timer);
  }, [trackingOpen, paymentStatus, trackingProgress]);

  useEffect(() => {
    if (isAuthenticated && termsQuery.data && !termsQuery.data.accepted) setTermsOpen(true);
  }, [isAuthenticated, termsQuery.data]);

  function selectService(id: string) {
    setSelectedService(id);
    const service = services.find((item) => item.id === id);
    if (service) toast(`تم اختيار: ${service.title}`, { duration: 1800 });
  }

  function useLocation() {
    setLocation("تم تحديد موقعك الحالي");
    toast.success("تم تحديد موقعك — هذه محاكاة للمعاينة", { duration: 2200 });
  }

  function startRequest() {
    if (isSearching) return;
    setIsSearching(true);
    setAvailableCount(0);
    const countTimer = window.setInterval(() => setAvailableCount((value) => Math.min(value + 3, 12)), 180);
    window.setTimeout(() => {
      window.clearInterval(countTimer);
      setAvailableCount(12);
      setIsSearching(false);
      setRequestOpen(true);
    }, 1100);
  }

  async function submitRequest() {
    if (!isAuthenticated) {
      toast("سجّل الدخول بالبريد الإلكتروني قبل إنشاء طلب مدفوع");
      openAuthModal("login");
      return;
    }
    if (!termsAccepted) {
      setTermsOpen(true);
      toast("يجب الموافقة على شروط التعامل داخل المنصة أولًا");
      return;
    }
    try {
      const request = await createServiceRequest.mutateAsync({
        serviceType: selectedService,
        areaLabel: location,
        budgetMinHalalas: minPrice * 100,
        budgetMaxHalalas: maxPrice * 100,
      });
      setCurrentRequestId(request?.id ?? null);
    } catch {
      toast.error("تعذر حفظ الطلب الآن، يرجى المحاولة مرة أخرى", { duration: 3000 });
      return;
    }
    setRequestOpen(false);
    setTrackingOpen(true);
    setPaymentStatus("pending");
    setPaymentHoldId(null);
    setTrackingProgress(8);
    toast.success("تم حفظ الطلب — احجز المبلغ من محفظة نجدة قبل بدء الخدمة", { duration: 3500 });
  }

  async function holdPayment() {
    if (!currentRequestId) return;
    if (!contactUnlocked) {
      toast("أكمل اتفاق السعر مع مقدم الخدمة قبل حجز المبلغ");
      return;
    }
    const servicePrice = providers.find((provider) => provider.serviceId === selectedService && provider.available)?.priceValue ?? 120;
    const walletBalance = walletQuery.data?.wallet.availableHalalas ?? 0;
    if (walletBalance < servicePrice * 100) {
      toast.error("رصيد المحفظة غير كافٍ — اشحن المحفظة أولًا عبر بوابة الدفع", { duration: 3500 });
      return;
    }
    try {
      const result = await holdWalletFunds.mutateAsync({ requestId: currentRequestId, amountHalalas: servicePrice * 100, platformFeeBps: 1000 });
      setPaymentHoldId(result.paymentHoldId);
      setPaymentStatus("held");
      setTrackingProgress(38);
      toast.success("تم حجز المبلغ بأمان في محفظة نجدة", { duration: 3200 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حجز مبلغ الخدمة", { duration: 3500 });
    }
  }

  async function confirmCompletion() {
    if (!paymentHoldId) return;
    try {
      await releaseWalletFunds.mutateAsync({ paymentHoldId });
      setPaymentStatus("released");
      setRatingSubmitted(false);
      setRatingScore(0);
      toast.success("تم احتساب نسبة نجدة وتحرير صافي المبلغ لمقدم الخدمة", { duration: 4000 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحرير المبلغ الآن", { duration: 3500 });
    }
  }

  function submitServiceRating() {
    if (!currentRequestId || ratingScore < 1) {
      toast("اختر تقييمًا من نجمة إلى خمس نجوم");
      return;
    }
    rateServiceMutation.mutate({ requestId: currentRequestId, score: ratingScore, comment: ratingComment || undefined }, {
      onSuccess: (result) => { setRatingSubmitted(true); toast.success(`شكرًا لتقييمك — أضيفت ${result.experiencePointsAdded} نقطة خبرة لمقدم الخدمة`); },
      onError: (error) => toast.error(error.message),
    });
  }

  function openAuthModal(mode: "login" | "register" = "login") {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }

  function submitAuth(event: FormEvent) {
    event.preventDefault();
    if (authMode === "register") {
      if (!authAccepted) {
        toast("يجب الموافقة على شروط التعامل داخل المنصة");
        return;
      }
      registerMutation.mutate({ email: authEmail, name: authName, phone: authPhone, password: authPassword, acceptedTerms: true }, {
        onError: (submitError) => toast.error(submitError.message),
      });
      return;
    }
    loginMutation.mutate({ email: authEmail, password: authPassword }, {
      onError: (submitError) => toast.error(submitError.message),
    });
  }

  function openWalletSettings() {
    if (!isAuthenticated) {
      toast("سجّل الدخول بالبريد الإلكتروني لإدارة محفظتك");
      openAuthModal("login");
      return;
    }
    if (!termsAccepted) {
      setTermsOpen(true);
      toast("اقبل شروط التعامل داخل المنصة أولًا");
      return;
    }
    setWalletSettingsOpen(true);
  }

  function savePaymentMethod() {
    addPaymentMethodMutation.mutate({
      provider: paymentProvider,
      label: paymentMethodLabel,
      last4: paymentLast4 || undefined,
      isDefault: true,
    });
  }

  function saveBankAccount() {
    addBankAccountMutation.mutate({ bankName, accountHolderName, iban, isDefault: true });
  }

  function createTopUpIntent() {
    const method = paymentMethodsQuery.data?.[0];
    const amount = Math.round(Number(topUpAmount) * 100);
    if (!method || !Number.isFinite(amount) || amount < 100) {
      toast("أضف وسيلة دفع وأدخل مبلغًا صحيحًا للشحن");
      return;
    }
    createTopUpIntentMutation.mutate({ paymentMethodId: method.id, amountHalalas: amount }, {
      onSuccess: () => toast.success("تم إنشاء طلب الشحن — سيكتمل بعد ربط بوابة الدفع", { duration: 3500 }),
      onError: (error) => toast.error(error.message),
    });
  }

  function requestPayout() {
    const account = bankAccountsQuery.data?.[0];
    const amount = Math.round(Number(payoutAmount) * 100);
    if (!account || !Number.isFinite(amount) || amount < 100) {
      toast("أضف حسابًا بنكيًا وأدخل مبلغًا صحيحًا للتحويل");
      return;
    }
    requestPayoutMutation.mutate({ bankAccountId: account.id, amountHalalas: amount }, {
      onSuccess: () => toast.success("تم تسجيل طلب التحويل بانتظار توثيق الحساب البنكي", { duration: 3500 }),
      onError: (error) => toast.error(error.message),
    });
  }

  function sendChatMessage() {
    const message = chatInput.trim();
    if (!message) return;
    if (!isAuthenticated || !currentRequestId) {
      toast("سجّل الدخول بالبريد الإلكتروني لاستخدام الدردشة الخاصة");
      openAuthModal("login");
      return;
    }
    if (!termsAccepted) {
      setTermsOpen(true);
      return;
    }
    sendMessageMutation.mutate({ requestId: currentRequestId, body: message });
  }

  function requestContactUnlock() {
    setContactUnlocked(true);
    toast.success("تم تسجيل موافقة الطرفين — أصبحت بيانات التواصل متاحة في هذه المحاكاة", { duration: 3200 });
  }

  function goTo(id: string) {
    setMobileOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleNotifications() {
    if (!isAuthenticated) {
      toast("سجّل الدخول لحفظ إشعارات طلباتك وعرضها");
      openAuthModal("login");
      return;
    }
    setNotificationsOpen((value) => !value);
  }

  function notificationTime(value: Date | string) {
    return new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  }

  return (
    <div dir="rtl" className="najda-app min-h-screen overflow-x-hidden bg-[#f6f8f6] text-[#13221d]">
      <div className="preview-ribbon"><Sparkles size={13} /> معاينة أولية — السعودية · العربية · الريال السعودي <span className="hidden sm:inline">| لا توجد عمليات دفع حقيقية</span></div>

      <header className="najda-header">
        <div className="page-container flex h-[76px] items-center justify-between gap-6">
          <button className="najda-logo" onClick={() => goTo("#home")} aria-label="نجدة Help"><span className="logo-mark"><Navigation size={19} fill="currentColor" /></span><span><strong>نجدة <b>Help</b></strong><small>NAJDA HELP</small></span></button>
          <nav className="najda-nav hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
            <button onClick={() => goTo("#services")}>الخدمات</button>
            <button onClick={() => goTo("#nearby")}>الأقرب إليك</button>
            <button onClick={() => goTo("#how")}>كيف تعمل؟</button>
            <button onClick={() => goTo("#providers")}>لمقدمي الخدمة</button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="notification-shell">
              <button className="notification-button" onClick={toggleNotifications} aria-label="الإشعارات" aria-expanded={notificationsOpen}>
                <Bell size={17} />
                {Boolean(unreadNotificationsQuery.data) && <span className="notification-badge">{unreadNotificationsQuery.data! > 9 ? "٩+" : unreadNotificationsQuery.data}</span>}
              </button>
              {notificationsOpen && <div className="notification-panel" role="dialog" aria-label="إشعاراتك">
                <div className="notification-panel-head"><div><span className="mini-label">مركز التنبيهات</span><strong>إشعاراتك</strong></div><button onClick={() => markAllNotificationsRead.mutate()} disabled={markAllNotificationsRead.isPending || !unreadNotificationsQuery.data}>تحديد الكل كمقروء</button></div>
                <div className="notification-list">
                  {notificationsQuery.isLoading && <p className="notification-empty">جارٍ تحميل الإشعارات...</p>}
                  {!notificationsQuery.isLoading && notificationsQuery.data?.length === 0 && <p className="notification-empty">لا توجد إشعارات جديدة حاليًا.</p>}
                  {notificationsQuery.data?.map((notification) => <button key={notification.id} className={`notification-item ${notification.readAt ? "is-read" : ""}`} onClick={() => { if (!notification.readAt) markNotificationRead.mutate({ notificationId: notification.id }); }}><span className={`notification-icon notification-${notification.type}`}><Bell size={14} /></span><span className="notification-copy"><strong>{notification.title}</strong><span>{notification.body}</span><small>{notificationTime(notification.createdAt)}</small></span>{!notification.readAt && <i className="notification-unread-dot" />}</button>)}
                </div>
              </div>}
            </div>
            <button className="wallet-header-button hidden sm:inline-flex" onClick={openWalletSettings}><Banknote size={15} /> المحفظة</button>
            <button className="lang-button hidden sm:flex"><Globe2 size={15} /> العربية <ChevronDown size={14} /></button>
            <button className="provider-login hidden sm:block" onClick={() => openAuthModal("login")}>تسجيل الدخول بالبريد</button>
            <button className="mobile-menu-button lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="القائمة">{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        {mobileOpen && <div className="mobile-menu lg:hidden"><button onClick={() => goTo("#services")}>الخدمات</button><button onClick={() => goTo("#nearby")}>الأقرب إليك</button><button onClick={() => goTo("#how")}>كيف تعمل؟</button><button onClick={() => goTo("#providers")}>لمقدمي الخدمة</button><button onClick={() => { setMobileOpen(false); openAuthModal("login"); }}>تسجيل الدخول بالبريد</button></div>}
      </header>

      <main>
        <section className="najda-hero" id="home">
          <img src="/manus-storage/najda-hero_4f57e98a.jpg" alt="سطحة نجدة على طريق سعودي" className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-overlay" />
          <div className="page-container relative z-10 grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1.08fr_.92fr]">
            <div className="hero-copy">
              <div className="hero-kicker"><span className="live-dot" /> مساعدة موثوقة، عندما تحتاجها</div>
              <h1>على الطريق؟<br /><em>نجدة</em> أقرب مما تتوقع.</h1>
              <p>منصة واحدة توصلك بأقرب سطحة، فني متنقل، أو فريق إنقاذ للمركبات الخفيفة والثقيلة — في كل مناطق المملكة.</p>
              <div className="hero-actions"><button className="hero-primary" onClick={() => goTo("#request")}><Crosshair size={17} /> اطلب مساعدة الآن</button><button className="hero-secondary" onClick={() => goTo("#how")}>كيف تعمل نجدة؟ <ArrowLeft size={16} /></button></div>
              <div className="hero-proof"><div><strong>+ ٢,٤٠٠</strong><span>مقدم خدمة معتمد</span></div><i /><div><strong>+ ١٢٠</strong><span>مدينة ومنطقة</span></div><i /><div><strong>٢٤/٧</strong><span>متاحة دائمًا</span></div></div>
            </div>
            <div className="request-card" id="request">
              <div className="card-head"><div><span className="mini-label">اطلب مساعدة</span><h2>ما الذي تحتاجه؟</h2></div><div className="secure-chip"><ShieldCheck size={14} /> آمن</div></div>
              <div className="service-picker">{services.map((service) => { const Icon = service.icon; return <button key={service.id} onClick={() => selectService(service.id)} className={`service-choice ${selectedService === service.id ? "active" : ""}`}><Icon size={21} strokeWidth={1.8} /><span>{service.title}</span></button>; })}</div>
              <label className="location-field"><MapPin size={18} /><span><small>موقعك الحالي</small><strong>{location}</strong></span><button onClick={useLocation} aria-label="تحديد الموقع"><Crosshair size={17} /></button></label>
              <button className={`request-submit ${isSearching ? "is-searching" : ""}`} onClick={startRequest} disabled={isSearching}>{isSearching ? <><span className="button-spinner" /> جارٍ البحث عن الأقرب...</> : <>ابحث عن الأقرب <ArrowLeft size={17} /></>}</button>
              <p className="request-note"><Check size={13} /> لا يتم الخصم إلا بعد إتمام الخدمة وتأكيدك</p>
            </div>
          </div>
          <div className="hero-bottom-note"><span>تغطية على مستوى المملكة</span><span>الرياض · جدة · الدمام · وأكثر</span></div>
        </section>

        <section className="trust-strip"><div className="page-container flex flex-wrap items-center justify-between gap-6"><p><BadgeCheck size={18} /> مقدمو خدمات موثقون</p><p><ShieldCheck size={18} /> دفع محمي داخل المنصة</p><p><Clock3 size={18} /> تتبع مباشر حتى وصول المساعدة</p><p><Headphones size={18} /> دعم متاح على مدار الساعة</p></div></section>

        <section className="section-pad" id="services">
          <div className="page-container">
            <div className="section-intro"><div><span className="section-label">خدمات نجدة</span><h2>كل ما تحتاجه<br /><em>على الطريق.</em></h2></div><p>من عطل بسيط إلى نقل معدة ثقيلة، اختر الخدمة ودع نجدة تجد لك الشخص المناسب في المكان المناسب.</p></div>
            <div className="service-grid">{services.map((service, index) => { const Icon = service.icon; return <button key={service.id} onClick={() => { selectService(service.id); goTo("#request"); }} className={`service-card tone-${service.tone}`}><span className="service-number">0{index + 1}</span><span className="service-icon"><Icon size={26} strokeWidth={1.5} /></span><strong>{service.title}</strong><small>{service.subtitle}</small><span className="service-detail">{service.detail}</span><ArrowUpLeft size={18} className="service-arrow" /></button>; })}</div>
          </div>
        </section>

        <section className="nearby-section" id="nearby">
          <div className="page-container grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div><span className="section-label">الأقرب إليك</span><h2>المساعدة<br /><em>على بُعد دقائق.</em></h2><p className="mt-6 max-w-[430px] text-[15px] leading-8 text-[#617069]">نجدة تستخدم موقعك لتعرض لك مقدمي الخدمة المتاحين حولك، مع وقت الوصول والتقييم والسعر التقديري قبل أن تطلب.</p><div className="nearby-stats"><div><strong>٨ دقائق</strong><span>متوسط الوصول</span></div><div><strong>٤٫٨/٥</strong><span>متوسط التقييم</span></div><div><strong>١٠٠%</strong><span>تتبع واضح</span></div></div><button className="dark-outline-button" onClick={() => goTo("#providers")}>استعرض مقدمي الخدمة <ArrowLeft size={16} /></button></div>
            <div className={`map-panel ${isSearching ? "map-is-searching" : ""}`}><div className="map-search-status">{isSearching && <><span className="status-loader" /> نجدة تبحث عن مقدمي الخدمة حولك... <strong className="live-provider-count">{availableCount}</strong> متاح الآن</>}</div><div className="map-toolbar"><div className="map-location"><span className="map-pulse" /><span>موقعك الحالي</span></div><div className="map-toolbar-actions"><div className="map-sort-buttons"><button className={mapSort === "distance" ? "active" : ""} onClick={() => setMapSort("distance")}><Navigation size={12} /> الأقرب</button><button className={mapSort === "rating" ? "active" : ""} onClick={() => setMapSort("rating")}><Star size={12} /> الأعلى تقييمًا</button><button className={mapSort === "price" ? "active" : ""} onClick={() => setMapSort("price")}><Banknote size={12} /> الأقل سعرًا</button><button className={mapSort === "eta" ? "active" : ""} onClick={() => setMapSort("eta")}><Clock3 size={12} /> الأسرع وصولًا</button></div><span className="map-city">الرياض، السعودية</span></div></div><div className="map-filters"><label><span>نوع الخدمة</span><select value={mapServiceFilter} onChange={(event) => setMapServiceFilter(event.target.value)}><option value="all">كل الخدمات</option>{services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}</select></label><label><span>التقييم</span><select value={mapRatingFilter} onChange={(event) => setMapRatingFilter(event.target.value)}><option value="all">كل التقييمات</option><option value="4.8">٤٫٨ فأعلى</option><option value="4.9">٤٫٩ فأعلى</option></select></label><label className="price-range-control"><span>النطاق السعري <strong>{minPrice}–{maxPrice} ر.س</strong></span><div className="dual-range"><span className="range-fill" style={{ right: `${((minPrice - 80) / 320) * 100}%`, left: `${100 - ((maxPrice - 80) / 320) * 100}%` }} /><input type="range" min="80" max="400" step="10" value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 10))} aria-label="الحد الأدنى للسعر" /><input type="range" min="80" max="400" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 10))} aria-label="الحد الأعلى للسعر" /></div></label><button className="clear-map-filters" onClick={() => { setMapServiceFilter("all"); setMapRatingFilter("all"); setMinPrice(80); setMaxPrice(400); }}>مسح</button></div><div className="fake-map"><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><div className="map-road road-four" /><div className="map-block block-one" /><div className="map-block block-two" /><div className="map-block block-three" /><div className="map-block block-four" /><div className="you-marker"><span>أنت</span><i /></div>{(mapServiceFilter === "all" || mapServiceFilter === "tow") && <button className="map-pin pin-one" onClick={() => toast("شركة درب الإنقاذ — ٨ دقائق")}><Truck size={15} /></button>}{(mapServiceFilter === "all" || mapServiceFilter === "mobile") && <button className="map-pin pin-two" onClick={() => toast("ورشة السريع — ١١ دقيقة")}><Wrench size={15} /></button>}{(mapServiceFilter === "all" || mapServiceFilter === "heavy") && <button className="map-pin pin-three" onClick={() => toast("مساندة للآليات — ١٦ دقيقة")}><Package size={15} /></button>}{(mapServiceFilter === "all" || mapServiceFilter === "projects") && <button className="map-pin pin-four" onClick={() => toast("حلول مواقع البناء — ٢٢ دقيقة")}><HardHat size={15} /></button>}<div className="map-scale">١ كم</div></div><div className="map-footer"><span><span className="status-dot" /> {filteredMapProviders.length} مقدم خدمة مطابق</span><button onClick={useLocation}><Crosshair size={15} /> تحديث موقعي</button></div></div>
          </div>
        </section>

        <section className="section-pad providers-section" id="providers">
          <div className="page-container"><div className="providers-head"><div><span className="section-label">مقدمو الخدمة</span><h2>اختيار واضح.<br /><em>قرار مطمئن.</em></h2></div><div className="provider-search"><Search size={16} /><input placeholder="ابحث عن نوع الخدمة" value={search} onChange={(event) => setSearch(event.target.value)} /></div></div><div className="providers-list">{visibleProviders.map((provider) => { const Icon = provider.icon; return <article className="provider-row" key={provider.name}><div className="provider-avatar"><Icon size={23} /></div><div className="provider-info"><strong>{provider.name}</strong><span>{provider.type}</span></div><div className="provider-detail"><span><MapPin size={14} /> {provider.distance}</span><span><Clock3 size={14} /> {provider.eta}</span></div><div className="provider-rating"><Star size={14} fill="currentColor" /> {provider.rating}</div><div className="provider-price">{provider.price}</div><button className={`provider-cta ${provider.available ? "" : "disabled"}`} onClick={() => provider.available ? setRequestOpen(true) : toast("سيظهر هذا المقدم عند توفره")}>{provider.available ? "اطلب الآن" : "غير متاح"}<ArrowLeft size={15} /></button></article>; })}</div><button className="show-more" onClick={() => setShowAllProviders((value) => !value)}>{showAllProviders ? "عرض أقل" : "عرض جميع مقدمي الخدمة"} <ChevronDown size={15} className={showAllProviders ? "rotate-180" : ""} /></button></div>
        </section>

        <section className="how-section" id="how"><div className="page-container"><div className="how-header"><div><span className="section-label lime-label">ببساطة، في ثلاث خطوات</span><h2>اطلب. تابع.<br /><em>اطمئن.</em></h2></div><p>صممنا التجربة لتكون واضحة في اللحظة التي تحتاج فيها للمساعدة أكثر من أي وقت.</p></div><div className="steps-grid"><div className="step"><span>01</span><Smartphone size={24} /><h3>حدد احتياجك</h3><p>اختر نوع الخدمة وشارك موقعك بضغطة واحدة.</p></div><div className="step-connector" /><div className="step"><span>02</span><CreditCard size={24} /><h3>راجع وادفع بأمان</h3><p>قارن السعر والوقت ثم احجز المبلغ داخل نجدة.</p></div><div className="step-connector" /><div className="step"><span>03</span><BadgeCheck size={24} /><h3>تأكد من الإتمام</h3><p>تابع وصول مقدم الخدمة ولا يُحوّل المبلغ إلا بتأكيدك.</p></div></div></div></section>

        <section className="for-providers section-pad" id="for-providers"><div className="page-container grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><span className="section-label">لمقدمي الخدمة</span><h2>حوّل خبرتك<br /><em>إلى فرص أكثر.</em></h2><p>انضم إلى شبكة نجدة، اعرض خدماتك للعملاء القريبين منك، واستقبل طلبات جديدة بشفافية وأمان.</p><div className="provider-benefits"><span><Check size={15} /> وصول لعملاء جدد</span><span><Check size={15} /> تحكم في نطاقك وأسعارك</span><span><Check size={15} /> مدفوعات موثوقة</span></div><div className="contract-offer"><div className="contract-offer-head"><span>فرص عقود مرنة</span><small>للصيانة والمشاريع والمقاولات</small></div><div className="contract-tabs"><button className={contractTerm === "short" ? "active" : ""} onClick={() => setContractTerm("short")}><Clock3 size={15} /><span><strong>قصير الأمد</strong><small>مهمة أو أسبوع</small></span></button><button className={contractTerm === "long" ? "active" : ""} onClick={() => setContractTerm("long")}><CalendarDays size={15} /><span><strong>طويل الأمد</strong><small>شهري أو سنوي</small></span></button></div><p>{contractTerm === "short" ? "استقبل طلبات صيانة عاجلة، إصلاحات ميدانية، أو دعم مؤقت للمواقع." : "احصل على عقود دورية لصيانة الأساطيل والمعدات وإدارة خدمات مواقع المشاريع."}</p><div className="contract-tags"><span>{contractTerm === "short" ? "استجابة سريعة" : "دخل متكرر"}</span><span>{contractTerm === "short" ? "تسعير لكل مهمة" : "اتفاقية خدمة"}</span><span>تغطية المملكة</span></div><div className="contract-details"><div><Clock3 size={13} /><small>المدة</small><strong>{contractDetails.duration}</strong></div><div><MapPin size={13} /><small>التغطية</small><strong>{contractDetails.coverage}</strong></div><div><Banknote size={13} /><small>القيمة التقديرية</small><strong>{contractDetails.value}</strong></div><div><Percent size={13} /><small>نسبة نجدة Help</small><strong>{contractDetails.commission}</strong></div></div></div><button className="dark-button" onClick={() => toast("سيتم فتح تسجيل مقدمي الخدمة في المرحلة التالية")}>سجّل كمقدم خدمة <ArrowLeft size={16} /></button></div><div className="provider-visual"><img src="/manus-storage/najda-mobile_449e8f56.jpg" alt="فني نجدة متنقل" /><div className="visual-card"><span className="visual-card-icon"><Banknote size={16} /></span><span><strong>مدفوعاتك محفوظة</strong><small>نحولها لك بعد إتمام الخدمة</small></span></div></div></div></section>

        <section className="faq-section section-pad" id="faq"><div className="page-container grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><span className="section-label">أسئلة شائعة</span><h2>نوضح لك<br /><em>كل خطوة.</em></h2><p>لديك سؤال آخر؟ فريق نجدة هنا لمساعدتك.</p><button className="text-link" onClick={() => toast("الدعم المباشر سيتوفر مع إطلاق المنصة")}>تواصل مع الدعم <ArrowLeft size={15} /></button></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className="faq-row" key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)}><strong>{question}</strong><ChevronDown size={17} className={openFaq === index ? "rotate-180" : ""} /></button><div className={`faq-content ${openFaq === index ? "open" : ""}`}><p>{answer}</p></div></div>)}</div></div></section>

        <section className="cta-section"><div className="page-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><span className="section-label lime-label">حين تحتاجنا، نحن هنا</span><h2>طريقك أهدأ<br />مع <em>نجدة.</em></h2></div><button className="cta-button" onClick={() => goTo("#request")}>اطلب مساعدة الآن <ArrowLeft size={17} /></button></div></section>
      </main>

      <footer className="najda-footer"><div className="page-container grid gap-10 py-12 md:grid-cols-[1.1fr_1fr_1fr_1fr]"><div><button className="najda-logo footer-logo" onClick={() => goTo("#home")}><span className="logo-mark"><Navigation size={19} fill="currentColor" /></span><span><strong>نجدة <b>Help</b></strong><small>NAJDA HELP</small></span></button><p className="mt-5 max-w-[240px] text-sm leading-7 text-[#9eb1a8]">نجدة Help — منصة المساعدة على الطريق التي توصلك بمن تحتاجه، في الوقت والمكان المناسب.</p></div><div><h3>المنصة</h3><button onClick={() => goTo("#services")}>الخدمات</button><button onClick={() => goTo("#nearby")}>الأقرب إليك</button><button onClick={() => goTo("#how")}>كيف تعمل؟</button></div><div><h3>للمجتمع</h3><button onClick={() => goTo("#providers")}>سجّل كمقدم خدمة</button><button onClick={() => toast("سياسة الأمان ستتوفر عند الإطلاق")}>السلامة والثقة</button><button onClick={() => toast("مركز المساعدة سيُفعّل لاحقًا")}>مركز المساعدة</button></div><div><h3>تواصل</h3><p className="footer-contact"><MessageCircle size={15} /> الدعم متاح ٢٤/٧</p><p className="footer-contact"><Languages size={15} /> السعودية · العربية</p><p className="footer-contact"><Globe2 size={15} /> توسع عالمي قريبًا</p></div></div><div className="footer-bottom"><div className="page-container flex flex-col justify-between gap-3 sm:flex-row"><span>© 2026 نجدة. معاينة غير تجارية.</span><span>الدفع محمي · الخصوصية · الشروط</span></div></div></footer>

      {trackingOpen && <div className="tracking-backdrop" onClick={() => setTrackingOpen(false)}><div className="tracking-panel" onClick={(event) => event.stopPropagation()}><div className="tracking-head"><div><span className="section-label">طلب نشط · NJ-2048</span><h2>مقدم الخدمة في الطريق</h2><p>شركة درب الإنقاذ · سطحة هيدروليك</p></div><button onClick={() => setTrackingOpen(false)} className="modal-close" aria-label="إغلاق"><X size={18} /></button></div><div className="tracking-map"><div className="track-road track-road-one" /><div className="track-road track-road-two" /><div className="track-road track-road-three" /><div className="track-block track-block-one" /><div className="track-block track-block-two" /><div className="track-block track-block-three" /><div className="track-route" style={{ "--route-progress": `${trackingProgress}%` } as CSSProperties} /><div className="tracking-you"><span>موقعك</span><i /></div><div className="tracking-provider" style={{ right: `${20 + trackingProgress * .42}%`, top: `${67 - trackingProgress * .34}%` }}><span className="vehicle-pulse" /><Truck size={16} /></div><div className="track-destination"><MapPin size={17} /></div><div className="tracking-map-label">الرياض · طريق الملك فهد</div></div><div className="tracking-status"><div className="status-icon"><Truck size={19} /></div><div className="status-copy"><strong>{trackingProgress >= 100 ? "وصل مقدم الخدمة" : "في الطريق إليك"}</strong><span>{trackingProgress >= 100 ? "يرجى تأكيد بدء الخدمة" : "آخر تحديث منذ لحظات · يتتبع موقعه مباشرة"}</span></div><div className="eta-block"><strong>{trackingProgress >= 100 ? "الآن" : "٨ دقائق"}</strong><span>وقت الوصول</span></div></div><div className={`wallet-escrow-card wallet-${paymentStatus}`}><div className="wallet-card-head"><div><span className="mini-label">محفظة نجدة · دفع محمي</span><strong>{paymentStatus === "pending" ? "احجز المبلغ قبل بدء الخدمة" : paymentStatus === "held" ? "المبلغ محجوز بأمان" : "تم تحرير المستحقات"}</strong></div><Banknote size={19} /></div><div className="wallet-balance-line"><span>الرصيد المتاح في محفظتك</span><strong>{walletQuery.data ? `${(walletQuery.data.wallet.availableHalalas / 100).toFixed(2)} ر.س` : "يتطلب تسجيل الدخول"}</strong></div><div className="wallet-breakdown"><span><small>قيمة الخدمة</small><strong>{activeServicePrice} ر.س</strong></span><span><small>نسبة نجدة (١٠٪)</small><strong>{activePlatformFee} ر.س</strong></span><span><small>صافي مقدم الخدمة</small><strong>{activeProviderNet} ر.س</strong></span></div>{paymentStatus === "pending" && <><p>{contactUnlocked ? "يدفع العميل مسبقًا إلى محفظة الموقع، ويبقى المبلغ محجوزًا حتى تأكيد الإتمام." : "بعد اتفاق الطرفين على السعر، أكّد الاتفاق لفتح خطوة حجز المبلغ."}</p><button onClick={holdPayment} disabled={holdWalletFunds.isPending || !contactUnlocked}>{holdWalletFunds.isPending ? "جارٍ الحجز..." : contactUnlocked ? "حجز المبلغ من المحفظة" : "بانتظار تأكيد الاتفاق"}</button></>}{paymentStatus === "held" && <><p>المبلغ محفوظ داخل نجدة. بعد انتهاء العمل، اضغط تأكيد الإتمام لتحويل الصافي لمقدم الخدمة.</p><button onClick={confirmCompletion} disabled={releaseWalletFunds.isPending || trackingProgress < 100}>{releaseWalletFunds.isPending ? "جارٍ التحرير..." : trackingProgress < 100 ? "بانتظار وصول مقدم الخدمة" : "تأكيد إتمام الخدمة وتحرير المبلغ"}</button></>}{paymentStatus === "released" && <><p className="wallet-success-note"><Check size={14} /> تم خصم نسبة المنصة وتحويل صافي المبلغ لمقدم الخدمة.</p>{!ratingSubmitted ? <div className="rating-card"><div className="rating-card-head"><div><span className="section-label">رأيك يهمنا</span><strong>كيف كانت تجربتك مع مقدم الخدمة؟</strong></div><Star size={19} /></div><div className="rating-stars" role="radiogroup" aria-label="تقييم الخدمة">{[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" className={score <= ratingScore ? "selected" : ""} onClick={() => setRatingScore(score)} aria-label={`${score} نجوم`}><Star size={22} fill="currentColor" /></button>)}</div><textarea value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} placeholder="أضف ملاحظة اختيارية عن جودة الخدمة..." /><button className="rating-submit" onClick={submitServiceRating} disabled={rateServiceMutation.isPending}>{rateServiceMutation.isPending ? "جارٍ إرسال التقييم..." : "إرسال التقييم"}</button></div> : <p className="rating-thanks"><Star size={15} fill="currentColor" /> تم حفظ تقييمك وإضافة نقاط الخبرة والأولوية لمقدم الخدمة.</p>}</>}<button className="wallet-settings-trigger" onClick={openWalletSettings}>إدارة Apple Pay ومدى وSTC Pay والحساب البنكي <ArrowLeft size={13} /></button></div><div className={`contact-guard ${contactUnlocked ? "unlocked" : ""}`}>{contactUnlocked ? <><div className="guard-icon"><Check size={17} /></div><div><strong>تم فتح بيانات التواصل</strong><span>الهاتف والموقع الدقيق متاحان للطرفين بعد تسجيل الاتفاق.</span></div></> : <><div className="guard-icon"><ShieldCheck size={17} /></div><div><strong>بيانات التواصل والموقع محمية</strong><span>تظهر المنطقة التقريبية فقط حتى يتفق الطرفان على الطلب.</span></div><button onClick={requestContactUnlock}>تسجيل الاتفاق</button></>}</div><div className="tracking-progress"><div><span>انطلق مقدم الخدمة</span><span>{trackingProgress}%</span></div><div className="progress-track"><span style={{ width: `${trackingProgress}%` }} /></div></div><div className="tracking-actions"><button onClick={() => setChatOpen((value) => !value)} className={chatOpen ? "chat-active" : ""}><MessageCircle size={16} /> مراسلة {chatDisplayMessages.length > 2 && <span className="chat-badge">{chatDisplayMessages.length - 2}</span>}</button><button onClick={() => toast("اتصال تجريبي — سيتم تفعيله عند الإطلاق") }><Headphones size={16} /> دعم نجدة</button><button className="cancel-track" onClick={() => { setTrackingOpen(false); toast("يمكن إلغاء الطلب من الدعم قبل وصول مقدم الخدمة"); }}>خيارات الطلب</button></div>{chatOpen && <div className="chat-window"><div className="chat-window-head"><div><strong>محادثة مع مقدم الخدمة</strong><span><i /> متصل الآن</span></div><button onClick={() => setChatOpen(false)} aria-label="إغلاق المحادثة"><X size={15} /></button></div><div className="chat-messages">{chatDisplayMessages.map((message, index) => <div key={`${message.from}-${index}`} className={`chat-message ${message.from === "user" ? "mine" : "theirs"}`}><span>{message.text}</span><small>{index === chatDisplayMessages.length - 1 ? "الآن" : "منذ لحظات"}</small></div>)}</div><form className="chat-compose" onSubmit={(event) => { event.preventDefault(); sendChatMessage(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="اكتب رسالتك..." aria-label="رسالة لمقدم الخدمة" /><button type="submit" aria-label="إرسال الرسالة"><ArrowLeft size={16} /></button></form></div>}<p className="tracking-note"><ShieldCheck size={13} /> التتبع تجريبي في المعاينة ولا يشارك موقعًا حقيقيًا.</p></div></div>}
      {authModalOpen && <div className="modal-backdrop auth-backdrop"><div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div className="auth-modal-head"><div><span className="section-label">حساب نجدة Help</span><h2 id="auth-title">{authMode === "register" ? "أنشئ حسابك بسهولة" : "تسجيل الدخول بالبريد"}</h2><p>سيظهر اسمك فقط للطرف الآخر. البريد ورقم الجوال محفوظان للمنصة فقط.</p></div><button className="modal-close" onClick={() => setAuthModalOpen(false)} aria-label="إغلاق"><X size={18} /></button></div><div className="auth-tabs"><button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>دخول</button><button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>تسجيل جديد</button></div><form className="auth-form" onSubmit={submitAuth}>{authMode === "register" && <><label>الاسم الظاهر للطرف الآخر<input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="مثال: محمد العتيبي" required /></label><label>رقم الجوال <span className="private-field-label">للمنصة فقط</span><input type="tel" value={authPhone} onChange={(event) => setAuthPhone(event.target.value)} placeholder="05xxxxxxxx" required /></label></>}<label>البريد الإلكتروني <span className="private-field-label">للمنصة فقط</span><input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="name@example.com" required /></label><label>كلمة المرور<input type="password" minLength={8} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="٨ أحرف على الأقل" required /></label>{authMode === "register" && <label className="auth-consent"><input type="checkbox" checked={authAccepted} onChange={(event) => setAuthAccepted(event.target.checked)} /><span>أوافق على التعامل والتواصل والدفع داخل نجدة فقط، وأتعهد بعدم التحايل أو نقل البيانات خارج المنصة.</span></label>}<button className="auth-submit" type="submit" disabled={registerMutation.isPending || loginMutation.isPending}>{registerMutation.isPending || loginMutation.isPending ? "جارٍ المعالجة..." : authMode === "register" ? "إنشاء الحساب" : "دخول آمن"}</button></form><small className="auth-privacy-note"><ShieldCheck size={13} /> الاسم الظاهر هو المعلومة العامة الوحيدة بين العميل ومقدم الخدمة.</small></div></div>}
      {termsOpen && isAuthenticated && <div className="modal-backdrop terms-backdrop"><div className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title"><div className="terms-modal-top"><span className="terms-seal"><ShieldCheck size={20} /></span><div><span className="section-label">موافقة مطلوبة عند التسجيل</span><h2 id="terms-title">التعامل الآمن داخل نجدة Help</h2></div></div><div className="terms-copy"><p>باستخدامك منصة نجدة Help، تقر وتتعهد بأن يكون طلب الخدمة والاتفاق على السعر والدفع والتواصل والتنفيذ من داخل المنصة وبحسن نية وتفاهم وتفانٍ من الطرفين.</p><p>يُحظر التحايل على المنصة أو نقل التواصل أو الاتفاق أو الدفع خارجها بقصد تجاوز حماية الحقوق أو نسبة نجدة. قد يؤدي ذلك إلى إيقاف الحساب وحفظ السجلات اللازمة للنظر في النزاع، وقد يعرّض المخالف للمساءلة وفق الأنظمة المعمول بها.</p><p>تسري هذه القاعدة على العميل ومقدم الخدمة معًا. لا تستخدم المنصة لأي نشاط غير نظامي، واحتفظ بكل الرسائل والمبالغ والاتفاقات داخل نجدة.</p></div><label className="terms-check-row"><input type="checkbox" checked={termsChecked} onChange={(event) => setTermsChecked(event.target.checked)} /><span>أوافق على شروط التعامل داخل المنصة، وأتعهد بعدم التحايل أو التواصل أو الدفع خارج نجدة.</span></label><button className="terms-accept-button" onClick={() => acceptTermsMutation.mutate({ accepted: true })} disabled={!termsChecked || acceptTermsMutation.isPending}>{acceptTermsMutation.isPending ? "جارٍ حفظ الموافقة..." : "أوافق وأتابع داخل نجدة"}</button><small className="terms-version">إصدار الشروط: {termsQuery.data?.termsVersion ?? "2026-09-v1"} · يُنصح بمراجعة النص قانونيًا قبل الإطلاق التجاري.</small></div></div>}
      {walletSettingsOpen && <div className="modal-backdrop" onClick={() => setWalletSettingsOpen(false)}><div className="wallet-settings-modal" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="section-label">محفظة نجدة</span><h2>طرق الدفع والسحب</h2></div><button onClick={() => setWalletSettingsOpen(false)} className="modal-close" aria-label="إغلاق"><X size={18} /></button></div><p className="wallet-settings-note">أضف Apple Pay أو مدى أو STC Pay للدفع إلى المحفظة. لإيداع المستحقات، أضف حسابًا بنكيًا موثقًا. لا نخزن رقم البطاقة أو IBAN الكامل.</p><div className="wallet-settings-grid"><form className="wallet-settings-form" onSubmit={(event) => { event.preventDefault(); savePaymentMethod(); }}><div className="wallet-form-heading"><CreditCard size={16} /><strong>وسيلة الدفع للمحفظة</strong></div><label>المزود<select value={paymentProvider} onChange={(event) => { const value = event.target.value as "apple_pay" | "mada" | "stc_pay" | "card"; setPaymentProvider(value); setPaymentMethodLabel(value === "apple_pay" ? "Apple Pay" : value === "mada" ? "مدى" : value === "stc_pay" ? "STC Pay" : "بطاقة بنكية"); }}><option value="apple_pay">Apple Pay</option><option value="mada">مدى</option><option value="stc_pay">STC Pay</option><option value="card">بطاقة بنكية</option></select></label><label>اسم الوسيلة<input value={paymentMethodLabel} onChange={(event) => setPaymentMethodLabel(event.target.value)} placeholder="مثال: بطاقة العمل" /></label><label>آخر ٤ أرقام (اختياري)<input inputMode="numeric" maxLength={4} value={paymentLast4} onChange={(event) => setPaymentLast4(event.target.value.replace(/\D/g, ""))} placeholder="••••" /></label><button className="wallet-form-button" type="submit" disabled={addPaymentMethodMutation.isPending}>{addPaymentMethodMutation.isPending ? "جارٍ الحفظ..." : "حفظ وسيلة الدفع"}</button><div className="saved-wallet-items">{paymentMethodsQuery.data?.map((method) => <span key={method.id}><Check size={12} /> {method.label}{method.last4 ? ` ····${method.last4}` : ""}</span>)}</div></form><form className="wallet-settings-form" onSubmit={(event) => { event.preventDefault(); saveBankAccount(); }}><div className="wallet-form-heading"><Banknote size={16} /><strong>حساب السحب البنكي</strong></div><label>اسم البنك<input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="مثال: البنك الراجحي" required /></label><label>اسم صاحب الحساب<input value={accountHolderName} onChange={(event) => setAccountHolderName(event.target.value)} placeholder="مطابق للهوية" required /></label><label>رقم IBAN السعودي<input dir="ltr" value={iban} onChange={(event) => setIban(event.target.value)} placeholder="SA••••••••••••••••••••••••" required /></label><button className="wallet-form-button" type="submit" disabled={addBankAccountMutation.isPending}>{addBankAccountMutation.isPending ? "جارٍ التحقق..." : "حفظ حساب السحب"}</button><div className="saved-wallet-items">{bankAccountsQuery.data?.map((account) => <span key={account.id}><Check size={12} /> {account.bankName} ····{account.ibanLast4} · {account.verificationStatus === "verified" ? "موثق" : "بانتظار التوثيق"}</span>)}</div></form></div><div className="wallet-flow-grid"><div className="wallet-flow-card"><div className="wallet-form-heading"><CreditCard size={16} /><strong>شحن المحفظة</strong></div><p>أنشئ طلب شحن عبر الوسيلة المحفوظة، ثم تُحدّث المحفظة بعد تأكيد بوابة الدفع.</p><div className="wallet-flow-row"><input type="number" min="1" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} aria-label="مبلغ الشحن بالريال" /><span>ر.س</span><button onClick={createTopUpIntent} disabled={createTopUpIntentMutation.isPending || !paymentMethodsQuery.data?.length}>{createTopUpIntentMutation.isPending ? "جارٍ..." : "طلب شحن"}</button></div></div><div className="wallet-flow-card"><div className="wallet-form-heading"><Banknote size={16} /><strong>تحويل من المحفظة للبنك</strong></div><p>يُرسل صافي الرصيد إلى الحساب البنكي بعد التوثيق والمراجعة.</p><div className="wallet-flow-row"><input type="number" min="1" value={payoutAmount} onChange={(event) => setPayoutAmount(event.target.value)} aria-label="مبلغ التحويل بالريال" /><span>ر.س</span><button onClick={requestPayout} disabled={requestPayoutMutation.isPending || !bankAccountsQuery.data?.length}>{requestPayoutMutation.isPending ? "جارٍ..." : "طلب تحويل"}</button></div></div></div><p className="wallet-settings-footnote"><ShieldCheck size={13} /> التحويل البنكي الفعلي وتكامل Apple Pay ومدى وSTC Pay يحتاج مفاتيح مزود الدفع وتوثيق الحساب قبل التشغيل.</p></div></div>}
      {requestOpen && <div className="modal-backdrop" onClick={() => setRequestOpen(false)}><div className="request-modal" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="section-label">طلب جديد</span><h2>تأكيد تفاصيل المساعدة</h2></div><button onClick={() => setRequestOpen(false)} className="modal-close" aria-label="إغلاق"><X size={18} /></button></div><div className="modal-summary"><div className={`modal-service-icon tone-${chosenService.tone}`}><ChosenIcon size={22} /></div><div><strong>{chosenService.title}</strong><span>{chosenService.detail}</span></div></div><div className="modal-location"><MapPin size={17} /><span><small>الموقع</small><strong>{location}</strong></span><Check size={16} /></div><div className="modal-protection"><ShieldCheck size={18} /><div><strong>دفع محمي داخل نجدة</strong><span>سيُحجز المبلغ فقط — لا يتم تحويله إلا بعد تأكيد إتمام الخدمة.</span></div></div><div className="modal-actions"><button className="request-submit" onClick={submitRequest} disabled={createServiceRequest.isPending}>{createServiceRequest.isPending ? "جارٍ حفظ الطلب..." : "متابعة إلى اختيار مقدم الخدمة"} {!createServiceRequest.isPending && <ArrowLeft size={17} />}</button><button className="modal-cancel" onClick={() => setRequestOpen(false)}>العودة</button></div><p className="modal-preview-note">هذه خطوة تجريبية في المعاينة ولن يتم إرسال طلب حقيقي.</p></div></div>}
    </div>
  );
}
