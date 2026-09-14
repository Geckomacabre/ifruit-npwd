import React, { useContext } from 'react';
import { DialInputCtx } from '../context/InputContext';

// Real iOS keypad: 12 circular keys (1-9, *, 0, #), each with its letter
// group in small caps underneath -- 0 gets a small "+" instead of letters,
// * and # get nothing. The old grid had a 13th "-" key and mapped * to
// clear-all / # to backspace, neither of which exist on a real dial pad --
// every key here just appends its own character.
const KEYS: { digit: string; sub?: string }[] = [
  { digit: '1' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*' },
  { digit: '0', sub: '+' },
  { digit: '#' },
];

export const DialGrid: React.FC = () => {
  const { add } = useContext(DialInputCtx);

  return (
    // w-full is load-bearing: a bare grid inside a flex column sizes to its
    // own content, not the available width, so the three columns clustered
    // together in a narrow strip instead of spreading across the screen the
    // way a real dial pad does.
    <div className="grid w-full grid-cols-3 justify-items-center gap-y-5 px-8">
      {KEYS.map(({ digit, sub }) => (
        <button
          key={digit}
          type="button"
          onClick={() => add(digit)}
          className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-neutral-800 text-white active:bg-neutral-700"
        >
          <span className="text-[32px] leading-none">{digit}</span>
          {sub && <span className="mt-1 text-[11px] tracking-[2px] text-neutral-300">{sub}</span>}
        </button>
      ))}
    </div>
  );
};

export default DialGrid;
