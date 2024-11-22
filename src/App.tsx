import React, { useEffect, useState } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";

const agent_id = process.env.REACT_APP_AGENT_ID || "";

interface RegisterCallResponse {
  call_detail: {
    call_id?: string;
    sample_rate: number;
  }
}

const webClient = new RetellWebClient();

const App = () => {
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    webClient.on("conversationStarted", () => {
      console.log("conversationStarted");
    });

    webClient.on("audio", (audio: Uint8Array) => {
      console.log("There is audio");
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setIsCalling(false);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      console.log("update", update);
    });
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      webClient.stopConversation();
    } else {
      const registerCallResponse = await registerCall(agent_id);
      if (registerCallResponse.call_detail.call_id) {
        webClient
          .startConversation({
            callId: registerCallResponse.call_detail.call_id,
            sampleRate: registerCallResponse.call_detail.sample_rate,
            enableUpdate: true,
          })
          .catch(console.error);
        setIsCalling(true);
      }
    }
  };

  async function registerCall(agent_id: string): Promise<RegisterCallResponse> {
    try {
      const response = await fetch(
        "http://127.0.0.1:8080/register_call",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agent_id,
          }),
        },
      );
      console.log('✌️response --->', response);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      return data;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={toggleConversation}>
          {isCalling ? "Stop" : "Start"}
        </button>
      </header>
    </div>
  );
};

export default App;
