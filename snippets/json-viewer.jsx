// Create this file as: snippets/json-viewer.jsx

import { useState, useEffect } from 'react'

export const JsonViewer = ({ 
  initialData = null, 
  showDescriptions = true,
  allowInput = true 
}) => {
  const [jsonData, setJsonData] = useState(initialData)
  const [inputValue, setInputValue] = useState('')
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [error, setError] = useState('')

  const sampleData = {
    "company": {
      "name": "TechCorp Industries",
      "founded": 2010,
      "public": true,
      "headquarters": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA"
      },
      "employees": [
        {
          "id": 1,
          "name": "Alice Johnson",
          "position": "CEO",
          "department": "Executive"
        },
        {
          "id": 2,
          "name": "Bob Smith", 
          "position": "CTO",
          "department": "Technology"
        }
      ]
    }
  }

  const parseJson = () => {
    try {
      if (!inputValue.trim()) {
        setError('Please enter JSON data')
        return
      }
      const parsed = JSON.parse(inputValue)
      setJsonData(parsed)
      setError('')
      setCollapsed({})
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`)
      setJsonData(null)
    }
  }

  const loadSample = () => {
    setJsonData(sampleData)
    setInputValue(JSON.stringify(sampleData, null, 2))
    setError('')
    setCollapsed({})
  }

  const clearData = () => {
    setJsonData(null)
    setInputValue('')
    setError('')
    setSelectedInfo(null)
    setCollapsed({})
  }

  const toggleCollapse = (path) => {
    setCollapsed(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const handleElementClick = (info) => {
    setSelectedInfo(info)
  }

  const renderValue = (value, path = 'root', depth = 0) => {
    if (value === null) {
      return (
        <span 
          className="text-zinc-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handleElementClick({ type: 'Null', path, value: null })}
        >
          null
        </span>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <span 
          className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handleElementClick({ type: 'Boolean', path, value })}
        >
          {value.toString()}
        </span>
      )
    }

    if (typeof value === 'number') {
      return (
        <span 
          className="text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handleElementClick({ type: 'Number', path, value })}
        >
          {value}
        </span>
      )
    }

    if (typeof value === 'string') {
      return (
        <span 
          className="text-green-600 dark:text-green-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
          onClick={() => handleElementClick({ type: 'String', path, value, length: value.length })}
        >
          "{value}"
        </span>
      )
    }

    if (Array.isArray(value)) {
      const isCollapsed = collapsed[path]
      return (
        <div className="inline">
          <span 
            className="text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
            onClick={() => handleElementClick({ type: 'Array', path, length: value.length })}
          >
            [
          </span>
          {value.length > 0 && (
            <span 
              className="text-zinc-500 cursor-pointer ml-1 select-none"
              onClick={() => toggleCollapse(path)}
            >
              {isCollapsed ? '▶' : '▼'} {value.length} items
            </span>
          )}
          {!isCollapsed && value.length > 0 && (
            <div className="ml-4 border-l border-zinc-300 dark:border-zinc-600 pl-4">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  {renderValue(item, `${path}[${index}]`, depth + 1)}
                  {index < value.length - 1 && <span className="text-zinc-600">,</span>}
                </div>
              ))}
            </div>
          )}
          <span 
            className="text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
            onClick={() => handleElementClick({ type: 'Array', path, length: value.length })}
          >
            ]
          </span>
        </div>
      )
    }

    if (typeof value === 'object') {
      const isCollapsed = collapsed[path]
      const keys = Object.keys(value)
      return (
        <div className="inline">
          <span 
            className="text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
            onClick={() => handleElementClick({ type: 'Object', path, properties: keys.length })}
          >
            {'{'}
          </span>
          {keys.length > 0 && (
            <span 
              className="text-zinc-500 cursor-pointer ml-1 select-none"
              onClick={() => toggleCollapse(path)}
            >
              {isCollapsed ? '▶' : '▼'} {keys.length} properties
            </span>
          )}
          {!isCollapsed && keys.length > 0 && (
            <div className="ml-4 border-l border-zinc-300 dark:border-zinc-600 pl-4">
              {keys.map((key, index) => (
                <div key={key} className="my-1">
                  <span 
                    className="text-purple-600 dark:text-purple-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
                    onClick={() => handleElementClick({ type: 'Object Key', path: `${path}.${key}`, key })}
                  >
                    "{key}"
                  </span>
                  <span className="text-zinc-600 mx-2">:</span>
                  {renderValue(value[key], `${path}.${key}`, depth + 1)}
                  {index < keys.length - 1 && <span className="text-zinc-600">,</span>}
                </div>
              ))}
            </div>
          )}
          <span 
            className="text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-1 rounded"
            onClick={() => handleElementClick({ type: 'Object', path, properties: keys.length })}
          >
            {'}'}
          </span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 not-prose">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-2">Interactive JSON Viewer</h2>
        <p className="text-blue-100">Explore JSON data interactively</p>
      </div>

      {/* Input Section */}
      {allowInput && (
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  JSON Data
                </label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  className="w-full h-32 p-3 border border-zinc-300 dark:border-zinc-600 rounded-md font-mono text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={parseJson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Parse JSON
                </button>
                <button
                  onClick={loadSample}
                  className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-700 transition-colors"
                >
                  Load Sample
                </button>
                <button
                  onClick={clearData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex">
        {/* JSON Display */}
        <div className="flex-1 p-6 font-mono text-sm overflow-auto max-h-96">
          {jsonData ? (
            renderValue(jsonData)
          ) : (
            <div className="text-zinc-500 text-center py-8">
              {allowInput ? 'Enter JSON data above and click "Parse JSON" to begin' : 'No JSON data provided'}
            </div>
          )}
        </div>

        {/* Info Panel */}
        {showDescriptions && (
          <div className="w-80 p-6 border-l border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 overflow-auto max-h-96">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-300 dark:border-zinc-600 pb-2">
              Element Information
            </h3>
            
            {selectedInfo ? (
              <div className="space-y-3">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Type</div>
                  <div className="text-purple-600 dark:text-purple-400 font-medium">{selectedInfo.type}</div>
                </div>
                
                {selectedInfo.path && selectedInfo.path !== 'root' && (
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Path</div>
                    <div className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">{selectedInfo.path}</div>
                  </div>
                )}
                
                {selectedInfo.value !== undefined && (
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Value</div>
                    <div className="text-zinc-900 dark:text-zinc-100">{JSON.stringify(selectedInfo.value)}</div>
                  </div>
                )}
                
                {selectedInfo.length !== undefined && (
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Length</div>
                    <div className="text-zinc-900 dark:text-zinc-100">{selectedInfo.length} characters</div>
                  </div>
                )}
                
                {selectedInfo.properties !== undefined && (
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Properties</div>
                    <div className="text-zinc-900 dark:text-zinc-100">{selectedInfo.properties}</div>
                  </div>
                )}
                
                <div className="bg-white dark:bg-zinc-800 p-3 rounded border border-zinc-200 dark:border-zinc-700">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Selected At</div>
                  <div className="text-zinc-900 dark:text-zinc-100">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 italic text-center py-8">
                Click any JSON element to see details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}