const HelpOverlay = ({ setHelpHovered, setHelpClicked, helpHovered, helpClicked }) => (
  <>
    <button
      className="
        items-center
        fixed
        top-6 right-6
        flex h-[1.2lh]
        w-[1.2lh]
        shrink-0
        justify-center
        rounded-full
        font-[Arial]
        text-2xl
        text-gray-100
        bg-[#2e406b]
        hover:bg-[#2e4680]
        cursor-pointer
      "
      onMouseEnter={() => setHelpHovered(true)}
      onMouseLeave={() => setHelpHovered(false)}
      onClick={() => setHelpClicked(clicked => !clicked)}
    >
      ?
    </button>

    <div
      className={`
        fixed
        top-1/2
        left-1/2
        w-3/4
        lg:w-2/3
        -translate-x-1/2
        -translate-y-1/2
        bg-[#2e406b]
        leading-relaxed
        p-8
        rounded-lg
        text-md
        lg:text-lg
        max-w-2xl
        ${helpHovered ? "lg:block lg:opacity-100" : "lg:hidden lg:opacity-0"}
        ${helpClicked ? "" : "hidden opacity-0"}
        transition
        transition-discrete
        starting:opacity-0
        duration-1000
        z-50
      `}
    >
      <div className="mb-4">
        <p>
          Win as many battles as you can before being defeated!
        </p>
      </div>
      <div>
        <p>
          Click "Battle" to start each battle.
        </p>
        <p>
          Click "Restart" after any battle to reset.
        </p>
        <p>
          In battle mode, click "Attack" to damage the opponent
          and click "Defend" to heal.
        </p>
        <p>
          You automatically heal a small amount between battles.
        </p>
        <p>
          Each subsequent opponent is harder than the previous.
        </p>
      </div>
    </div>
  </>
);

export default HelpOverlay;
