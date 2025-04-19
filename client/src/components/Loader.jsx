const Loader = ({ progress, message }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
            </div>
            
            {message && (
              <p className="text-gray-700 text-center mb-3">{message}</p>
            )}
            
            {typeof progress === 'number' && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default Loader;