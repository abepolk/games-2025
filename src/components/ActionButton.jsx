const ActionButton = ({
  text,
  baseColor,
  hoverClass,
  disabledBgClass,
  disabledClass,
  spanWholeWidth,
  actionCallback,
  enabled
}) => (
  <button
    className={`block
    w-full
    sm:w-auto
    mb-4
    sm:mb-0
    ${baseColor}
    ${(hoverClass && enabled) ? hoverClass : ""}
    ${disabledBgClass ? disabledBgClass : ""}
    ${disabledClass ? disabledClass : ""}
    ${spanWholeWidth ? "col-span-2" : ""}
    text-white
    font-medium
    py-2
    px-4
    rounded-lg
    transition-colors
    duration-100
    `}
    disabled={!enabled}
    onClick={actionCallback}
  >
    {text}
  </button>
);

export default ActionButton;