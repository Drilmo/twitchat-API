import OBSWebSocket from "obs-websocket-js";
import { ActionType } from "twitchat";

class TwitchatApi {
  private obs: OBSWebSocket;
  private reconnectEnabled: boolean;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;

  constructor() {
    this.obs = new OBSWebSocket();
    this.reconnectEnabled = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = Infinity; // Par défaut illimité
  }

  // Connexion à OBS WebSocket
  public async connect(
    ip: string,
    port: number,
    pass: string | null,
    enableReconnect: boolean = true,
    maxAttempts: number = Infinity
  ): Promise<boolean> {
    this.reconnectEnabled = enableReconnect;
    this.maxReconnectAttempts = maxAttempts;

    try {
      await this.obs.connect(`ws://${ip}:${port}`, pass ? pass : "");
      this.reconnectAttempts = 0; // Réinitialiser les tentatives après une connexion réussie
      this.obs.on("ConnectionClosed", () => {
        if (
          this.reconnectEnabled &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnect(ip, port, pass);
        }
      });
      console.log("Connecté à OBS WebSocket");
      return true;
    } catch (error) {
      console.error("Connexion échouée, tentative de reconnexion...");
      if (
        this.reconnectEnabled &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        setTimeout(
          () =>
            this.connect(
              ip,
              port,
              pass,
              this.reconnectEnabled,
              this.maxReconnectAttempts
            ),
          5000
        ); // Attendre 5 secondes
      }
      return false;
    }
  }

  // Reconnexion automatique
  private reconnect(ip: string, port: number, pass: string | null) {
    console.log(
      `Tentative de reconnexion... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    this.connect(
      ip,
      port,
      pass,
      this.reconnectEnabled,
      this.maxReconnectAttempts
    );
  }

  // Envoi des actions à Twitchat
  private async sendMessage(type: ActionType, data: any) {
    const eventData = { origin: "twitchat", type, ...data }; // Ajout d'un champ "origin"
    try {
      await this.obs.call("BroadcastCustomEvent", { eventData });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  }

  // Actions
  public greetFeedRead() {
    this.sendMessage("GREET_FEED_READ", {});
  }

  public chatFeedRead() {
    this.sendMessage("CHAT_FEED_READ", {});
  }

  public pollToggle(status: boolean) {
    this.sendMessage("POLL_TOGGLE", { status });
  }

  public showClip(clipId: string) {
    this.sendMessage("SHOW_CLIP", { clipId });
  }

  public enableSTT(enabled: boolean) {
    this.sendMessage("ENABLE_STT", { enabled });
  }

  // Gestion des événements
  public onMessageNonFollower(handler: (data: any) => void) {
    this.obs.on("CustomEvent", (event) => {
      const { eventData } = event;
      if (
        eventData &&
        eventData.origin === "twitchat" &&
        eventData.type === "MESSAGE_NON_FOLLOWER"
      ) {
        handler(eventData);
      }
    });
  }

  public onFollow(handler: (data: any) => void) {
    this.obs.on("CustomEvent", (event) => {
      const { eventData } = event;
      if (
        eventData &&
        eventData.origin === "twitchat" &&
        eventData.type === "FOLLOW"
      ) {
        handler(eventData);
      }
    });
  }

  public onCurrentTrack(handler: (data: any) => void) {
    this.obs.on("CustomEvent", (event) => {
      const { eventData } = event;
      if (
        eventData &&
        eventData.origin === "twitchat" &&
        eventData.type === "CURRENT_TRACK"
      ) {
        handler(eventData);
      }
    });
  }

  public onCountdownComplete(handler: (data: any) => void) {
    this.obs.on("CustomEvent", (event) => {
      const { eventData } = event;
      if (
        eventData &&
        eventData.origin === "twitchat" &&
        eventData.type === "COUNTDOWN_COMPLETE"
      ) {
        handler(eventData);
      }
    });
  }

  public onVoicemodChange(handler: (data: any) => void) {
    this.obs.on("CustomEvent", (event) => {
      const { eventData } = event;
      if (
        eventData &&
        eventData.origin === "twitchat" &&
        eventData.type === "VOICEMOD_CHANGE"
      ) {
        handler(eventData);
      }
    });
  }
}

// Exporter une instance unique
export const twitchatApi = new TwitchatApi();
