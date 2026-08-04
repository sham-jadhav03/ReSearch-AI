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
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
            <LogoIcon size={16} />
          </div>
          <span className="text-[15px] font-medium tracking-[-0.2px] text-white">
            ResearchAI
          </span>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        )}
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-white/13 text-[#888892] text-[13px] hover:border-green-300 hover:text-green-400 hover:bg-blue-500/8 transition-all duration-200 cursor-pointer"
        >
          <i className="ri-add-line text-base" />
          New chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-4 space-y-0.5">
        {Object.values(chats).length > 0 && (
          <p className="text-[10px] font-medium tracking-[0.8px] uppercase text-white/20 px-2 pb-2 pt-1">
            Recent
          </p>
        )}
        {Object.values(chats ?? {}).map((chat, index) => (
          <button
            key={index}
            onClick={() => handleSelectChat(chat.id)}
            className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 border cursor-pointer text-left
              ${
                currentChatId === chat.id
                  ? "bg-blue-500/12 border-blue-500/2 text-white"
                  : "border-transparent text-[#888892] hover:bg-white/5 hover:border-white/[0.07] hover:text-white/90"
              }`}
          >
            <span className="truncate flex-1 text-left">{chat.title}</span>
            <span
              onClick={(e) => deleteChat(e, chat.id)}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 transition-all duration-150 shrink-0 ml-1"
            >
              <i className="ri-delete-bin-3-line text-xs text-red-400" />
            </span>
          </button>
        ))}
      </div>

      {/* User profile */}
      <div className="mt-auto border-t border-white/[0.07] flex items-center justify-between">
        <button
          onClick={() => {
            if (onClose) onClose();
            navigate("/profile");
          }}
          className="cursor-pointer flex items-center gap-2.5 px-4 py-5 w-full hover:bg-white/5 hover:text-white text-[#888892] transition-all duration-150"
        >
          <i className="ri-user-3-line text-base"></i>
          <span className="font-semibold text-white">Profile</span>
        </button>
        <button
          onClick={onLogout}
          className="cursor-pointer flex items-center justify-center px-4 py-5 hover:bg-red-500/10 text-red-400 border-l border-white/[0.07] transition-all duration-150 h-full self-stretch"
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
      <aside className="hidden md:flex flex-col w-62.5 min-w-62.5 h-full bg-[#161618] border-r border-white/[0.07]">
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
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[#161618] border-r border-white/[0.07] z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
