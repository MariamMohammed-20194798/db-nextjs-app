import React from 'react';

type Props = {};

const HeaderSection = (props: {
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  className?: string;
  inline?: boolean;
}) => {
  return (
    <div className={`w-full ${props.className} max-w-[650px]`}>
      <div className="flex items-center gap-2 mb-0">
        <div className="w-auto h-auto">{props.icon}</div>

        <div className="flex flex-col">
          <p className="font-bold text-large leading-5 line-clamp-1">
            {String(props.title)}
          </p>
          {props.inline ? (
            <p className="text-small opacity-60 leading-5 line-clamp-1">
              {String(props.desc)}
            </p>
          ) : (
            ''
          )}
        </div>
      </div>
      {!props.inline ? (
        <div>
          <p className="text-small opacity-80">{String(props.desc)}</p>
        </div>
      ) : null}
    </div>
  );
};

export default HeaderSection;
