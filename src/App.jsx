import { useState, useRef, useEffect } from 'react'
import './App.css'

const RPGInterface = () => {
  const [messages, setMessages] = useState([
    "This is where all the messages appear.",
    "These messages are super engaging and interesting, I promise."
  ]);

  const messagesBottom = useRef(null);

  const playerHealth = 85;
  const playerMaxHealth = 100;
  const enemyHealth = 40;
  const enemyMaxHealth = 60;

  const [menu, setMenu] = useState(true);

  useEffect(() => {
    if (messagesBottom.current) {
      messagesBottom.current.scrollIntoView();
    }
  }, [messages]);

  const log = (message) => {
    setMessages(messages => [...messages, message]);
  };

  const HealthBar = ({ current, max, label, color }) => (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{current}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(current / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-center font-bold text-gray-100 mb-8">Adventure Quest</h1>

        {/* Main Game Area */}
        {/* Console/Messages Area */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <h2 className="text-sm font-medium text-gray-300">Game Console</h2>
          </div>
          <div className="p-4 h-96 overflow-y-scroll space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className="text-gray-300 leading-relaxed"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-blue-400 text-sm mr-2">▶</span>
                {message}
              </div>
            ))}
            <div ref={messagesBottom}></div>
          </div>
        </div>

        {/* Health Bars */}
        {!menu && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 space-x">
            <HealthBar
              current={playerHealth}
              max={playerMaxHealth}
              label="Player Health"
              color="bg-green-500"
            />
            <HealthBar
              current={enemyHealth}
              max={enemyMaxHealth}
              label="Enemy Health"
              color="bg-red-800"
            />
          </div>
        )}

        {/* Command Buttons */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">{!menu ? 'Combat Actions' : 'Game Options'}</h3>
            <div className="sm:grid sm:grid-cols-2 sm:gap-4 ">
              {!menu ? (
                <>
                  <button
                    className="block w-full sm:w-auto mb-4 sm:mb-0 bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    onClick={() => log("You're attacking!")}
                  >
                    Attack
                  </button>
                  <button
                    className="block w-full sm:w-auto mb-4 sm:mb-0 bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    onClick={() => log("You're shielding!")}
                  >
                    Defend
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="block w-full sm:w-auto mb-4 sm:mb-0 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    onClick={() => log("This world ain't big enough for the both of us!")}
                  >
                    Battle
                  </button>
                  <button
                    className="block w-full sm:w-auto mb-4 sm:mb-0 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    onClick={() => log("Just one more time, I'll stop soon…")}
                  >
                    Restart
                  </button>
                </>
              )}
              {/* <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Use Item
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Special
                </button> */}
            </div>
          </div>

          {/* <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">General Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Inventory
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Stats
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Run Away
                </button>
              </div>
            </div> */}
        </div>
      </div>

      {/* <style jsx>{` */}
      {/* <style>
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      </style> */}
    </div>
  );
};

export default RPGInterface;