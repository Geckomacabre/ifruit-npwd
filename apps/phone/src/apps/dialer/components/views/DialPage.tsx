import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@utils/css';
import DialGrid from '../DialPadGrid';
import { DialerInput } from '../DialerInput';
import { DialInputCtx } from '../../context/InputContext';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useCall } from '@os/call/hooks/useCall';

const DialPage: React.FC = () => {
  const query = useQueryParams();
  const queryNumber = query.number;
  const [inputVal, setInputVal] = useState(queryNumber || '');
  const { initializeCall } = useCall();

  return (
    <div className="flex w-full flex-1 flex-col">
      <DialInputCtx.Provider
        value={{
          inputVal,
          add: (val: string) => setInputVal(inputVal + val),
          removeOne: () => setInputVal(inputVal.slice(0, -1)),
          clear: () => setInputVal(''),
          set: (val: string) => setInputVal(val),
        }}
      >
        <DialerInput />

        {/* Real iOS leaves the top half empty and anchors the grid/call
            button to the bottom half of the screen. */}
        <div className="flex flex-1 flex-col items-center justify-end gap-8 pb-6">
          <DialGrid />

          <button
            type="button"
            aria-label="Call"
            disabled={!inputVal}
            onClick={() => initializeCall(inputVal)}
            className={cn(
              'flex h-[72px] w-[72px] items-center justify-center rounded-full',
              inputVal ? 'bg-green-500' : 'bg-neutral-800',
            )}
          >
            <Phone size={30} fill="currentColor" className="text-white" />
          </button>
        </div>
      </DialInputCtx.Provider>
    </div>
  );
};
export default DialPage;
