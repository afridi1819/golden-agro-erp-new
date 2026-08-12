import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className={`relative bg-theme-dark border border-theme-border rounded-lg shadow-xl ${sizeClasses[size]} w-full`}>
          <div className="flex items-center justify-between p-4 border-b border-theme-border">
            <h3 className="text-lg font-semibold text-primary-400">{title}</h3>
            <button onClick={onClose} className="text-theme-muted hover:text-primary-400 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="p-4 text-gray-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;