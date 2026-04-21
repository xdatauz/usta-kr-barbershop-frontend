import { useEffect, useState } from "react";
import {
  Bell,
  Loader2,
  CheckCheck,
  X,
  Trash2,
  MessageSquare,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth/auth-provider";
import {
  getClientNotificationsApi,
  markClientNotificationReadApi,
  markAllClientNotificationsReadApi,
  deleteClientNotificationApi,
  deleteAllClientNotificationsApi,
  type ClientNotification,
} from "../../lib/api/notifications";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isAppointmentNotification = (n: ClientNotification) =>
  n.title.includes("navbat") || n.title.includes("Navbat") || n.title.includes("✅") || n.title.includes("❌") || n.title.includes("✂️") || n.title.includes("📝");

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locale = location.pathname.split("/")[1] || "uz";
  const [items, setItems] = useState<ClientNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ClientNotification | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getClientNotificationsApi();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) void load();
    else setIsLoading(false);
  }, [currentUser]);

  const handleOpen = (item: ClientNotification) => {
    setSelected(item);
    if (!item.isRead) void handleMarkRead(item);
  };

  const handleMarkRead = async (item: ClientNotification) => {
    await markClientNotificationReadApi(item.id);
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    if (selected?.id === item.id) setSelected({ ...item, isRead: true });
  };

  const handleMarkAllRead = async () => {
    await markAllClientNotificationsReadApi();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteClientNotificationApi(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleDeleteAll = async () => {
    await deleteAllClientNotificationsApi();
    setItems([]);
    setSelected(null);
    setConfirmClear(false);
  };

  const unread = items.filter((n) => !n.isRead).length;

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400 dark:text-slate-500">
        <Bell className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">Please log in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl pt-32 mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-500" />
            </div>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={() => void handleMarkAllRead()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 dark:text-gray-500">
            <Inbox className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs opacity-60">We'll notify you about your bookings and updates</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-gray-800">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleOpen(item)}
                className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/50 ${
                  item.isRead ? "opacity-60" : ""
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {item.body}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                  {!item.isRead && (
                    <button
                      title="Mark as read"
                      onClick={(e) => { e.stopPropagation(); void handleMarkRead(item); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    title="Delete"
                    onClick={(e) => void handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">{selected.title}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* body */}
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {selected.body}
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-gray-600">{formatDate(selected.createdAt)}</p>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              {isAppointmentNotification(selected) && (
                <button
                  onClick={() => { setSelected(null); navigate(`/${locale}/profile`); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Navbatlarni ko'rish
                </button>
              )}
              <button
                onClick={() => void handleDelete(selected.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm clear all */}
      {confirmClear && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmClear(false); }}
        >
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Clear all notifications?</p>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteAll()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
