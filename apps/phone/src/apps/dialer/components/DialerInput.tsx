import React, { useContext } from 'react';
import { Delete, UserRoundPlus } from 'lucide-react';
import { DialInputCtx, IDialInputCtx } from '../context/InputContext';
import { useHistory } from 'react-router-dom';

// Real iOS shows nothing at all until you start dialing -- no placeholder,
// no box -- just the digits growing large and centered, with a backspace
// icon appearing to their right only once there's something to delete. The
// "add contact" affordance only makes sense once a number is entered too.
export const DialerInput: React.FC = () => {
  const history = useHistory();
  const { inputVal, removeOne } = useContext<IDialInputCtx>(DialInputCtx);

  const handleNewContact = (number: string) => {
    history.push(`/contacts/-1/?addNumber=${number}&referal=/phone/contacts`);
  };

  return (
    <div className="relative flex h-24 items-center justify-center px-6">
      <span className="text-[36px] tracking-wide">{inputVal}</span>

      {inputVal && (
        <>
          <button
            type="button"
            aria-label="Backspace"
            onClick={removeOne}
            className="absolute right-6 text-neutral-400"
          >
            <Delete size={26} />
          </button>
          <button
            type="button"
            aria-label="Add contact"
            onClick={() => handleNewContact(inputVal)}
            className="absolute left-6 text-neutral-400"
          >
            <UserRoundPlus size={22} />
          </button>
        </>
      )}
    </div>
  );
};
