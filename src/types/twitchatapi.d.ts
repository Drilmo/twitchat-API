declare module "twitchat-api" {
  // Déclaration de la classe TwitchatConnector
  export class TwitchatApi {
    constructor();

    /**
     * Connecte à OBS WebSocket
     * @param ip L'adresse IP de l'OBS WebSocket
     * @param port Le port de l'OBS WebSocket
     * @param pass Le mot de passe OBS WebSocket (peut être null)
     * @param enableReconnect Activer la reconnexion automatique
     * @param maxAttempts Nombre maximum de tentatives de reconnexion
     */
    connect(
      ip: string,
      port: number,
      pass: string | null,
      enableReconnect: boolean,
      maxAttempts: number
    ): Promise<boolean>;

    // Actions
    greetFeedRead(): void;
    chatFeedRead(): void;
    pollToggle(status: boolean): void;
    showClip(clipId: string): void;
    enableSTT(enabled: boolean): void;

    // Événements
    onMessageNonFollower(handler: (data: any) => void): void;
    onFollow(handler: (data: any) => void): void;
    onCurrentTrack(handler: (data: any) => void): void;
    onCountdownComplete(handler: (data: any) => void): void;
    onVoicemodChange(handler: (data: any) => void): void;
  }

  // Export d'une instance de la classe
  export const twitchatApi: TwitchatApi;
}
