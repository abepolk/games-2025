import React from 'react';

const RPGInterface = () => {
  // Sample messages for the console
  const messages = [
    "You enter a dark cavern. The air is thick with moisture.",
    "A goblin emerges from the shadows, snarling menacingly.",
    "The goblin attacks with a rusty dagger!",
    "You dodge the attack and counter with your sword.",
    "The goblin takes 15 damage and staggers backward."
  ];

  const playerHealth = 85;
  const playerMaxHealth = 100;
  const enemyHealth = 40;
  const enemyMaxHealth = 60;

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Adventure Quest</h1>
          <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Health Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            color="bg-red-500"
          />
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Console/Messages Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 h-96 overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <h2 className="text-sm font-medium text-gray-300">Game Console</h2>
              </div>
              <div className="p-4 h-full overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className="text-gray-300 leading-relaxed animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="text-blue-400 text-sm mr-2">▶</span>
                      {message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Command Buttons */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Combat Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Attack
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Defend
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Use Item
                </button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Special
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
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
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RPGInterface;