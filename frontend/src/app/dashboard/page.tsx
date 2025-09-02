"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: number;
  email: string;
  credits: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [creditChange, setCreditChange] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const userData = localStorage.getItem("user");

  //   if (!token || !userData) {
  //     router.push("/");
  //     return;
  //   }

  //   const userObj = JSON.parse(userData);
  //   setUser(userObj);
  //   setCredits(userObj.credits);

  //   // Connect to WebSocket
  //   const websocket = new WebSocket(`ws://localhost:8000?token=${token}`);

  //   websocket.onopen = () => {
  //     console.log("WebSocket connected successfully");
  //   };

  //   websocket.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === "credit_update") {
  //         setCredits(data.credits);

  //         // Update local storage - USE userObj FROM OUTER SCOPE
  //         const updatedUser = { ...userObj, credits: data.credits };
  //         localStorage.setItem("user", JSON.stringify(updatedUser));
  //         setUser(updatedUser);
  //       }
  //     } catch (error) {
  //       console.error("Error parsing WebSocket message:", error);
  //     }
  //   };

  //   websocket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     setMessage("WebSocket connection failed. Real-time updates disabled.");
  //   };

  //   websocket.onclose = (event) => {
  //     console.log("WebSocket closed:", event.code, event.reason);
  //   };
  //   setWs(websocket);

  //   // Check if user has active session
  //   checkActiveSession(token);

  //   return () => {
  //     if (websocket) {
  //       websocket.close();
  //     }
  //   };
  // }, [router]);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const userData = localStorage.getItem("user");

  //   if (!token || !userData) {
  //     router.push("/");
  //     return;
  //   }

  //   const userObj = JSON.parse(userData);
  //   setUser(userObj);
  //   setCredits(userObj.credits);

  //   // Connect to WebSocket
  //   const websocket = new WebSocket(`ws://localhost:8000?token=${token}`);

  //   websocket.onopen = () => {
  //     console.log("✅ WebSocket connected successfully to port 8000");
  //     setWsConnected(true);
  //   };

  //   websocket.onmessage = (event) => {
  //     try {
  //       console.log("📨 Raw WebSocket message:", event.data);

  //       const data = JSON.parse(event.data);
  //       console.log("📦 Parsed WebSocket data:", data);

  //       if (data.type === "credit_update") {
  //         console.log("💰 Credit update received:", data.credits);

  //         setCredits(data.credits);
  //         console.log("UI should update to:", data.credits);
  //         // Use userObj from outer scope instead of user state
  //         const updatedUser = { ...userObj, credits: data.credits };
  //         localStorage.setItem("user", JSON.stringify(updatedUser));
  //         setUser(updatedUser);

  //         console.log("✅ UI updated with new credits:", data.credits);
  //       } else {
  //         console.log("ℹ️ Other WebSocket message type:", data.type);
  //       }
  //     } catch (error) {
  //       console.error("❌ Error parsing WebSocket message:", error, event.data);
  //     }
  //   };

  //   websocket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     setMessage("WebSocket connection failed. Real-time updates disabled.");
  //   };

  //   websocket.onclose = (event) => {
  //     console.log("🔌 WebSocket closed:", event.code, event.reason);
  //     setWsConnected(false);
  //   };

  //   setWs(websocket);

  //   // Check if user has active session
  //   checkActiveSession(token);

  //   return () => {
  //     if (websocket) {
  //       websocket.close();
  //     }
  //   };
  // }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/");
      return;
    }

    const userObj = JSON.parse(userData);

    // First set the user from localStorage
    setUser(userObj);
    setCredits(userObj.credits);

    // Fetch ACTUAL current credits from backend
    const fetchCurrentCredits = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/sessions/credits",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update with actual current credits
        setCredits(response.data.credits);

        // Update localStorage with correct value
        const updatedUser = { ...userObj, credits: response.data.credits };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        console.log("✅ Loaded current credits:", response.data.credits);
      } catch (error) {
        console.error("❌ Failed to fetch current credits:", error);
        // Fallback to localStorage value if API fails
      } finally {
        setInitialLoading(false); // Loading complete
      }
    };

    fetchCurrentCredits();

    // Connect to WebSocket
    const websocket = new WebSocket(`ws://localhost:8000?token=${token}`);

    websocket.onopen = () => {
      console.log("✅ WebSocket connected successfully");
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "credit_update") {
          setCredits(data.credits);

          // Update localStorage and user state
          const updatedUser = { ...userObj, credits: data.credits };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
    };

    setWs(websocket);
    checkActiveSession(token);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [router]);

  const checkActiveSession = async (token: string) => {
    try {
      // You'll need to implement this endpoint in your backend
      const response = await axios.get(
        "http://localhost:8000/api/sessions/active",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSessionActive(response.data.active);
    } catch (error) {
      setSessionActive(false);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/sessions/start",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionActive(true);
      setMessage("Session started");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const stopSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/sessions/stop",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionActive(false);
      setMessage(
        `Session stopped. Credits consumed: ${response.data.creditsConsumed}`
      );

      // Update user credits
      if (user) {
        const updatedUser = { ...user, credits };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to stop session");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (ws) ws.close();
    router.push("/");
  };

  if (!user || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading current credit balance...</div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gray-100">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex justify-between items-center py-6">
    //       <h1 className="text-3xl font-bold text-gray-900">
    //         Minute-Credit Dashboard
    //       </h1>
    //       <div className="flex items-center space-x-4">
    //         <span>Welcome, {user.email}</span>
    //         <button
    //           onClick={logout}
    //           className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    //         >
    //           Logout
    //         </button>
    //       </div>
    //     </div>

    //     <div className="bg-white shadow rounded-lg p-6 mb-6">
    //       <h2 className="text-2xl font-semibold mb-4">Credit Balance</h2>
    //       <div className="flex items-center justify-center">
    //         <div className="text-4xl font-bold text-indigo-600">
    //           {credits} credits
    //         </div>
    //         {creditChange && (
    //           <span className="ml-4 text-red-500 text-xl animate-pulse">
    //             -{creditChange}
    //           </span>
    //         )}
    //       </div>
    //       <p className="text-gray-600 mt-2">
    //         10 credits deducted per minute (1 credit every 6 seconds)
    //       </p>
    //       {/* Add connection status */}
    //       <div
    //         className={`mt-2 text-sm ${
    //           wsConnected ? "text-green-600" : "text-red-600"
    //         }`}
    //       >
    //         {wsConnected
    //           ? "✅ Live updates connected"
    //           : "❌ Live updates disconnected"}
    //       </div>
    //       {sessionActive && (
    //         <p className="text-green-600 mt-1">✓ Real-time updates active</p>
    //       )}
    //     </div>

    //     <div className="bg-white shadow rounded-lg p-6 mb-6">
    //       <h2 className="text-2xl font-semibold mb-4">Session Control</h2>
    //       <div className="flex space-x-4">
    //         <button
    //           onClick={startSession}
    //           disabled={loading || sessionActive || credits <= 0}
    //           className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    //         >
    //           Start Session
    //         </button>
    //         <button
    //           onClick={stopSession}
    //           disabled={loading || !sessionActive}
    //           className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    //         >
    //           Stop Session
    //         </button>
    //       </div>
    //       {message && (
    //         <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
    //           {message}
    //         </div>
    //       )}
    //       {sessionActive && (
    //         <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
    //           Session active. Credits are being deducted in real-time.
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Minute-Credit Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credit Balance Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Credit Balance
            </h2>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-5xl font-extrabold text-indigo-600">
                {credits} credits
              </div>
              {creditChange && (
                <span className="text-red-500 text-lg animate-pulse">
                  -{creditChange}
                </span>
              )}
              <p className="text-gray-500 text-sm">
                10 credits deducted per minute (1 credit every 6 seconds)
              </p>
            </div>
            {/* Connection Status */}
            <div className="mt-4 text-center">
              <p
                className={`text-sm font-medium ${
                  wsConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {wsConnected
                  ? "✅ Live updates connected"
                  : "❌ Live updates disconnected"}
              </p>
              {sessionActive && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ Real-time updates active
                </p>
              )}
            </div>
          </div>

          {/* Session Control */}
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Session Control
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={startSession}
                disabled={loading || sessionActive || credits <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                Start Session
              </button>
              <button
                onClick={stopSession}
                disabled={loading || !sessionActive}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                Stop Session
              </button>
            </div>

            {/* Messages */}
            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
                {message}
              </div>
            )}
            {sessionActive && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                ⚡ Session active. Credits are being deducted in real-time.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
