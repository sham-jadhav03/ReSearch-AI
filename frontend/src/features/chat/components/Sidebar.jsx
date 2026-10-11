import LogoIcon from "../shared/LogoIcon";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";

const Sidebar = (props) => {
  const {
    deleteChat,
    startNewChat,
    chats,
    openChat,
    currentChatId,
    isMobileOpen,
    onClose,
  } = props;

  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const onLogout = async (e) => {
    e.stopPropagation();
    await handleLogout();
    navigate("/");
  };

  const handleSelectChat = (chatId) => {
    openChat(chatId);
    if (onClose) onClose();
  };

  const handleNewChat = () => {
    startNewChat();
    if (onClose) onClose();
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-5 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <LogoIcon size={16} />
          </div>
          <span className="text-[15px] font-medium tracking-[-0.2px] text-text-primary">
            ResearchAI
          </span>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden cursor-pointer rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
          >
            <i className="ri-close-line text-lg" />
          </button>
        )}
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={handleNewChat}
          className="w-full cursor-pointer flex items-center gap-2.5 rounded-xl border border-dashed border-border-default px-3 py-2.5 text-[13px] text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
        >
          <i className="ri-add-line text-base" />
          New chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-0.5">
        {Object.values(chats).length > 0 && (
          <p className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-[0.8px] text-text-muted">
            Recent
          </p>
        )}
        {Object.values(chats ?? {}).map((chat, index) => (
          <button
            key={index}
            onClick={() => handleSelectChat(chat.id)}
            className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors
              ${
                currentChatId === chat.id
                  ? "border-border-default bg-surface-secondary text-text-primary"
                  : "border-transparent text-text-secondary hover:border-border-default hover:bg-surface-secondary hover:text-text-primary"
              }`}
          >
            <span className="truncate flex-1 text-left">{chat.title}</span>
            <span
              onClick={(e) => deleteChat(e, chat.id)}
              className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-colors hover:bg-red-500/20 group-hover:opacity-100"
            >
              <i className="ri-delete-bin-3-line text-xs text-red-400" />
            </span>
          </button>
        ))}
      </div>

      {/* User profile */}
      <div className="mt-auto border-t border-border-default flex items-center justify-between">
        <button
          onClick={() => {
            if (onClose) onClose();
            navigate("/profile");
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-5 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary"
        >
          <i className="ri-user-3-line text-base"></i>
          <span className="font-semibold text-text-primary">Profile</span>
        </button>
        <button
          onClick={onLogout}
          className="flex h-full cursor-pointer items-center justify-center self-stretch border-l border-border-default px-4 py-5 text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400"
          title="Log Out"
        >
          <i className="ri-logout-box-r-line text-base"></i>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-full w-62.5 min-w-62.5 flex-col border-r border-border-default bg-sidebar md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer content */}
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-border-default bg-sidebar shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
