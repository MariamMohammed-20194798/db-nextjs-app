import React from 'react';

const HeaderSection = (props: {
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  className?: string;
  inline?: boolean;
}) => {
  return (
    <div className={`w-full ${props.className ?? ''} max-w-3xl`}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
          {props.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">
            {String(props.title)}
          </p>
          {props.inline ? (
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {String(props.desc)}
            </p>
          ) : null}
        </div>
      </div>
      {!props.inline ? (
        <div className="mt-3">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {String(props.desc)}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default HeaderSection;
