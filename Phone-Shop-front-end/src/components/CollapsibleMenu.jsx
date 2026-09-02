import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CollapsibleMenu = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className='border-b border-gray-800'>
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between py-3 text-left font-semibold text-white hover:text-blue-400 transition'
      >
        <span>{title}</span>
        <FaChevronDown className={`text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className='pb-3 pl-2'>{children}</div>}
    </div>
  );
};

export default CollapsibleMenu;