import { Link } from "react-router-dom";
export default function Error() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold ">404: Page Not Found</h2>
          </div>
          <div className="text-center">
            <p className="mt-2 text-sm">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="mt-8">
              <Link
                to="/"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium  bg-indigo-600 hover:bg-indigo-700"
              >
                Go back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  