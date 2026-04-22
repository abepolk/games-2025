/*
    {/* overflow-hidden is there because overflow-y-scroll, without
    overflow-hidden and a way of limiting the height of the parent
    div of the overflow-scrolling div, won't do anything. Instead,
    in this case, if the console messages try to overflow, the
    console will just get bigger to contain them, pushing the lower
    buttons out of the viewport, which is not what we want. The
    messy math for min-h is there because we want the console to be
    at least as high as the header plus one line of text, and I've
    added the top and bottom padding (2 * padding) and text size of the header along with a
    potential first message. Although it doesn't seem to do anything
    right now.
*/
const GameConsole = ({ messages, messagesBottomRef }) => (
  <div className="bg-gray-800 flex flex-col grow overflow-hidden min-h-[2_*_2_*_var(--spacing)_+_var(--text-sm)_+_2_*_4_var(--spacing)_+_var(--text-sm))] rounded-lg border border-gray-700 mb-8">
    <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
      <h2 className="text-sm font-medium text-gray-300">Game Console</h2>
    </div>
    <div className="p-4 overflow-y-scroll">
      {messages && messages.map((message, index) => (
        <div
          key={index}
          className="text-gray-300 leading-relaxed"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className="text-blue-400 text-sm mr-2">▶</span>
          {message}
        </div>
      ))}
      <div ref={messagesBottomRef}></div>
    </div>
  </div>
);

export default GameConsole;
