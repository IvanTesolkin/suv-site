"use client";
import classNames from 'classnames';

interface ModeTabsProps {
  modes: { id: string; label: string }[];
  value: string;
  onChange: (mode: string) => void;
}

/**
 * A simple tab component used to switch between booking modes. It
 * accepts a list of modes with ids and labels and calls the
 * `onChange` callback when a tab is selected. The currently active
 * mode is highlighted.
 */
export default function ModeTabs({ modes, value, onChange }: ModeTabsProps) {
  return (
    <div className="flex border-b border-gray-700 mb-4">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={classNames(
            'px-4 py-2 -mb-px focus:outline-none',
            value === mode.id
              ? 'border-b-2 border-primary text-primary'
              : 'border-b-2 border-transparent text-gray-400 hover:text-primary'
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}