function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">FlowPilot</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Save
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Test
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Run
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area — React Flow will go here */}
        <main className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Workflow Canvas (React Flow)
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 text-sm text-gray-500">
            Select a node to configure it
          </div>
        </aside>
      </div>

      {/* Bottom panel */}
      <div className="h-48 border-t border-gray-200 bg-white overflow-y-auto">
        <div className="flex gap-4 px-4 py-2 border-b border-gray-100">
          <button className="text-sm font-medium text-blue-600">Scenario Tests</button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700">Trust Score</button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700">Run History</button>
        </div>
        <div className="p-4 text-sm text-gray-400">
          Run a scenario test to see results here
        </div>
      </div>
    </div>
  );
}

export default App;
